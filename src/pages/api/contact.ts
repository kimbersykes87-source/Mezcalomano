import type { APIRoute } from 'astro';

interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string;
  recaptcha: string;
}

interface MailChannelsPayload {
  personalizations: Array<{
    to: Array<{ email: string; name?: string }>;
    reply_to?: { email: string };
  }>;
  from: { email: string; name: string };
  subject: string;
  content: Array<{
    type: string;
    value: string;
  }>;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body: ContactRequest = await request.json();

    // Honeypot check
    if (body.website) {
      return new Response(JSON.stringify({ success: false, error: 'Spam detected' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate required fields
    if (!body.name || !body.email || !body.subject || !body.message || !body.recaptcha) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify reCAPTCHA
    const recaptchaSecret = import.meta.env.RECAPTCHA_SECRET;
    if (!recaptchaSecret) {
      console.error('RECAPTCHA_SECRET not configured');
      return new Response(JSON.stringify({ success: false, error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const recaptchaVerifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const recaptchaResponse = await fetch(recaptchaVerifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: recaptchaSecret,
        response: body.recaptcha,
      }),
    });

    const recaptchaResult = await recaptchaResponse.json();
    if (!recaptchaResult.success) {
      return new Response(JSON.stringify({ success: false, error: 'reCAPTCHA verification failed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Send email via MailChannels
    const mailPayload: MailChannelsPayload = {
      personalizations: [
        {
          to: [{ email: 'hola@mezcalomano.com', name: 'Mezcalómano' }],
          reply_to: { email: body.email },
        },
      ],
      from: {
        email: 'noreply@mezcalomano.com',
        name: 'Mezcalómano Contact Form',
      },
      subject: `Contact Form: ${body.subject}`,
      content: [
        {
          type: 'text/plain',
          value: `New contact form submission from ${body.name} (${body.email})\n\nSubject: ${body.subject}\n\nMessage:\n${body.message}`,
        },
        {
          type: 'text/html',
          value: `
            <html>
              <body>
                <h2>New Contact Form Submission</h2>
                <p><strong>From:</strong> ${body.name} (${body.email})</p>
                <p><strong>Subject:</strong> ${body.subject}</p>
                <p><strong>Message:</strong></p>
                <p>${body.message.replace(/\n/g, '<br>')}</p>
              </body>
            </html>
          `,
        },
      ],
    };

    const mailResponse = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mailPayload),
    });

    if (!mailResponse.ok) {
      const errorText = await mailResponse.text();
      console.error('MailChannels error:', errorText);
      return new Response(JSON.stringify({ success: false, error: 'Failed to send email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Message sent successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
