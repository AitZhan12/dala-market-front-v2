interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  inverted?: boolean;
}

export function Logo({ size = 'md', inverted = false }: LogoProps) {
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 44 : 34;
  const textClass = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl';
  const bg = inverted ? 'white' : '#16a34a';
  const fg = inverted ? '#16a34a' : 'white';

  return (
    <div className="flex items-center gap-2">
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Rounded square background */}
        <rect width="40" height="40" rx="11" fill={bg} />

        {/* Bold "D" shape — fillRule evenodd creates the counter */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9 9H19Q33 9 33 20Q33 31 19 31H9Z M13 14H19Q28 14 28 20Q28 26 19 26H13Z"
          fill={fg}
        />

        {/* Leaf growing from top-right curve of D */}
        {/* Right petal */}
        <path
          d="M26 10 C28 5 34 6 32 10 C30 13 26 12 26 10Z"
          fill={inverted ? '#16a34a' : '#86efac'}
        />
        {/* Left petal */}
        <path
          d="M26 10 C24 5 20 7 21 10 C22 13 25 12 26 10Z"
          fill={inverted ? '#166534' : '#4ade80'}
        />
        {/* Stem connecting leaf to top of D */}
        <line
          x1="26" y1="10" x2="23" y2="14"
          stroke={inverted ? '#16a34a' : '#bbf7d0'}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      <span className={`font-black ${textClass} leading-none tracking-tight`}>
        <span className={inverted ? 'text-white' : 'text-green-800'}>Dala</span>
        <span className={inverted ? 'text-green-200' : 'text-orange-500'}>Mart</span>
      </span>
    </div>
  );
}
