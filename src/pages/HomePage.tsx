import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Logo } from '../components/Logo';
import { LotCard } from '../components/LotCard';
import { useAuth } from '../context/AuthContext';
import { lotsApi } from '../services/api';
import { Lot, Category } from '../types';

const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: 'all', label: 'Все', emoji: '🌿' },
  { id: 'dairy', label: 'Молоко', emoji: '🥛' },
  { id: 'meat', label: 'Мясо', emoji: '🥩' },
  { id: 'eggs', label: 'Яйца', emoji: '🥚' },
  { id: 'honey', label: 'Мёд', emoji: '🍯' },
  { id: 'vegetables', label: 'Овощи', emoji: '🥦' },
  { id: 'fruits', label: 'Фрукты', emoji: '🍎' },
];

const CATEGORY_EMOJI: Record<string, string> = {
  DAIRY: '🥛', MEAT: '🥩', EGGS: '🥚', HONEY: '🍯', VEGETABLES: '🥦', FRUITS: '🍎',
};

// Маппинг ответа бэкенда → Lot
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
    status: mapLotStatus(d.status as string),
    farmer: {
      id: (d.farmer as Record<string, unknown>)?.id as number,
      name: (d.farmer as Record<string, unknown>)?.fullName as string,
      rating: Number((d.farmer as Record<string, unknown>)?.rating ?? 5),
      reviewCount: Number((d.farmer as Record<string, unknown>)?.totalDeliveries ?? 0),
      verified: true,
    },
  };
}

function mapLotStatus(s: string): Lot['status'] {
  if (s === 'CONFIRMED') return 'filled';
  if (s === 'CANCELLED') return 'cancelled';
  if (s === 'DELIVERED') return 'completed';
  return 'active';
}

export function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lots, setLots] = useState<Lot[]>([]);
  const [loadingLots, setLoadingLots] = useState(true);
  const [category, setCategory] = useState<Category>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    lotsApi.getAll(user?.complexId)
      .then((data: Record<string, unknown>[]) => setLots(data.map(mapLot)))
      .catch(() => setLots([]))
      .finally(() => setLoadingLots(false));
  }, [user?.complexId]);

  const filtered = useMemo(() => lots.filter(lot => {
    const matchCat = category === 'all' || lot.category === category;
    const matchSearch = lot.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }), [lots, category, search]);

  const activeLots = filtered.filter(l => l.status === 'active');
  const filledLots = filtered.filter(l => l.status === 'filled');

  return (
    <Layout>
      {/* Header */}
      <div className="bg-gradient-to-b from-green-700 to-green-600 px-4 pt-12 pb-6 safe-top">
        <div className="flex items-center justify-between mb-4">
          <Logo inverted />
          <div className="flex items-center gap-3">
            {user?.complexName && (
              <span className="text-xs text-green-100 max-w-[120px] truncate">{user.complexName}</span>
            )}
            <button onClick={() => navigate('/profile')} className="p-2 rounded-full bg-white/10 active:bg-white/20">
              <Bell size={20} className="text-white" />
            </button>
          </div>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Найти продукт..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white rounded-xl pl-9 pr-4 py-3 text-sm text-gray-800 outline-none shadow-sm placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Hero banner — если не залогинен */}
        {!user && (
          <div className="mb-5 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl p-4 text-white relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-8xl opacity-20">🌾</div>
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-100 mb-1">Групповые закупки</p>
            <h2 className="font-black text-xl leading-tight mb-1">Натуральное прямо<br />от фермера</h2>
            <p className="text-sm text-orange-100 mb-3">Соберите группу соседей — получите свежие продукты дешевле</p>
            <button onClick={() => navigate('/register')}
              className="bg-white text-orange-500 font-bold text-sm px-5 py-2.5 rounded-xl active:scale-95 transition-transform">
              Присоединиться →
            </button>
          </div>
        )}

        {/* Категории */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-5 -mx-4 px-4">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all active:scale-95 ${
                category === cat.id ? 'bg-green-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-100'
              }`}>
              <span>{cat.emoji}</span><span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Загрузка */}
        {loadingLots && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl h-48 animate-pulse border border-gray-100" />
            ))}
          </div>
        )}

        {/* Активные лоты */}
        {!loadingLots && activeLots.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900">Активные закупки</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{activeLots.length}</span>
            </div>
            <div className="grid grid-cols-1 gap-3 mb-5">
              {activeLots.map(lot => <LotCard key={lot.id} lot={lot} />)}
            </div>
          </>
        )}

        {/* Набранные лоты */}
        {!loadingLots && filledLots.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-700">Группа набрана</h2>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">✓ {filledLots.length}</span>
            </div>
            <div className="grid grid-cols-1 gap-3 mb-5">
              {filledLots.map(lot => <LotCard key={lot.id} lot={lot} />)}
            </div>
          </>
        )}

        {/* Пусто */}
        {!loadingLots && filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🌿</div>
            <p className="text-gray-500 font-medium">Нет продуктов в этой категории</p>
            <p className="text-gray-400 text-sm mt-1">Попробуйте другой фильтр</p>
          </div>
        )}

        {/* Как это работает */}
        {!user && !loadingLots && (
          <div className="mt-2 bg-white rounded-2xl p-4 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3">Как это работает?</h3>
            <div className="space-y-3">
              {[
                { icon: '📱', title: 'Выберите ЖК', desc: 'Укажите свой жилой комплекс в Астане' },
                { icon: '🛒', title: 'Выберите продукты', desc: 'Присоединяйтесь к групповой закупке' },
                { icon: '👥', title: 'Наберём группу', desc: 'Когда все места заняты — фермер везёт' },
                { icon: '🚚', title: 'Доставка в ЖК', desc: 'Свежие продукты прямо к вашему дому' },
              ].map(s => (
                <div key={s.title} className="flex items-start gap-3">
                  <div className="text-2xl w-8 shrink-0">{s.icon}</div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{s.title}</p>
                    <p className="text-xs text-gray-500">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
