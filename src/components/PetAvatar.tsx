import { useEffect, useState } from 'react';
import './pet-avatar.css';

type PetAvatarProps = {
  species: string;
  name: string;
  photoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
};

function resolveSpeciesKey(species: string): string {
  return species.trim().toLowerCase();
}

export function PetAvatar({
  species,
  name,
  photoUrl,
  size = 'md',
}: PetAvatarProps) {
  const key = resolveSpeciesKey(species);
  const label = `${name} avatar`;
  const trimmedPhoto = photoUrl?.trim() ?? '';
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    setPhotoFailed(false);
  }, [trimmedPhoto]);

  const showPhoto = Boolean(trimmedPhoto) && !photoFailed;

  const speciesClass = key.includes('dog')
    ? 'dog'
    : key.includes('cat')
      ? 'cat'
      : key.includes('bird')
        ? 'bird'
        : key.includes('rabbit')
          ? 'rabbit'
          : 'default';

  return (
    <div
      className={`pet-avatar pet-avatar--${size} pet-avatar--${speciesClass}`}
      role="img"
      aria-label={label}
    >
      {showPhoto ? (
        <img
          className="pet-avatar__photo"
          src={trimmedPhoto}
          alt=""
          decoding="async"
          loading="lazy"
          onError={() => setPhotoFailed(true)}
        />
      ) : null}
      <svg
        viewBox="0 0 64 64"
        aria-hidden="true"
        focusable="false"
        className={showPhoto ? 'pet-avatar__fallback' : undefined}
      >
        <circle cx="32" cy="32" r="30" className="pet-avatar__bg" />
        {key.includes('dog') ? (
          <>
            <ellipse cx="18" cy="24" rx="8" ry="12" className="pet-avatar__ear" />
            <ellipse cx="46" cy="24" rx="8" ry="12" className="pet-avatar__ear" />
            <circle cx="32" cy="34" r="14" className="pet-avatar__face" />
            <circle cx="27" cy="32" r="2" className="pet-avatar__eye" />
            <circle cx="37" cy="32" r="2" className="pet-avatar__eye" />
            <ellipse cx="32" cy="38" rx="4" ry="3" className="pet-avatar__nose" />
          </>
        ) : key.includes('cat') ? (
          <>
            <polygon points="14,28 22,12 26,28" className="pet-avatar__ear" />
            <polygon points="50,28 42,12 38,28" className="pet-avatar__ear" />
            <circle cx="32" cy="36" r="13" className="pet-avatar__face" />
            <circle cx="27" cy="35" r="2" className="pet-avatar__eye" />
            <circle cx="37" cy="35" r="2" className="pet-avatar__eye" />
            <path d="M30 40 L32 42 L34 40" className="pet-avatar__nose" />
          </>
        ) : (
          <>
            <circle cx="32" cy="34" r="16" className="pet-avatar__face" />
            <circle cx="26" cy="32" r="2" className="pet-avatar__eye" />
            <circle cx="38" cy="32" r="2" className="pet-avatar__eye" />
            <ellipse cx="32" cy="38" rx="5" ry="4" className="pet-avatar__nose" />
            <ellipse cx="20" cy="40" rx="6" ry="4" className="pet-avatar__ear" />
            <ellipse cx="44" cy="40" rx="6" ry="4" className="pet-avatar__ear" />
          </>
        )}
      </svg>
    </div>
  );
}
