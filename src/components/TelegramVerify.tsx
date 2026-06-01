import { useEffect, useRef, useState } from 'react';
import { authApi } from '../services/api';
import { BOT_USERNAME, botVerifyLink } from '../config';

/**
 * Карточка подтверждения номера через Telegram-бота.
 * Пользователь жмёт кнопку → код уходит боту через диплинк → делится контактом.
 * Статус подтверждения подхватывается автоматически (поллинг /users/me),
 * после чего вызывается onVerified().
 */
export function TelegramVerify({ code, onVerified }: { code: string; onVerified: () => void }) {
  const [copied, setCopied] = useState(false);
  const cbRef = useRef(onVerified);
  cbRef.current = onVerified;

  // Авто-проверка: как только бот подтвердил номер — сообщаем родителю
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
        /* ещё не подтверждено — продолжаем ждать */
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
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
      <div className="text-center mb-4">
        <div className="text-4xl mb-2">📱</div>
        <h3 className="font-bold text-gray-900">Подтвердите номер через Telegram</h3>
        <p className="text-sm text-gray-600 mt-1">
          Займёт 10 секунд — номер вводить не нужно, его подставит Telegram
        </p>
      </div>

      <a
        href={botVerifyLink(code)}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-[#229ED9] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
      >
        <TgIcon />
        Открыть бота и подтвердить
      </a>

      <ol className="mt-4 space-y-2.5">
        <Step n={1}>Нажмите кнопку выше — откроется бот <b>@{BOT_USERNAME}</b></Step>
        <Step n={2}>В Telegram нажмите <b>«Запустить»</b> (Start)</Step>
        <Step n={3}>Нажмите <b>«📱 Поделиться номером»</b> — и всё готово</Step>
      </ol>

      <div className="flex items-center gap-2 mt-4 text-xs text-blue-600 justify-center">
        <span className="inline-block w-3 h-3 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        Ждём подтверждение из Telegram…
      </div>

      <div className="mt-4 pt-4 border-t border-blue-100 text-center">
        <p className="text-xs text-gray-400 mb-2">
          Бот не открылся? Найдите <b>@{BOT_USERNAME}</b> и отправьте этот код:
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="bg-white rounded-lg border border-blue-200 px-4 py-2 text-2xl font-black tracking-widest text-gray-900">
            {code}
          </span>
          <button onClick={copy} className="text-blue-600 text-sm font-semibold px-3 py-2 active:scale-95">
            {copied ? 'Скопировано ✓' : 'Копировать'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="shrink-0 w-5 h-5 rounded-full bg-[#229ED9] text-white text-xs font-bold flex items-center justify-center mt-0.5">
        {n}
      </span>
      <span className="text-sm text-gray-700 leading-snug">{children}</span>
    </li>
  );
}

function TgIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.41 14.717l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.738.842z" />
    </svg>
  );
}
