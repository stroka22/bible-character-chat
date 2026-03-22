import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const NOTIFY_EMAIL = 'support@faithtalkai.com'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const { record } = await req.json()
    
    if (!record) {
      return new Response(JSON.stringify({ error: 'No record provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const userEmail = record.email || 'Unknown'
    const displayName = record.display_name || record.full_name || 'Not provided'
    const createdAt = record.created_at ? new Date(record.created_at).toLocaleString() : 'Unknown'

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return new Response(JSON.stringify({ error: 'Email not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px;">
        <h2 style="color: #7c3aed;">New FaithTalkAI Signup!</h2>
        <p>A new user has created an account:</p>
        <ul style="line-height: 1.8;">
          <li><strong>Email:</strong> ${userEmail}</li>
          <li><strong>Name:</strong> ${displayName}</li>
          <li><strong>Signed up:</strong> ${createdAt}</li>
        </ul>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          View all users in <a href="https://faithtalkai.com/admin/users">Admin Dashboard</a>
        </p>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'FaithTalkAI <notifications@mail.faithtalkai.com>',
        to: [NOTIFY_EMAIL],
        subject: `New Signup: ${userEmail}`,
        html: emailHtml,
      }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Resend error:', errorText)
      return new Response(JSON.stringify({ error: 'Failed to send email', details: errorText }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
