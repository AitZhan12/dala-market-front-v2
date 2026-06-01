import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BOT_USERNAME } from '../config';

interface TelegramAuthUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramAuthUser) => void;
  }
}

/**
 * Официальный Telegram Login Widget.
 * ВАЖНО: виджет работает только на домене, заданном боту через @BotFather → /setdomain
 * (для прода — dala-mart.duckdns.org). На localhost Telegram авторизацию не покажет.
 */
export function TelegramLoginButton() {
  const ref = useRef<HTMLDivElement>(null);
  const { loginTelegram } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    window.onTelegramAuth = async (user: TelegramAuthUser) => {
      try {
        await loginTelegram(user as unknown as Record<string, unknown>);
        navigate('/');
      } catch {
        setError('Не удалось войти через Telegram. Попробуйте ещё раз.');
      }
    };

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', BOT_USERNAME);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '12');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');

    const el = ref.current;
    el?.appendChild(script);

    return () => {
      if (el) el.innerHTML = '';
      window.onTelegramAuth = undefined;
    };
  }, [loginTelegram, navigate]);

  return (
    <div>
      <div ref={ref} className="flex justify-center min-h-[48px] items-center" />
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mt-2">
          {error}
        </div>
      )}
    </div>
  );
}
