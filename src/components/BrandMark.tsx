import catPawMark from '../assets/pethealth-cat-paw-from-reference.svg';
import './brand-mark.css';

type BrandMarkProps = {
  size?: 'sm' | 'md';
};

/** Reference cat paw mark (`src/assets/pethealth-cat-paw-from-reference.svg`). */
export function BrandMark({ size = 'md' }: BrandMarkProps) {
  return (
    <span className={`brand-mark brand-mark--${size}`} aria-hidden="true">
      <img
        className="brand-mark__asset"
        src={catPawMark}
        alt=""
        draggable={false}
      />
    </span>
  );
}
