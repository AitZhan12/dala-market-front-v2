import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronRight, Shield, MapPin, Bell, HelpCircle, Settings } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { complexesApi, authApi } from '../services/api';
import { Complex } from '../types';

const ROLE_LABELS = { USER: 'Покупатель', FARMER: 'Фермер', ADMIN: 'Администратор' };

export function ProfilePage() {
  const { user, logout, updateUser, refreshMe } = useAuth();
  const navigate = useNavigate();
  const [showComplexPicker, setShowComplexPicker] = useState(false);
  const [complexes, setComplexes] = useState<Complex[]>([]);
  const [verifyCode, setVerifyCode] = useState('');
  const [loadingCode, setLoadingCode] = useState(false);

  useEffect(() => {
    if (showComplexPicker && complexes.length === 0) {
      complexesApi.getAll().then(setComplexes).catch(() => {});
    }
  }, [showComplexPicker, complexes.length]);

  async function handleComplexSelect(id: number, name: string) {
    try {
      await authApi.updateMe({ residentialComplexId: id });
      updateUser({ complexId: id, complexName: name });
    } catch {}
    setShowComplexPicker(false);
  }

  async function handleGetVerifyCode() {
    setLoadingCode(true);
    try {
      const data = await authApi.getVerifyCode();
      setVerifyCode(data.code);
    } catch {
      alert('Войдите снова, чтобы получить код');
    } finally {
      setLoadingCode(false);
    }
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center">
          <Logo size="lg" />
          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-2">Войдите в DalaMart</h2>
          <p className="text-gray-500 text-sm mb-6">
            Чтобы участвовать в групповых закупках натуральных продуктов
          </p>
          <button onClick={() => navigate('/login')}
            className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl active:scale-95 transition-transform">
            Войти
          </button>
          <button onClick={() => navigate('/register')}
            className="w-full mt-3 border-2 border-green-600 text-green-600 font-bold py-4 rounded-2xl active:scale-95 transition-transform">
            Зарегистрироваться
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="bg-gradient-to-b from-green-700 to-green-600 px-4 pt-14 pb-8 safe-top">
        <div className="flex items-start justify-between">
          <div>
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl mb-3">
              {user.role === 'FARMER' ? '👨‍🌾' : user.role === 'ADMIN' ? '👨‍💼' : '👤'}
            </div>
            <h1 className="text-xl font-black text-white">{user.name || user.email || 'Пользователь'}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                {ROLE_LABELS[user.role]}
              </span>
              {user.verified ? (
                <span className="text-xs text-green-200 flex items-center gap-1">
                  <Shield size={12} /> Верифицирован
                </span>
              ) : (
                <span className="text-xs text-amber-300">Не верифицирован</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-3">
        {/* ЖК */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <button onClick={() => setShowComplexPicker(true)}
            className="w-full flex items-center gap-3 p-4 active:bg-gray-50">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <MapPin size={18} className="text-green-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs text-gray-400">Ваш ЖК</p>
              <p className="font-semibold text-gray-800 text-sm">
                {user.complexName ?? 'Не выбран — нажмите выбрать'}
              </p>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>
        </div>

        {/* Верификация */}
        {!user.verified && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚠️</div>
              <div className="flex-1">
                <p className="font-bold text-amber-800 text-sm">Подтвердите номер телефона</p>
                <p className="text-xs text-amber-700 mt-1">
                  Для участия в закупках нужно верифицировать аккаунт через Telegram
                </p>
                {!verifyCode ? (
                  <button onClick={handleGetVerifyCode} disabled={loadingCode}
                    className="mt-2 bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-xl active:scale-95 disabled:opacity-60">
                    {loadingCode ? 'Получаем...' : 'Получить код'}
                  </button>
                ) : (
                  <div className="mt-2">
                    <p className="text-xs text-amber-700 mb-1">Отправьте этот код боту:</p>
                    <div className="bg-white rounded-lg px-3 py-2 inline-block border border-amber-200">
                      <span className="font-black text-xl tracking-widest text-gray-900">{verifyCode}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Admin panel */}
        {user.role === 'ADMIN' && (
          <div className="bg-purple-50 border border-purple-100 rounded-2xl overflow-hidden">
            <button onClick={() => navigate('/admin')}
              className="w-full flex items-center gap-3 p-4 active:bg-purple-100">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Settings size={18} className="text-purple-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-purple-900 text-sm">Панель администратора</p>
                <p className="text-xs text-purple-500">Управление фермерами, лотами, ЖК</p>
              </div>
              <ChevronRight size={18} className="text-purple-300" />
            </button>
          </div>
        )}

        {/* Farmer cabinet */}
        {user.role === 'FARMER' && (
          <div className="bg-green-50 border border-green-100 rounded-2xl overflow-hidden">
            <button onClick={() => navigate('/farmer')}
              className="w-full flex items-center gap-3 p-4 active:bg-green-100">
              <div className="text-2xl">👨‍🌾</div>
              <div className="flex-1 text-left">
                <p className="font-bold text-green-900 text-sm">Кабинет фермера</p>
                <p className="text-xs text-green-600">Мои лоты и статистика</p>
              </div>
              <ChevronRight size={18} className="text-green-300" />
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
          <MenuItem icon={<Bell size={18} className="text-gray-500" />} label="Уведомления" />
          <MenuItem icon={<HelpCircle size={18} className="text-gray-500" />} label="Помощь и FAQ" />
        </div>

        <button onClick={() => { logout(); navigate('/'); }}
          className="w-full flex items-center justify-center gap-2 py-4 text-red-500 font-semibold active:scale-95 transition-transform">
          <LogOut size={18} />
          Выйти
        </button>
      </div>

      {/* Complex picker */}
      {showComplexPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end max-w-md mx-auto left-1/2 -translate-x-1/2 w-full">
          <div className="bg-white w-full rounded-t-3xl p-5 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-lg text-gray-900">Выберите ЖК</h3>
              <button onClick={() => setShowComplexPicker(false)} className="text-gray-400 font-bold text-xl">✕</button>
            </div>
            <div className="overflow-y-auto space-y-2">
              {complexes.length === 0 && (
                <div className="text-center py-8 text-gray-400">Загрузка...</div>
              )}
              {complexes.map(c => (
                <button key={c.id} onClick={() => handleComplexSelect(c.id, c.name)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${
                    user.complexId === c.id ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-gray-50'
                  }`}>
                  <p className="font-semibold text-sm text-gray-800">{c.name}</p>
                  {c.address && <p className="text-xs text-gray-400">{c.address}</p>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function MenuItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="w-full flex items-center gap-3 p-4 active:bg-gray-50">
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">{icon}</div>
      <span className="flex-1 text-left font-medium text-gray-700 text-sm">{label}</span>
      <ChevronRight size={18} className="text-gray-300" />
    </button>
  );
}
