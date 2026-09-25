import { NextRequest, NextResponse } from "next/server";

// Deployed as a Netlify Function (Next.js Route Handlers on Netlify's
// zero-config Next.js runtime become serverless functions automatically -
// no netlify.toml needed). This is the ONLY place the Telegram bot token
// touches - it lives in a server-side env var here, never NEXT_PUBLIC_*, so
// it never reaches the browser bundle. Mirrors ap-be's own
// app.telegram.bot-token/chat-id convention (see TelegramServiceImpl),
// just duplicated into Netlify's env vars since this runs on entirely
// separate infra from the Spring Boot backend and can't reach into it.
//
// The X-Alert-Key check below is NOT real authentication - it's a
// NEXT_PUBLIC_* value, so it ships in the client bundle same as any other
// public constant. It exists only to raise the bar above "anyone who
// finds this URL can spam the chat with a canned message", not to
// meaningfully gate access - there's no way to do better than that
// without real user auth, and this endpoint doesn't touch anything worth
// that cost.
export async function POST(request: NextRequest) {
  const expectedKey = process.env.TELEGRAM_ALERT_KEY;
  const providedKey = request.headers.get("X-Alert-Key");
  if (!expectedKey || providedKey !== expectedKey) {
    return NextResponse.json({ success: false }, { status: 403 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    return NextResponse.json({ success: false, error: "Telegram not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text:
          "\u{1F4A4} Admin Portal demo backend has gone idle (no activity for 15+ min) - " +
          "it'll cold-start on the next visit. Worth a warm-up ping before a demo.",
      }),
    });
    if (!res.ok) {
      return NextResponse.json({ success: false, error: await res.text() }, { status: 502 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "unknown error" },
      { status: 502 }
    );
  }
}
