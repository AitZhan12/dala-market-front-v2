// Username Telegram-бота подтверждения номера (без @).
// На проде можно переопределить через VITE_TELEGRAM_BOT.
export const BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT ?? 'dala_mart_bot';

// Диплинк, который сразу передаёт боту код: t.me/<bot>?start=<code>
export const botVerifyLink = (code: string) =>
  `https://t.me/${BOT_USERNAME}?start=${encodeURIComponent(code)}`;
