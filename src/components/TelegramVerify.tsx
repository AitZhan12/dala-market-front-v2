import { useEffect, useRef, useState } from 'react';
import { authApi } from '../services/api';
import { BOT_USERNAME, botVerifyLink } from '../config';

/**
 * Карточка подтверждения номера через Telegram-бота.
 * Кнопка открывает бота с уже переданным кодом, пользователь делится контактом,
 * статус подтверждения подхватывается автоматически (поллинг /users/me) → onVerified().
 */
export function TelegramVerify({ code, onVerified }: { code: string; onVerified: () => void }) {
  const [copied, setCopied] = useState(false);
  const cbRef = useRef(onVerified);
  cbRef.current = onVerified;

  useEffect(() => {
    if (!code) return;
    const id = setInterval(async () => {
      try {
        const me = await authApi.getMe();
        if (me?.isPhoneVerified) {
          clearInterval(id);
          cbRef.current();
        }
      } catch {
        /* ещё не подтверждено — ждём */
      }
    }, 3000);
    return () => clearInterval(id);
  }, [code]);

  function copy() {
    navigator.clipboard?.writeText(code)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); })
      .catch(() => {});
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Заголовок */}
      <div className="flex items-center gap-3 p-4">
        <div className="w-11 h-11 rounded-xl bg-[#229ED9] flex items-center justify-center shrink-0">
          <TgIcon size={22} />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900 leading-tight">Подтверждение номера</h3>
          <p className="text-xs text-gray-500">Через Telegram — быстро и без SMS</p>
        </div>
      </div>

      <div className="px-4 pb-4 space-y-4">
        {/* Главное действие */}
        <a
          href={botVerifyLink(code)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#229ED9] active:bg-[#1b8ec4] text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-[.98] transition"
        >
          <TgIcon size={20} />
          Открыть бота в Telegram
        </a>

        {/* Что произойдёт */}
        <div className="space-y-2.5">
          <Step n={1}>Откроется бот <b className="text-gray-900">@{BOT_USERNAME}</b> — нажмите «Запустить»</Step>
          <Step n={2}>Нажмите кнопку <b className="text-gray-900">«Поделиться номером»</b></Step>
          <Step n={3}>Готово — вернётесь сюда автоматически</Step>
        </div>

        {/* Индикатор ожидания */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-0.5">
          <Spinner />
          Ждём подтверждение из Telegram…
        </div>
      </div>

      {/* Запасной вариант — код вручную */}
      <div className="bg-gray-50 border-t border-gray-100 px-4 py-3 flex items-center justify-between gap-3">
        <span className="text-xs text-gray-500 leading-tight">
          Бот не открылся?<br />Отправьте код вручную
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 active:scale-95 transition shrink-0"
        >
          <span className="font-mono font-bold text-lg tracking-wider text-gray-900">{code}</span>
          <span className="text-[#229ED9] text-xs font-semibold w-12 text-left">{copied ? 'готово ✓' : 'копир.'}</span>
        </button>
      </div>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="shrink-0 w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold flex items-center justify-center mt-0.5">
        {n}
      </span>
      <span className="text-sm text-gray-600 leading-snug">{children}</span>
    </div>
  );
}

function Spinner() {
  return <span className="inline-block w-3.5 h-3.5 border-2 border-gray-200 border-t-[#229ED9] rounded-full animate-spin" />;
}

function TgIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.41 14.717l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.738.842z" />
    </svg>
  );
}
