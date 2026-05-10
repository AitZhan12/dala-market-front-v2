interface GroupProgressProps {
  current: number;
  target: number;
  deadline: string;
  large?: boolean;
}

export function GroupProgress({ current, target, deadline, large = false }: GroupProgressProps) {
  const percent = Math.min((current / target) * 100, 100);
  const remaining = target - current;
  const daysLeft = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isFilled = current >= target;
  const isAlmostFull = percent >= 75;

  const barColor = isFilled
    ? 'bg-green-500'
    : isAlmostFull
    ? 'bg-orange-400'
    : 'bg-green-400';

  const countColor = isFilled
    ? 'text-green-600'
    : isAlmostFull
    ? 'text-orange-500'
    : 'text-gray-700';

  const deadlineText =
    daysLeft <= 0
      ? 'Сегодня последний день!'
      : daysLeft === 1
      ? 'Последний день'
      : `${daysLeft} дн.`;

  const deadlineColor = daysLeft <= 1 ? 'text-red-500 font-semibold' : 'text-gray-400';

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className={`font-semibold ${large ? 'text-base' : 'text-sm'} ${countColor}`}>
          {isFilled ? '✓ Набрано! Закупка состоится' : `${current} из ${target} участников`}
        </span>
        <span className={`${large ? 'text-sm' : 'text-xs'} ${deadlineColor}`}>
          {deadlineText}
        </span>
      </div>
      <div className={`${large ? 'h-3' : 'h-2'} bg-gray-100 rounded-full overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {!isFilled && (
        <p className={`mt-1 ${large ? 'text-sm' : 'text-xs'} text-gray-400`}>
          Ещё {remaining} {remaining === 1 ? 'участник' : remaining < 5 ? 'участника' : 'участников'} — и доставка подтверждена
        </p>
      )}
    </div>
  );
}
