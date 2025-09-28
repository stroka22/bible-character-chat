import puppeteer from 'puppeteer';
import dotenv from 'dotenv';

dotenv.config();

const BASE = process.env.TEST_BASE_URL || 'http://localhost:5173';

async function login(page, email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[name="email"]', { timeout: 15000 });
  await page.type('input[name="email"]', email, { delay: 10 });
  await page.type('input[name="password"]', password, { delay: 10 });
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {}),
  ]);
}

async function ensureAdminUsersPage(page) {
  await page.goto(`${BASE}/admin/users`, { waitUntil: 'domcontentloaded' });
  // Either the Users table or Access Denied block
  await page.waitForSelector('body', { timeout: 15000 });
  const content = await page.content();
  if (!/Manage Users|Access Denied/i.test(content)) {
    throw new Error('Admin Users page did not render expected content');
  }
}

async function testStudyAutoIntroAndSave(page, { charId, studyId, lessonIndex }) {
  const url = `${BASE}/chat?character=${encodeURIComponent(charId)}&study=${encodeURIComponent(studyId)}&lesson=${lessonIndex}`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // Wait for intro message to show (assistant message includes Greeting)
  await page.waitForTimeout(1000);
  const introAppeared = await page.waitForFunction(
    () => document.body.innerText.toLowerCase().includes("greetings! i'm") ||
          document.body.innerText.includes('Saved conversation'),
    { timeout: 30000 }
  ).then(() => true).catch(() => false);

  // Saved conversation badge should appear after auto-save kicks in
  const savedAppeared = await page.waitForFunction(
    () => document.body.innerText.includes('Saved conversation'),
    { timeout: 30000 }
  ).then(() => true).catch(() => false);

  return { introAppeared, savedAppeared };
}

(async () => {
  const results = { ok: true, steps: {} };
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(30000);

    // 1) Login as superadmin
    await login(page, process.env.TEST_SUPERADMIN_EMAIL || 'stroka22@yahoo.com', process.env.TEST_SUPERADMIN_PASSWORD || 'Peace#212');
    results.steps.login = 'ok';

    // 2) Admin Users page renders
    await ensureAdminUsersPage(page);
    results.steps.adminUsers = 'ok';

    // 3) Study deep-link → auto intro + auto save
    const charId = process.env.TEST_CHAR_ID || 'REQUIRED';
    const studyId = process.env.TEST_STUDY_ID || 'REQUIRED';
    const lessonIndex = parseInt(process.env.TEST_LESSON_INDEX || '0', 10);
    if (charId === 'REQUIRED' || studyId === 'REQUIRED') {
      throw new Error('Missing TEST_CHAR_ID or TEST_STUDY_ID');
    }
    const { introAppeared, savedAppeared } = await testStudyAutoIntroAndSave(page, { charId, studyId, lessonIndex });
    results.steps.studyIntro = introAppeared ? 'ok' : 'fail';
    results.steps.studyAutoSave = savedAppeared ? 'ok' : 'fail';
    results.ok = results.ok && introAppeared && savedAppeared;

  } catch (e) {
    results.ok = false;
    results.error = e.message || String(e);
  } finally {
    await browser.close();
    console.log(JSON.stringify(results, null, 2));
  }
})();
