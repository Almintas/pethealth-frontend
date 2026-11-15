import './user-initials-avatar.css';

type UserInitialsAvatarProps = {
  initials: string;
  size?: 'md' | 'lg';
};

export function UserInitialsAvatar({
  initials,
  size = 'md',
}: UserInitialsAvatarProps) {
  const label = initials.trim() || 'U';

  return (
    <span
      className={[
        'user-initials-avatar',
        `user-initials-avatar--${size}`,
      ].join(' ')}
      aria-hidden="true"
    >
      {label}
    </span>
  );
}
