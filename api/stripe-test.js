/**
 * Next.js API route handler to serve a static HTML file.
 * This is a workaround for Vercel's SPA routing which can intercept
 * direct requests to HTML files in the /public folder.
 *
 * @param {import('next').NextApiRequest} req The incoming request object.
 * @param {import('next').NextApiResponse} res The outgoing response object.
 */
export default function handler(req, res) {
  try {
    // Inline HTML content – avoids filesystem look-ups in serverless envs.
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Stripe Test Page</title>
        <script src="https://js.stripe.com/v3/"></script>
        <style>
          body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
               display:flex;align-items:center;justify-content:center;height:100vh;margin:0;
               background:#f0f2f5;color:#333}
          .wrapper{max-width:600px;background:#fff;padding:40px;border-radius:8px;
                   box-shadow:0 2px 12px rgba(0,0,0,.15)}
          input,button{padding:10px 14px;font-size:16px;border:1px solid #ccc;border-radius:4px;width:100%}
          button{cursor:pointer;background:#0ea5e9;color:#fff;border:none;margin-top:12px}
        </style>
      </head>
      <body>
        <div class="wrapper">
          <h2>Stripe Test Checkout</h2>
          <p>This page is served directly from an API route to bypass SPA routing.</p>
          <input id="priceId" placeholder="price_..." />
          <button id="goBtn">Go to Checkout</button>
        </div>
        <script>
          document.getElementById('goBtn').addEventListener('click',()=>{
            const pid=document.getElementById('priceId').value.trim();
            if(pid){window.location.href='https://checkout.stripe.com/pay/'+pid;}
          });
        </script>
      </body>
      </html>
    `;
    
    // Set the appropriate headers for an HTML response.
    // 'Content-Type': 'text/html' tells the browser to render the response as a webpage.
    // 'Cache-Control': 'no-store' prevents the browser and CDNs from caching this response,
    // ensuring we always get the latest version during testing.
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-store, must-revalidate');
    
    // Send the HTML content with a 200 OK status.
    res.status(200).send(htmlContent);
  } catch (error) {
    console.error('Error serving Stripe test page:', error);
    
    // Send a generic 500 Internal Server Error response to the client.
    res.status(500).json({ error: 'Failed to load the Stripe test page due to a server error.' });
  }
}
