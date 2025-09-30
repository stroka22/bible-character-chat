import puppeteer from 'puppeteer';
const url = 'https://faithtalkai.com/series';
const timeout = 45000;
(async () => {
  const browser = await puppeteer.launch({headless: 'new'});
  const page = await browser.newPage();
  page.setDefaultTimeout(timeout);
  const errors = [];
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'error') errors.push(`console.${type}: ${msg.text()}`);
  });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
  await page.waitForSelector('#root, body');
  const title = await page.title();
  const html = await page.content();
  await page.screenshot({ path: './series_check.png', fullPage: true });
  console.log(JSON.stringify({ ok: true, title, hasSeriesRoute: html.toLowerCase().includes('/series'), errors }));
  await browser.close();
})().catch(async (err) => {
  console.error(JSON.stringify({ ok: false, error: err.message }));
  process.exit(1);
});
