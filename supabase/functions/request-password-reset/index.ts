
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const genericResponse = {
  success: true,
  message:
    'If an account exists for that email address, a verification code may be sent. If it does not arrive, please try again later.',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

async function hmacHash(
  value: string,
  secret: string,
): Promise<string> {
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(value),
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function generateOtp(): string {
  const range = 1_000_000;
  const maxValid = Math.floor(0x1_0000_0000 / range) * range;
  const random = new Uint32Array(1);

  do {
    crypto.getRandomValues(random);
  } while (random[0] >= maxValid);

  return String(random[0] % range).padStart(6, '0');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const resetFromEmail = Deno.env.get('RESET_FROM_EMAIL');
    const otpHashSecret = Deno.env.get('OTP_HASH_SECRET');

    if (
      !supabaseUrl ||
      !serviceRoleKey ||
      !resendApiKey ||
      !resetFromEmail ||
      !otpHashSecret
    ) {
      console.error('Password reset secrets are not fully configured.');

      return jsonResponse(
        { error: 'Service temporarily unavailable.' },
        500,
      );
    }

    if (!resetFromEmail.includes('@zariapp.co.za')) {
      console.error('RESET_FROM_EMAIL is not using the Zari domain.');

      return jsonResponse(
        { error: 'Email sender configuration is invalid.' },
        500,
      );
    }

    let body: { email?: unknown };

    try {
      body = await req.json();
    } catch {
      return jsonResponse(
        { error: 'Invalid request body.' },
        400,
      );
    }

    const email = String(body.email ?? '')
      .trim()
      .toLowerCase();

    if (
      !email ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return jsonResponse(
        { error: 'Please enter a valid email address.' },
        400,
      );
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    const otp = generateOtp();
    const otpHash = await hmacHash(otp, otpHashSecret);

    const ipAddress =
      req.headers.get('cf-connecting-ip') ??
      req.headers.get('x-real-ip');

    const ipHash = ipAddress
      ? await hmacHash(ipAddress, otpHashSecret)
      : null;

    const { data, error } = await supabase.rpc(
      'create_password_reset_request',
      {
        p_email: email,
        p_otp_hash: otpHash,
        p_ip_hash: ipHash,
      },
    );

    if (error || !data?.request_id) {
      console.error(
        'Password reset request RPC failed:',
        error?.message ?? 'Missing request ID',
      );

      return jsonResponse(
        {
          error:
            'Unable to request a password reset. Please try again.',
        },
        500,
      );
    }

    if (
      data.should_send === true &&
      data.email
    ) {
      const emailResponse = await fetch(
        'https://api.resend.com/emails',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: resetFromEmail,
            to: [data.email],
            subject: 'Your Zari password reset code',
            html: `
              <!DOCTYPE html>
              <html>
                <body style="margin:0;padding:30px;background:#f8fafc;font-family:Arial,sans-serif;color:#222;">
                  <div style="max-width:520px;margin:auto;background:#ffffff;border-radius:12px;padding:30px;">
                    <h2 style="color:#16a34a;">Reset your Zari password</h2>

                    <p>We received a request to reset your Zari account password.</p>

                    <p>Use the verification code below:</p>

                    <div style="font-size:34px;font-weight:bold;letter-spacing:10px;padding:20px;background:#f0fdf4;text-align:center;border-radius:8px;color:#166534;">
                      ${otp}
                    </div>

                    <p>This verification code expires in <strong>10 minutes</strong>.</p>

                    <p>If you did not request this reset, you can safely ignore this email.</p>

                    <hr style="border:none;border-top:1px solid #e2e8f0;margin:25px 0;" />

                    <p style="font-size:12px;color:#64748b;">
                      Regards,<br />
                      The Zari Team
                    </p>
                  </div>
                </body>
              </html>
            `,
          }),
        },
      );

      const resendResult = await emailResponse.json().catch(() => null);

      if (!emailResponse.ok) {
        console.error('Resend delivery failed:', {
          status: emailResponse.status,
          response: resendResult,
        });
      } else {
        console.log('Resend accepted password reset email:', {
          emailId: resendResult?.id ?? 'No email ID returned',
          status: emailResponse.status,
        });
      }
    }

    return jsonResponse({
      ...genericResponse,
      requestId: data.request_id,
    });
  } catch (error) {
    console.error('Request password reset error:', error);

    return jsonResponse(
      {
        error:
          'Unable to request a password reset. Please try again.',
      },
      500,
    );
  }
});
