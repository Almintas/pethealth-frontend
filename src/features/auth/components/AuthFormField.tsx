import type { InputHTMLAttributes } from 'react';

type AuthFormFieldProps = {
  id: string;
  label: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function AuthFormField({
  id,
  label,
  error,
  className,
  ...inputProps
}: AuthFormFieldProps) {
  const inputClassName = [
    'auth-field__input',
    error ? 'auth-field__input--error' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="auth-field">
      <label className="auth-field__label" htmlFor={id}>
        {label}
      </label>
      <input id={id} className={inputClassName} aria-invalid={Boolean(error)} {...inputProps} />
      {error ? (
        <p className="auth-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
