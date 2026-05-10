import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Package, Building2, BarChart3, ShieldAlert } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../services/api';

const CATEGORY_EMOJI: Record<string, string> = {
  DAIRY: '🥛', MEAT: '🥩', EGGS: '🥚', HONEY: '🍯', VEGETABLES: '🥦', FRUITS: '🍎',
};

interface AdminStats {
  totalLots?: number;
  activeLots?: number;
  totalBookings?: number;
  totalComplexes?: number;
  totalFarmers?: number;
  totalUsers?: number;
}

interface AdminLot {
  id: number;
  title: string;
  category: string;
  currentParticipants: number;
  targetParticipants: number;
  status: string;
  farmer?: { fullName?: string };
}

export function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats>({});
  const [lots, setLots] = useState<AdminLot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') { setLoading(false); return; }
    Promise.all([
      adminApi.getStats().catch(() => ({})),
      adminApi.getAllLots().catch(() => []),
    ]).then(([s, l]) => {
      setStats(s as AdminStats);
      setLots((l as AdminLot[]).slice(0, 6));
    }).finally(() => setLoading(false));
  }, [user]);

  if (!user || user.role !== 'ADMIN') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
          <ShieldAlert size={48} className="text-red-400 mb-3" />
          <p className="text-gray-600 font-medium">Нет доступа</p>
          <button onClick={() => navigate('/')} className="mt-4 text-green-600 font-semibold">На главную</button>
        </div>
      </Layout>
    );
  }

  const tiles = [
    {
      icon: <Package size={22} className="text-blue-500" />,
      label: 'Лоты',
      value: stats.totalLots ?? lots.length,
      sub: `${stats.activeLots ?? '—'} активных`,
      bg: 'bg-blue-50',
    },
    {
      icon: <Users size={22} className="text-green-500" />,
      label: 'Участники',
      value: stats.totalBookings ?? '—',
      sub: 'всего броней',
      bg: 'bg-green-50',
    },
    {
      icon: <Building2 size={22} className="text-purple-500" />,
      label: 'ЖК',
      value: stats.totalComplexes ?? '—',
      sub: 'в Астане',
      bg: 'bg-purple-50',
    },
    {
      icon: <BarChart3 size={22} className="text-orange-500" />,
      label: 'Фермеров',
      value: stats.totalFarmers ?? '—',
      sub: 'зарегистрировано',
      bg: 'bg-orange-50',
    },
  ];

  const quickLinks = [
    { label: 'Управление фермерами', icon: '👨‍🌾' },
    { label: 'Все лоты', icon: '📦' },
    { label: 'ЖК Астаны', icon: '🏢' },
    { label: 'Пользователи', icon: '👥' },
  ];

  return (
    <Layout>
      <div className="bg-gradient-to-b from-purple-700 to-purple-600 px-4 pt-14 pb-6 safe-top">
        <button onClick={() => navigate(-1)} className="mb-4 text-white/70">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-2xl font-black text-white">Панель администратора</h1>
        <p className="text-purple-100 text-sm">DalaMart Admin</p>
      </div>

      <div className="px-4 py-5 space-y-5">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="rounded-2xl h-24 animate-pulse bg-gray-100" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {tiles.map(t => (
              <div key={t.label} className={`${t.bg} rounded-2xl p-4`}>
                {t.icon}
                <div className="font-black text-2xl text-gray-900 mt-2">
                  {typeof t.value === 'number' ? t.value.toLocaleString('ru-KZ') : t.value}
                </div>
                <div className="text-sm font-semibold text-gray-700">{t.label}</div>
                <div className="text-xs text-gray-500">{t.sub}</div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
          {quickLinks.map(link => (
            <button
              key={link.label}
              onClick={() => alert(`Раздел «${link.label}» — в разработке`)}
              className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-gray-50"
            >
              <span className="text-xl">{link.icon}</span>
              <span className="flex-1 text-left font-semibold text-gray-800 text-sm">{link.label}</span>
              <span className="text-gray-300">›</span>
            </button>
          ))}
        </div>

        {/* Recent lots */}
        {lots.length > 0 && (
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Последние лоты</h3>
            <div className="space-y-2">
              {lots.map(lot => {
                const isFilled = lot.status === 'CONFIRMED';
                return (
                  <div key={lot.id} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
                    <span className="text-2xl">{CATEGORY_EMOJI[lot.category] || '🌾'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">{lot.title}</p>
                      <p className="text-xs text-gray-400">{lot.farmer?.fullName ?? 'Фермер'}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-700">
                        {lot.currentParticipants}/{lot.targetParticipants}
                      </div>
                      <div className={`text-xs font-semibold ${isFilled ? 'text-green-600' : 'text-blue-500'}`}>
                        {isFilled ? 'Набран' : 'Активен'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
