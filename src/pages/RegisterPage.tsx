import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { authApi, complexesApi } from '../services/api';
import { Complex } from '../types';

type Step = 'form' | 'telegram' | 'complex';
type Role = 'USER' | 'FARMER';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, updateUser } = useAuth();

  const [step, setStep] = useState<Step>('form');
  const [role, setRole] = useState<Role>('USER');

  // Общие поля
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Поля фермера
  const [region, setRegion] = useState('');
  const [phone, setPhone] = useState('');
  const [farmDesc, setFarmDesc] = useState('');

  const [verifyCode, setVerifyCode] = useState('');
  const [complexId, setComplexId] = useState<number | null>(null);
  const [complexes, setComplexes] = useState<Complex[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Для фермера шаг 3 (complex) не нужен
  const steps: Step[] = role === 'FARMER' ? ['form', 'telegram'] : ['form', 'telegram', 'complex'];

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (role === 'FARMER') {
        const data = await authApi.registerFarmer({ name, email, password, region, phone, description: farmDesc });
        // Сохраняем токен через AuthContext
        const raw = { token: data.token, user: {
          id: data.userId, name: data.name, email: data.email,
          role: data.role, verified: data.isPhoneVerified,
        }};
        localStorage.setItem('dalamart_auth', JSON.stringify(raw));
        window.location.href = '/farmer';
        return;
      }

      await register(name, email, password);
      const [complexData, codeResult] = await Promise.allSettled([
        complexesApi.getAll(),
        authApi.getVerifyCode(),
      ]);
      if (complexData.status === 'fulfilled') setComplexes(complexData.value);
      if (codeResult.status === 'fulfilled') setVerifyCode(codeResult.value.code);
      setStep('telegram');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  }

  async function handleSkipToComplex() {
    setLoading(true);
    try {
      if (complexes.length === 0) {
        const data = await complexesApi.getAll();
        setComplexes(data);
      }
    } finally {
      setLoading(false);
    }
    setStep('complex');
  }

  async function handleComplete() {
    if (!complexId) return;
    setLoading(true);
    try {
      const data = await authApi.updateMe({ residentialComplexId: complexId });
      updateUser({ complexId: data.residentialComplexId, complexName: data.residentialComplexName });
      navigate('/');
    } catch {
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col">
      <div className="bg-gradient-to-b from-green-700 to-green-600 px-4 pt-14 pb-10 safe-top">
        <button
          onClick={() => step === 'form' ? navigate(-1) : setStep(steps[steps.indexOf(step) - 1])}
          className="mb-6 text-white/70"
        >
          <ArrowLeft size={24} />
        </button>
        <Logo size="lg" inverted />
        <p className="text-green-100 text-sm mt-2">Создайте аккаунт</p>
      </div>

      {/* Progress */}
      <div className="flex px-6 py-4 gap-2">
        {steps.map((s, i) => (
          <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${
            steps.indexOf(step) >= i ? 'bg-green-500' : 'bg-gray-100'
          }`} />
        ))}
      </div>

      <div className="flex-1 px-5 py-4">

        {/* Step 1 — Form */}
        {step === 'form' && (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-1">Основные данные</h2>
              <p className="text-sm text-gray-500">Шаг 1 из {steps.length}</p>
            </div>

            {/* Role toggle */}
            <div className="flex rounded-xl overflow-hidden border border-gray-200">
              <button
                type="button"
                onClick={() => setRole('USER')}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${
                  role === 'USER' ? 'bg-green-600 text-white' : 'bg-white text-gray-500'
                }`}
              >
                👤 Покупатель
              </button>
              <button
                type="button"
                onClick={() => setRole('FARMER')}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${
                  role === 'FARMER' ? 'bg-green-600 text-white' : 'bg-white text-gray-500'
                }`}
              >
                👨‍🌾 Фермер
              </button>
            </div>

            {role === 'FARMER' && (
              <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                <p className="text-xs text-green-700">
                  Вы сможете создавать лоты и продавать продукты жителям ЖК напрямую
                </p>
              </div>
            )}

            <Field label="Ваше имя">
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Введите имя"
                required className="input-field"
                onInvalid={e => e.currentTarget.setCustomValidity('Пожалуйста, введите ваше имя')}
                onInput={e => e.currentTarget.setCustomValidity('')} />
            </Field>

            <Field label="Email">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Введите email" required className="input-field"
                onInvalid={e => {
                  const t = e.currentTarget;
                  t.setCustomValidity(t.value === '' ? 'Введите email — он нужен для входа' : 'Введите корректный email, например: name@mail.com');
                }}
                onInput={e => e.currentTarget.setCustomValidity('')} />
            </Field>

            <Field label="Пароль">
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Минимум 6 символов" minLength={6} required className="input-field"
                onInvalid={e => {
                  const t = e.currentTarget;
                  t.setCustomValidity(t.value === '' ? 'Придумайте пароль для аккаунта' : 'Пароль должен быть не короче 6 символов');
                }}
                onInput={e => e.currentTarget.setCustomValidity('')} />
            </Field>

            {/* Farmer-only fields */}
            {role === 'FARMER' && (
              <>
                <Field label="Регион / откуда везёте">
                  <input type="text" value={region} onChange={e => setRegion(e.target.value)}
                    placeholder="Алматинская обл., с. Узынагаш" required className="input-field" />
                </Field>
                <Field label="Телефон">
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="+7 777 000 00 00" required className="input-field" />
                </Field>
                <Field label="О вашей ферме (необязательно)">
                  <textarea value={farmDesc} onChange={e => setFarmDesc(e.target.value)}
                    rows={2} placeholder="Что выращиваете, с какого года..."
                    className="input-field resize-none" />
                </Field>
              </>
            )}

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl active:scale-95 transition-transform disabled:opacity-60 mt-2">
              {loading ? 'Создаём...' : role === 'FARMER' ? 'Зарегистрироваться как фермер →' : 'Далее →'}
            </button>

            <p className="text-center text-sm text-gray-500">
              Уже есть аккаунт?{' '}
              <Link to="/login" className="text-green-600 font-semibold">Войти</Link>
            </p>
          </form>
        )}

        {/* Step 2 — Telegram (только для покупателей) */}
        {step === 'telegram' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-1">Подтверждение номера</h2>
              <p className="text-sm text-gray-500">Шаг 2 из {steps.length}</p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-center">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="font-bold text-gray-900 mb-2">Подтвердите через Telegram</h3>
              <p className="text-sm text-gray-600 mb-4">
                Откройте бот и отправьте этот код, чтобы мы зафиксировали ваш номер.
              </p>

              {verifyCode ? (
                <div className="bg-white rounded-xl border border-blue-200 py-3 px-6 mb-4 inline-block">
                  <p className="text-xs text-gray-400 mb-1">Ваш код</p>
                  <p className="text-3xl font-black text-gray-900 tracking-widest">{verifyCode}</p>
                </div>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      const d = await authApi.getVerifyCode();
                      setVerifyCode(d.code);
                    } catch (e: unknown) {
                      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
                      setError(msg || 'Не удалось получить код');
                    }
                  }}
                  className="mb-4 bg-white border border-blue-200 text-blue-600 font-semibold py-2 px-4 rounded-xl"
                >
                  Запросить код
                </button>
              )}

              <button
                onClick={() => verifyCode
                  ? alert(`Отправьте код ${verifyCode} нашему Telegram боту`)
                  : alert('Сначала запросите код')}
                className="w-full bg-[#229ED9] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.41 14.717l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.738.842z"/>
                </svg>
                Открыть Telegram бот
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
              <p className="text-xs text-amber-700">
                🔒 Номер нужен для защиты фермеров от недобросовестных покупателей.
              </p>
            </div>

            <button onClick={handleSkipToComplex} className="w-full text-gray-400 text-sm py-2 active:text-gray-600">
              Пропустить пока →
            </button>
          </div>
        )}

        {/* Step 3 — Complex (только для покупателей) */}
        {step === 'complex' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-1">Ваш ЖК</h2>
              <p className="text-sm text-gray-500">Шаг 3 из 3 — выберите жилой комплекс</p>
            </div>

            <div className="max-h-[calc(100vh-320px)] overflow-y-auto space-y-2 -mx-1 px-1">
              {complexes.map(c => (
                <button key={c.id} onClick={() => setComplexId(c.id)}
                  className={`w-full text-left p-3.5 rounded-xl border-2 transition-all ${
                    complexId === c.id ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-semibold text-sm ${complexId === c.id ? 'text-green-800' : 'text-gray-800'}`}>
                        {c.name}
                      </p>
                      {c.address && <p className="text-xs text-gray-400 mt-0.5">{c.address}</p>}
                    </div>
                    {complexId === c.id && <CheckCircle2 size={20} className="text-green-500 shrink-0" />}
                  </div>
                </button>
              ))}
            </div>

            <button onClick={handleComplete} disabled={!complexId || loading}
              className="w-full bg-orange-500 text-white font-bold py-4 rounded-2xl active:scale-95 transition-all disabled:opacity-40">
              {loading ? 'Сохраняем...' : 'Готово! Начать покупки 🎉'}
            </button>

            <button onClick={() => navigate('/')} className="w-full text-gray-400 text-sm py-2">
              Выбрать позже
            </button>
          </div>
        )}
      </div>

      <style>{`.input-field{width:100%;border:1px solid #e5e7eb;border-radius:12px;padding:12px 16px;font-size:14px;outline:none;background:white;transition:border-color .15s,box-shadow .15s}.input-field:focus{border-color:#16a34a;box-shadow:0 0 0 3px rgba(22,163,74,.1)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
