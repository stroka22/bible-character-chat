async function fetchWithTimeout(url, options, timeoutMs = 2000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } catch (error) {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function notifyLead(lead) {
  if (!lead || typeof lead !== 'object' || !lead.email) {
    return;
  }

  const normalizedLead = {
    email: lead.email,
    name: lead.name ?? null,
    phone: lead.phone ?? null,
    role: lead.role ?? 'user',
    consent_email: !!lead.consent_email,
    consent_sms: !!lead.consent_sms,
    source_path: lead.source_path ?? null,
    utm_source: lead.utm_source ?? null,
    utm_medium: lead.utm_medium ?? null,
    utm_campaign: lead.utm_campaign ?? null,
  };

  try {
    await Promise.all([
      notifyWebhook(normalizedLead),
      notifyGoHighLevel(normalizedLead),
      notifyTwilio(normalizedLead)
    ]);
  } catch (error) {
    // Ignore any errors
  }
}

async function notifyWebhook(lead) {
  const webhookUrl = process.env.LEADS_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetchWithTimeout(
      webhookUrl,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead)
      }
    );
  } catch (error) {
    // Ignore errors
  }
}

async function notifyGoHighLevel(lead) {
  const apiKey = process.env.GHL_API_KEY;
  if (!apiKey) return;

  try {
    const tags = [];
    if (lead.utm_source) tags.push(lead.utm_source);
    if (lead.utm_campaign) tags.push(lead.utm_campaign);

    const payload = {
      email: lead.email,
      firstName: lead.name,
      phone: lead.phone,
      source: lead.source_path || 'website',
      tags
    };

    await fetchWithTimeout(
      'https://rest.gohighlevel.com/v1/contacts/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      }
    );
  } catch (error) {
    // Ignore errors
  }
}

async function notifyTwilio(lead) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  const to = process.env.TWILIO_TO;

  if (!accountSid || !authToken || !from || !to) return;

  try {
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const formData = new URLSearchParams();
    formData.append('To', to);
    formData.append('From', from);
    formData.append('Body', `New lead captured: ${lead.email} (${lead.name || 'unnamed'})`);

    await fetchWithTimeout(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${auth}`
        },
        body: formData
      }
    );
  } catch (error) {
    // Ignore errors
  }
}
