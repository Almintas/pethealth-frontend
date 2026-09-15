import './brand-mark.css';

type BrandMarkProps = {
  size?: 'sm' | 'md';
};

export function BrandMark({ size = 'md' }: BrandMarkProps) {
  return (
    <span className={`brand-mark brand-mark--${size}`} aria-hidden="true">
      <svg viewBox="0 0 32 32" focusable="false">
        <rect className="brand-mark__tile" width="32" height="32" rx="8" />
        <g className="brand-mark__paw">
          <ellipse cx="11" cy="12" rx="3" ry="3.5" />
          <ellipse cx="21" cy="12" rx="3" ry="3.5" />
          <ellipse cx="8" cy="18" rx="2.5" ry="3" />
          <ellipse cx="24" cy="18" rx="2.5" ry="3" />
          <path d="M10 20 C14 24, 18 24, 22 20 C20 26, 12 26, 10 20 Z" />
        </g>
      </svg>
    </span>
  );
}
