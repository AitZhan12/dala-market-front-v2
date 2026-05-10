import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, TrendingUp, Users, Package, ChevronRight } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { lotsApi, bookingsApi, complexesApi } from '../services/api';
import { Complex } from '../types';

const CATEGORY_LABELS: Record<string, string> = {
  DAIRY: 'Молочное', MEAT: 'Мясо', EGGS: 'Яйца',
  HONEY: 'Мёд', VEGETABLES: 'Овощи', FRUITS: 'Фрукты',
};

const CATEGORY_EMOJI: Record<string, string> = {
  DAIRY: '🥛', MEAT: '🥩', EGGS: '🥚', HONEY: '🍯', VEGETABLES: '🥦', FRUITS: '🍎',
};

interface BackendLot {
  id: number;
  title: string;
  category: string;
  pricePerKg: number;
  targetParticipants: number;
  currentParticipants: number;
  status: string;
  deliveryDate?: string;
  deliveryLocation?: string;
}

interface Participant {
  bookingId: number;
  userId: number;
  userName: string;
  telegramUsername?: string;
  phoneNumber?: string;
  quantityKg: number;
  totalPrice: number;
  status: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'Ожидает', color: 'text-amber-600' },
  CONFIRMED: { label: 'Подтверждён', color: 'text-green-600' },
  COMPLETED: { label: '✓ Выдан', color: 'text-gray-400' },
  NO_SHOW:   { label: 'Не пришёл', color: 'text-red-500' },
  CANCELLED: { label: 'Отменён', color: 'text-gray-400' },
};

export function FarmerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [lots, setLots] = useState<BackendLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLot, setSelectedLot] = useState<BackendLot | null>(null);

  function loadLots() {
    setLoading(true);
    lotsApi.getMy()
      .then((data: BackendLot[]) => setLots(data))
      .catch(() => setLots([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (user && (user.role === 'FARMER' || user.role === 'ADMIN')) {
      loadLots();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user || (user.role !== 'FARMER' && user.role !== 'ADMIN')) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
          <div className="text-5xl mb-4">🌾</div>
          <p className="text-gray-600 font-medium">Доступ только для фермеров</p>
          <button onClick={() => navigate('/')} className="mt-4 text-green-600 font-semibold">На главную</button>
        </div>
      </Layout>
    );
  }

  const activeLots = lots.filter(l => l.status === 'COLLECTING').length;
  const totalOrders = lots.reduce((sum, l) => sum + (l.currentParticipants || 0), 0);

  return (
    <Layout>
      <div className="bg-gradient-to-b from-green-700 to-green-600 px-4 pt-14 pb-6 safe-top">
        <button onClick={() => navigate(-1)} className="mb-4 text-white/70">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-2xl font-black text-white">Кабинет фермера</h1>
        <p className="text-green-100 text-sm">{user.name}</p>
      </div>

      <div className="px-4 py-5 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={<Package size={18} />} value={lots.length} label="Лотов" />
          <StatCard icon={<TrendingUp size={18} />} value={activeLots} label="Активных" />
          <StatCard icon={<Users size={18} />} value={totalOrders} label="Участников" />
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="w-full bg-orange-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Plus size={20} />
          Создать новый лот
        </button>

        <div>
          <h2 className="font-bold text-gray-900 mb-3">Мои лоты</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-gray-100" />)}
            </div>
          ) : lots.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <div className="text-4xl mb-2">🌱</div>
              <p className="text-gray-500 text-sm">Пока нет лотов</p>
              <p className="text-gray-400 text-xs mt-1">Создайте первый лот для групповой закупки</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lots.map(lot => {
                const percent = lot.targetParticipants > 0
                  ? Math.round((lot.currentParticipants / lot.targetParticipants) * 100)
                  : 0;
                const isFilled = lot.status === 'CONFIRMED' || lot.status === 'DELIVERED';
                return (
                  <button
                    key={lot.id}
                    onClick={() => setSelectedLot(lot)}
                    className="w-full bg-white rounded-2xl border border-gray-100 p-4 text-left active:bg-gray-50"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-3xl">{CATEGORY_EMOJI[lot.category] || '🌾'}</span>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">{lot.title}</p>
                        <p className="text-xs text-gray-400">{Number(lot.pricePerKg).toLocaleString('ru-KZ')} тг/кг</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          isFilled ? 'bg-green-100 text-green-700' :
                          lot.status === 'CANCELLED' ? 'bg-red-100 text-red-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {lot.status === 'DELIVERED' ? '📦 Доставлен' : isFilled ? '✓ Набран' : lot.status === 'CANCELLED' ? 'Отменён' : 'Активен'}
                        </span>
                        <ChevronRight size={16} className="text-gray-300" />
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div className="h-full bg-green-400 rounded-full transition-all" style={{ width: `${Math.min(percent, 100)}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {lot.currentParticipants} / {lot.targetParticipants} мест ({percent}%)
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateLotModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadLots(); }}
        />
      )}

      {selectedLot && (
        <LotParticipantsModal
          lot={selectedLot}
          onClose={() => setSelectedLot(null)}
          onDelivered={() => { setSelectedLot(null); loadLots(); }}
        />
      )}
    </Layout>
  );
}

function LotParticipantsModal({ lot, onClose, onDelivered }: {
  lot: BackendLot;
  onClose: () => void;
  onDelivered: () => void;
}) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [delivering, setDelivering] = useState(false);

  useEffect(() => {
    bookingsApi.getLotParticipants(lot.id)
      .then((data: Participant[]) => setParticipants(data))
      .catch(() => setParticipants([]))
      .finally(() => setLoading(false));
  }, [lot.id]);

  async function handleAction(bookingId: number, action: 'complete' | 'no-show') {
    try {
      if (action === 'complete') await bookingsApi.completeBooking(bookingId);
      else await bookingsApi.markNoShow(bookingId);
      setParticipants(prev => prev.map(p =>
        p.bookingId === bookingId
          ? { ...p, status: action === 'complete' ? 'COMPLETED' : 'NO_SHOW' }
          : p
      ));
    } catch {}
  }

  async function handleMarkDelivered() {
    setDelivering(true);
    try {
      await lotsApi.deliver(lot.id);
      onDelivered();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      alert(msg || 'Ошибка');
    } finally {
      setDelivering(false);
    }
  }

  const allResolved = participants.length > 0 &&
    participants.every(p => p.status === 'COMPLETED' || p.status === 'NO_SHOW' || p.status === 'CANCELLED');
  const isConfirmed = lot.status === 'CONFIRMED';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end max-w-md mx-auto left-1/2 -translate-x-1/2 w-full">
      <div className="bg-white w-full rounded-t-3xl max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center px-5 pt-5 pb-3 shrink-0">
          <div>
            <h3 className="font-black text-lg text-gray-900">{lot.title}</h3>
            <p className="text-xs text-gray-400">{lot.currentParticipants} участников</p>
          </div>
          <button onClick={onClose} className="text-gray-400 text-xl font-bold">✕</button>
        </div>

        {lot.deliveryDate && (
          <div className="mx-5 mb-3 bg-green-50 rounded-xl px-3 py-2 shrink-0">
            <p className="text-xs text-green-700 font-medium">
              🗓 {new Date(lot.deliveryDate).toLocaleDateString('ru-KZ', { day: 'numeric', month: 'long' })}
              {lot.deliveryLocation ? ` · ${lot.deliveryLocation}` : ''}
            </p>
          </div>
        )}

        <div className="overflow-y-auto flex-1 px-5 space-y-2 pb-4">
          {loading ? (
            <div className="text-center py-8 text-gray-400 text-sm">Загрузка...</div>
          ) : participants.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-gray-400 text-sm">Пока никто не записался</p>
            </div>
          ) : participants.map(p => {
            const st = STATUS_LABELS[p.status] || STATUS_LABELS.PENDING;
            const canAct = p.status === 'PENDING' || p.status === 'CONFIRMED';
            return (
              <div key={p.bookingId} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{p.userName}</p>
                    {p.telegramUsername && (
                      <p className="text-xs text-gray-400">@{p.telegramUsername}</p>
                    )}
                  </div>
                  <span className={`text-xs font-semibold ${st.color}`}>{st.label}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  {Number(p.quantityKg).toLocaleString('ru-KZ')} кг · {Number(p.totalPrice).toLocaleString('ru-KZ')} тг
                </p>
                {canAct && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(p.bookingId, 'complete')}
                      className="flex-1 bg-green-600 text-white text-xs font-bold py-2 rounded-lg active:scale-95 transition-transform"
                    >
                      ✓ Выдал
                    </button>
                    <button
                      onClick={() => handleAction(p.bookingId, 'no-show')}
                      className="flex-1 bg-red-50 text-red-600 text-xs font-bold py-2 rounded-lg border border-red-100 active:scale-95 transition-transform"
                    >
                      Не пришёл
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {isConfirmed && (
          <div className="px-5 pb-6 pt-2 shrink-0 border-t border-gray-100">
            {allResolved ? (
              <button
                onClick={handleMarkDelivered}
                disabled={delivering}
                className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl active:scale-95 transition-transform disabled:opacity-60"
              >
                {delivering ? 'Завершаем...' : '🎉 Завершить доставку'}
              </button>
            ) : (
              <p className="text-center text-xs text-gray-400 py-2">
                Отметьте всех участников, чтобы завершить доставку
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center">
      <div className="text-green-500 flex justify-center mb-1">{icon}</div>
      <div className="font-black text-xl text-gray-900">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
}

function CreateLotModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('DAIRY');
  const [price, setPrice] = useState('');
  const [minKg, setMinKg] = useState('1');
  const [target, setTarget] = useState('');
  const [desc, setDesc] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [complexId, setComplexId] = useState('');
  const [complexes, setComplexes] = useState<Complex[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    complexesApi.getAll().then((data: Complex[]) => setComplexes(data)).catch(() => {});
  }, []);

  // deadline = deliveryDate - 3 days
  const collectionDeadline = deliveryDate
    ? new Date(new Date(deliveryDate).getTime() - 3 * 86400000).toISOString().split('T')[0]
    : '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await lotsApi.create({
        title,
        category,
        pricePerKg: Number(price),
        minKgPerPerson: Number(minKg),
        targetParticipants: Number(target),
        deliveryDate,
        deliveryLocation,
        residentialComplexId: Number(complexId),
        collectionDeadline,
        description: desc,
        photoUrl: photoUrl || undefined,
      });
      onCreated();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data;
      setError(msg?.error || msg?.message || 'Ошибка при создании лота');
    } finally {
      setLoading(false);
    }
  }

  const minDate = new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end max-w-md mx-auto left-1/2 -translate-x-1/2 w-full">
      <div className="bg-white w-full rounded-t-3xl max-h-[92vh] flex flex-col">
        <div className="flex justify-between items-center px-5 pt-5 pb-3 shrink-0">
          <h3 className="font-black text-lg text-gray-900">Новый лот</h3>
          <button onClick={onClose} className="text-gray-400 text-xl font-bold">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto px-5 pb-6 space-y-4 flex-1">
          <Field label="Название продукта">
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Молоко домашнее" required className="input-field" />
          </Field>
          <Field label="Категория">
            <select value={category} onChange={e => setCategory(e.target.value)} className="input-field">
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Цена за кг (тг)">
              <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                placeholder="500" min="1" required className="input-field" />
            </Field>
            <Field label="Мин. кг на чел.">
              <input type="number" value={minKg} onChange={e => setMinKg(e.target.value)}
                placeholder="1" min="0.5" step="0.5" required className="input-field" />
            </Field>
          </div>
          <Field label="Кол-во участников">
            <input type="number" value={target} onChange={e => setTarget(e.target.value)}
              placeholder="20" min="2" required className="input-field" />
          </Field>
          <Field label="Дата доставки">
            <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)}
              min={minDate} required className="input-field" />
            {collectionDeadline && (
              <p className="text-xs text-gray-400 mt-1">Сбор заявок до: {collectionDeadline}</p>
            )}
          </Field>
          <Field label="Место доставки">
            <input type="text" value={deliveryLocation} onChange={e => setDeliveryLocation(e.target.value)}
              placeholder="Вход со стороны парка, 1-й подъезд" required className="input-field" />
          </Field>
          <Field label="Жилой комплекс">
            <select value={complexId} onChange={e => setComplexId(e.target.value)} required className="input-field">
              <option value="">— Выберите ЖК —</option>
              {complexes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Фото продукта (ссылка, необязательно)">
            <input type="url" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)}
              placeholder="https://..." className="input-field" />
            {photoUrl && (
              <img src={photoUrl} alt="preview" className="mt-2 w-full h-32 object-cover rounded-xl border border-gray-100"
                onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
            )}
          </Field>
          <Field label="Описание">
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
              placeholder="Расскажите о своём продукте..." className="input-field resize-none" />
          </Field>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl active:scale-95 transition-transform disabled:opacity-60">
            {loading ? 'Публикуем...' : 'Опубликовать лот'}
          </button>
        </form>
      </div>
      <style>{`.input-field { width: 100%; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px 16px; font-size: 14px; outline: none; background: white; } .input-field:focus { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,0.1); }`}</style>
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
