import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Star, Shield, Users, Clock } from 'lucide-react';
import { GroupProgress } from '../components/GroupProgress';
import { useAuth } from '../context/AuthContext';
import { lotsApi, bookingsApi } from '../services/api';
import { Lot, Category } from '../types';

const CATEGORY_EMOJI: Record<string, string> = {
  DAIRY: '🥛', MEAT: '🥩', EGGS: '🥚', HONEY: '🍯', VEGETABLES: '🥦', FRUITS: '🍎',
};

function mapLot(d: Record<string, unknown>): Lot {
  const category = ((d.category as string) || '').toLowerCase() as Category;
  return {
    id: d.id as number,
    title: d.title as string,
    description: d.description as string,
    category,
    price: Number(d.pricePerKg),
    unit: 'кг',
    minOrderQty: Number(d.minKgPerPerson),
    groupTarget: d.targetParticipants as number,
    currentOrders: d.currentParticipants as number,
    deadline: d.collectionDeadline as string,
    emoji: CATEGORY_EMOJI[(d.category as string)?.toUpperCase()] || '🌾',
    photoUrl: d.photoUrl as string | undefined,
    status: d.status === 'CONFIRMED' ? 'filled' : d.status === 'CANCELLED' ? 'cancelled' : d.status === 'DELIVERED' ? 'completed' : 'active',
    farmer: {
      id: (d.farmer as Record<string, unknown>)?.id as number,
      name: (d.farmer as Record<string, unknown>)?.fullName as string,
      rating: Number((d.farmer as Record<string, unknown>)?.rating ?? 5),
      reviewCount: Number((d.farmer as Record<string, unknown>)?.totalDeliveries ?? 0),
      verified: true,
    },
  };
}

export function LotDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lot, setLot] = useState<Lot | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    lotsApi.getById(Number(id))
      .then((data: Record<string, unknown>) => setLot(mapLot(data)))
      .catch(() => setLot(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-md mx-auto flex items-center justify-center">
        <div className="text-gray-400 text-sm">Загрузка...</div>
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 max-w-md mx-auto">
        <div className="text-5xl mb-3">🌿</div>
        <p className="text-gray-600 font-medium">Лот не найден</p>
        <button onClick={() => navigate('/')} className="mt-4 text-green-600 font-semibold">
          На главную
        </button>
      </div>
    );
  }

  const isFilled = lot.status === 'filled' || lot.currentOrders >= lot.groupTarget;
  const daysLeft = Math.ceil((new Date(lot.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const minQty = lot.minOrderQty || 1;

  async function handleBook() {
    if (!user) { navigate('/login'); return; }
    if (!user.verified) { navigate('/profile'); return; }
    setError('');
    setBooking(true);
    try {
      await bookingsApi.create(lot!.id, qty);
      setBooked(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data;
      setError(msg?.error || msg?.message || 'Ошибка при бронировании');
    } finally {
      setBooking(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      {/* Header image area */}
      <div className="bg-gradient-to-br from-green-100 to-emerald-200 h-52 flex items-center justify-center relative overflow-hidden">
        {lot.photoUrl && (
          <img src={lot.photoUrl} alt={lot.title} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/10" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-full p-2 active:scale-95 z-10"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        {!lot.photoUrl && <span className="text-8xl relative z-10">{lot.emoji}</span>}
        {isFilled && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-600 text-white text-sm font-bold px-4 py-1.5 rounded-full z-10">
            ✓ Группа набрана
          </div>
        )}
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Title + price */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-gray-900">{lot.title}</h1>
            <p className="text-gray-400 text-sm mt-0.5">от {lot.minOrderQty} {lot.unit}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-green-700">
              {lot.price.toLocaleString('ru-KZ')}
            </div>
            <div className="text-sm text-gray-400">тг / {lot.unit}</div>
          </div>
        </div>

        {/* Group progress */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-green-600" />
            <span className="font-bold text-gray-800 text-sm">Групповая закупка</span>
          </div>
          <GroupProgress
            current={lot.currentOrders}
            target={lot.groupTarget}
            deadline={lot.deadline}
            large
          />
          <div className="flex items-center gap-1.5 mt-3">
            <Clock size={14} className="text-gray-400" />
            <p className="text-xs text-gray-400">
              {daysLeft <= 0
                ? 'Закупка заканчивается сегодня!'
                : `Принимаем заявки ещё ${daysLeft} ${daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней'}`}
            </p>
          </div>
        </div>

        {/* Farmer */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">
              👨‍🌾
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-gray-900">{lot.farmer.name}</span>
                {lot.farmer.verified && <Shield size={14} className="text-green-500" />}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                <span className="text-sm font-semibold text-gray-700">{lot.farmer.rating}</span>
                <span className="text-xs text-gray-400">({lot.farmer.reviewCount} отзывов)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {lot.description && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-2">О продукте</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{lot.description}</p>
          </div>
        )}

        {/* CTA */}
        <div className="pb-8">
          {booked ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-green-700 font-bold">Вы в группе!</p>
              <p className="text-green-600 text-sm mt-1">Заявка принята. Следим за заполнением.</p>
              <button onClick={() => navigate('/orders')} className="mt-3 text-green-700 font-semibold text-sm underline">
                Мои заказы →
              </button>
            </div>
          ) : isFilled ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
              <p className="text-green-700 font-semibold">✓ Группа уже набрана</p>
              <p className="text-green-600 text-sm mt-1">Следите за следующим лотом</p>
            </div>
          ) : (
            <>
              {/* Quantity selector */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
                <p className="text-sm font-semibold text-gray-700 mb-3">Количество ({lot.unit})</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQty(q => Math.max(minQty, q - 1))}
                    className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 text-xl font-bold active:scale-95 transition-transform"
                  >
                    −
                  </button>
                  <div className="flex-1 text-center">
                    <span className="text-2xl font-black text-gray-900">{qty}</span>
                    <span className="text-gray-400 text-sm ml-1">{lot.unit}</span>
                  </div>
                  <button
                    onClick={() => setQty(q => q + 1)}
                    className="w-10 h-10 rounded-full bg-green-600 text-white text-xl font-bold active:scale-95 transition-transform"
                  >
                    +
                  </button>
                </div>
                <p className="text-center text-xs text-gray-400 mt-2">
                  Итого: <span className="font-bold text-gray-700">{(lot.price * qty).toLocaleString('ru-KZ')} тг</span>
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-3">
                  {error}
                </div>
              )}

              <button
                onClick={handleBook}
                disabled={booking}
                className="w-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-lg py-4 rounded-2xl transition-all shadow-md disabled:opacity-60"
              >
                {booking ? 'Оформляем...' : 'Участвовать в закупке'}
              </button>
            </>
          )}
          {!user && (
            <p className="text-center text-xs text-gray-400 mt-3">
              Для участия нужно{' '}
              <button onClick={() => navigate('/login')} className="text-green-600 font-semibold">
                войти
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
