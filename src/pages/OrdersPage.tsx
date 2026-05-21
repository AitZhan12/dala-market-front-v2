import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { bookingsApi } from '../services/api';
import { BookingStatus } from '../types';

interface BackendBooking {
  id: number;
  lotId: number;
  lotTitle: string;
  quantityKg: number;
  totalPrice: number;
  status: string;
  deliveryDate?: string;
  deliveryLocation?: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:    { label: 'Ожидание группы', color: 'text-amber-600',  bg: 'bg-amber-50' },
  CONFIRMED:  { label: 'Подтверждён',     color: 'text-green-600',  bg: 'bg-green-50' },
  DELIVERING: { label: 'В доставке 🚚',   color: 'text-blue-600',   bg: 'bg-blue-50' },
  COMPLETED:  { label: 'Получен ✓',       color: 'text-gray-600',   bg: 'bg-gray-50' },
  CANCELLED:  { label: 'Отменён',         color: 'text-red-600',    bg: 'bg-red-50' },
  NO_SHOW:    { label: 'Не явился',       color: 'text-red-700',    bg: 'bg-red-50' },
};

const CATEGORY_EMOJI: Record<string, string> = {};

export function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BackendBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    bookingsApi.getMy()
      .then(setBookings)
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Совместные закупки натуральных продуктов</h2>
          <p className="text-gray-500 text-sm mb-6">Объединяйтесь с другими покупателями и заказывайте выгоднее</p>
          <button onClick={() => navigate('/login')}
            className="bg-green-600 text-white font-bold px-8 py-3 rounded-2xl active:scale-95 transition-transform">
            Войти
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-black text-gray-900 mb-1">Мои заказы</h1>
        <p className="text-sm text-gray-400 mb-5">{user.complexName ?? 'ЖК не выбран'}</p>

        {loading && (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-gray-100" />)}
          </div>
        )}

        {!loading && bookings.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📦</div>
            <p className="text-gray-500 font-medium">Заказов пока нет</p>
            <button onClick={() => navigate('/')} className="mt-4 text-green-600 font-semibold text-sm">
              Перейти к продуктам →
            </button>
          </div>
        )}

        {!loading && (
          <div className="space-y-3">
            {bookings.map(b => {
              const status = STATUS_CONFIG[b.status] || STATUS_CONFIG.PENDING;
              return (
                <div key={b.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="flex items-start gap-3 p-4">
                    <div className="text-4xl">🌾</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm">{b.lotTitle}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {b.quantityKg} кг · {Number(b.totalPrice).toLocaleString('ru-KZ')} тг
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(b.createdAt).toLocaleDateString('ru-KZ', { day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                    <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${status.color} ${status.bg}`}>
                      {status.label}
                    </span>
                  </div>

                  {b.deliveryDate && (
                    <div className="bg-green-50 px-4 py-2 border-t border-green-100">
                      <p className="text-xs text-green-700 font-medium">
                        🗓 Доставка:{' '}
                        {new Date(b.deliveryDate).toLocaleDateString('ru-KZ', { day: 'numeric', month: 'long' })}
                        {b.deliveryLocation ? ` · ${b.deliveryLocation}` : ''}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
