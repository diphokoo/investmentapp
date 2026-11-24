import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

async function hmacHash(
  value: string,
  secret: string,
): Promise<string> {
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(value),
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function generateResetToken(): string {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);

  let binary = "";

  for (const byte of randomBytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const otpHashSecret = Deno.env.get("OTP_HASH_SECRET");

    if (!supabaseUrl || !serviceRoleKey || !otpHashSecret) {
      console.error("Password reset secrets are not fully configured.");
      return jsonResponse(
        { error: "Service temporarily unavailable." },
        500,
      );
    }

    let body: {
      requestId?: unknown;
      otp?: unknown;
    };

    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid request body." }, 400);
    }

    const requestId = String(body.requestId ?? "").trim();
    const otp = String(body.otp ?? "").trim();

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        requestId,
      )
    ) {
      return jsonResponse({ error: "Invalid reset request." }, 400);
    }

    if (!/^\d{6}$/.test(otp)) {
      return jsonResponse(
        { error: "Please enter a valid six-digit code." },
        400,
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const resetToken = generateResetToken();

    const otpHash = await hmacHash(otp, otpHashSecret);
    const resetTokenHash = await hmacHash(
      resetToken,
      otpHashSecret,
    );

    const { data, error } = await supabase.rpc(
      "verify_password_reset_otp",
      {
        p_request_id: requestId,
        p_otp_hash: otpHash,
        p_reset_token_hash: resetTokenHash,
      },
    );

    if (error) {
      console.error("OTP verification RPC failed:", error.message);

      return jsonResponse({
        success: false,
        error: "Invalid or expired verification code.",
      });
    }

    if (data?.success !== true) {
      return jsonResponse({
        success: false,
        error: "Invalid or expired verification code.",
      });
    }

    return jsonResponse({
      success: true,
      resetToken,
      message: "Verification successful.",
    });
  } catch (error) {
    console.error("Verify password reset error:", error);

    return jsonResponse({
      success: false,
      error: "Unable to verify the code. Please try again.",
    });
  }
});