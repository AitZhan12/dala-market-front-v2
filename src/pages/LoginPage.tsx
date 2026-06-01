import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Logo } from '../components/Logo';
import { TelegramLoginButton } from '../components/TelegramLoginButton';
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
              placeholder="Введите email"
              className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
              required
              onInvalid={e => {
                const t = e.currentTarget;
                t.setCustomValidity(t.value === '' ? 'Введите email от вашего аккаунта' : 'Введите корректный email, например: name@mail.com');
              }}
              onInput={e => e.currentTarget.setCustomValidity('')}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Пароль</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 pr-12 text-gray-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                required
                onInvalid={e => e.currentTarget.setCustomValidity('Введите пароль от вашего аккаунта')}
                onInput={e => e.currentTarget.setCustomValidity('')}
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

        <TelegramLoginButton />

        <p className="text-center text-sm text-gray-500 mt-6">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-green-600 font-semibold">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}
