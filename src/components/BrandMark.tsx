import brandMark from '../assets/brand-mark.svg';
import './brand-mark.css';

type BrandMarkProps = {
  size?: 'sm' | 'md';
};

/** PetHealth paw mark (same artwork as the favicon in `public/favicon.svg`). */
export function BrandMark({ size = 'md' }: BrandMarkProps) {
  return (
    <span className={`brand-mark brand-mark--${size}`} aria-hidden="true">
      <img
        className="brand-mark__asset"
        src={brandMark}
        alt=""
        draggable={false}
      />
    </span>
  );
}
