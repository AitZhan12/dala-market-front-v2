import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Ошибка входа, проверьте данные');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col">
      <div className="bg-gradient-to-b from-green-700 to-green-600 px-4 pt-14 pb-10 safe-top">
        <button onClick={() => navigate(-1)} className="mb-6 text-white/70 active:text-white">
          <ArrowLeft size={24} />
        </button>
        <Logo size="lg" inverted />
        <p className="text-green-100 text-sm mt-2">Войдите в аккаунт</p>
      </div>

      <div className="flex-1 px-5 py-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@mail.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Пароль</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 pr-12 text-gray-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 active:bg-green-700 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-60 mt-2"
          >
            {loading ? 'Входим...' : 'Войти'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-gray-400 text-xs">или</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <button
          onClick={() => alert('Telegram Login Widget — подключается через бот')}
          className="w-full bg-[#229ED9] active:bg-[#1a8fc0] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all active:scale-95"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.41 14.717l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.738.842z"/>
          </svg>
          Войти через Telegram
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-green-600 font-semibold">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}
