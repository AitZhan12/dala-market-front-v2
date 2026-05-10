import { useNavigate } from 'react-router-dom';
import { Lot } from '../types';
import { GroupProgress } from './GroupProgress';

const CATEGORY_LABELS: Record<string, string> = {
  dairy: 'Молочное',
  meat: 'Мясо',
  eggs: 'Яйца',
  honey: 'Мёд',
  vegetables: 'Овощи',
  fruits: 'Фрукты',
};

const CATEGORY_BG: Record<string, string> = {
  dairy: 'from-blue-50 to-sky-100',
  meat: 'from-red-50 to-rose-100',
  eggs: 'from-yellow-50 to-amber-100',
  honey: 'from-amber-50 to-yellow-100',
  vegetables: 'from-green-50 to-emerald-100',
  fruits: 'from-orange-50 to-red-100',
};

export function LotCard({ lot }: { lot: Lot }) {
  const navigate = useNavigate();
  const isFilled = lot.status === 'filled' || lot.currentOrders >= lot.groupTarget;
  const bgGradient = CATEGORY_BG[lot.category] || 'from-gray-50 to-gray-100';

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer active:scale-[0.97] transition-transform"
      onClick={() => navigate(`/lot/${lot.id}`)}
    >
      {/* Image / Emoji area */}
      <div className={`h-28 bg-gradient-to-br ${bgGradient} flex items-center justify-center relative overflow-hidden`}>
        {lot.photoUrl ? (
          <img
            src={lot.photoUrl}
            alt={lot.title}
            className="w-full h-full object-cover"
            onError={e => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <span className={`text-5xl ${lot.photoUrl ? 'hidden' : ''}`}>{lot.emoji}</span>

        {isFilled && (
          <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            ✓ Набрано
          </div>
        )}

        <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm text-xs font-medium text-gray-600 px-2 py-0.5 rounded-full">
          {CATEGORY_LABELS[lot.category]}
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5">
        <div className="flex justify-between items-start gap-2 mb-1.5">
          <h3 className="font-bold text-gray-900 text-[15px] leading-tight">{lot.title}</h3>
          <div className="text-right shrink-0">
            <div className="font-black text-green-700 text-lg leading-none">
              {lot.price.toLocaleString('ru-KZ')}
            </div>
            <div className="text-xs text-gray-400">тг/{lot.unit}</div>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-3">
          <span className="text-amber-400 text-sm">★</span>
          <span className="text-sm font-medium text-gray-700">{lot.farmer.rating}</span>
          <span className="text-gray-200 mx-0.5">|</span>
          <span className="text-sm text-gray-500 truncate">{lot.farmer.name}</span>
          {lot.farmer.verified && (
            <span className="text-green-500 text-xs ml-0.5" title="Проверенный фермер">✓</span>
          )}
        </div>

        <GroupProgress
          current={lot.currentOrders}
          target={lot.groupTarget}
          deadline={lot.deadline}
        />
      </div>
    </div>
  );
}
