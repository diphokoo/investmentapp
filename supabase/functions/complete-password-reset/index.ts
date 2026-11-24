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
      resetToken?: unknown;
      newPassword?: unknown;
    };

    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid request body." }, 400);
    }

    const requestId = String(body.requestId ?? "").trim();
    const resetToken = String(body.resetToken ?? "").trim();
    const newPassword = body.newPassword;

    const requestIdIsValid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        requestId,
      );

    if (!requestIdIsValid) {
      return jsonResponse(
        { error: "Invalid or expired password reset request." },
        400,
      );
    }

    if (
      !/^[A-Za-z0-9_-]{43}$/.test(resetToken)
    ) {
      return jsonResponse(
        { error: "Invalid or expired password reset token." },
        400,
      );
    }

    if (
      typeof newPassword !== "string" ||
      newPassword.length < 8 ||
      newPassword.length > 128
    ) {
      return jsonResponse(
        { error: "Password must be between 8 and 128 characters." },
        400,
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const resetTokenHash = await hmacHash(
      resetToken,
      otpHashSecret,
    );

    const { data, error } = await supabase.rpc(
      "complete_password_reset",
      {
        p_request_id: requestId,
        p_reset_token_hash: resetTokenHash,
        p_new_password: newPassword,
      },
    );

    if (error) {
      console.error("Complete password reset RPC failed:", error.message);

      return jsonResponse(
        {
          success: false,
          error: "Unable to reset your password. Please try again.",
        },
        400,
      );
    }

    if (data?.success !== true) {
      return jsonResponse(
        {
          success: false,
          error: "Invalid or expired password reset request.",
        },
        400,
      );
    }

    return jsonResponse({
      success: true,
      message: "Your password has been reset successfully.",
    });
  } catch (error) {
    console.error("Complete password reset error:", error);

    return jsonResponse(
      {
        success: false,
        error: "Something went wrong. Please try again.",
      },
      500,
    );
  }
});