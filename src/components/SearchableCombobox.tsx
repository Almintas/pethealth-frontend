import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import './searchable-combobox.css';

type SearchableComboboxProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  allowCustom?: boolean;
  hint?: string;
  /** Maps stored option values to localized labels (value stays canonical). */
  optionLabel?: (value: string) => string;
  /** When set, blur resolves typed text to a canonical option value. */
  resolveCanonicalValue?: (input: string) => string;
};

export function SearchableCombobox({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  required = false,
  error,
  allowCustom = true,
  hint,
  optionLabel,
  resolveCanonicalValue,
}: SearchableComboboxProps) {
  const { t, i18n } = useTranslation();
  const resolvedPlaceholder = placeholder ?? t('common.typeOrSelect');
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [draft, setDraft] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const labelFor = (option: string) => optionLabel?.(option) ?? option;

  const displayValue = useMemo(() => {
    if (isFocused && draft !== null) {
      return draft;
    }
    if (value && options.some((option) => option === value)) {
      return labelFor(value);
    }
    return value;
  }, [draft, isFocused, options, optionLabel, value, i18n.language]);

  const filteredOptions = useMemo(() => {
    const query = (isFocused && draft !== null ? draft : displayValue)
      .trim()
      .toLowerCase();
    const base = query
      ? options.filter((option) => {
          const localized = labelFor(option).toLowerCase();
          return (
            option.toLowerCase().includes(query) || localized.includes(query)
          );
        })
      : [...options];

    if (
      allowCustom &&
      query &&
      !options.some(
        (option) =>
          option.toLowerCase() === query ||
          labelFor(option).toLowerCase() === query,
      )
    ) {
      return base;
    }

    return base;
  }, [allowCustom, displayValue, draft, isFocused, options, optionLabel, i18n.language]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const commitValue = (next: string) => {
    const resolved = resolveCanonicalValue?.(next) ?? next;
    onChange(resolved);
    setDraft(null);
  };

  const selectOption = (option: string) => {
    commitValue(option);
    setIsOpen(false);
    setActiveIndex(-1);
    setIsFocused(false);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (draft !== null) {
      commitValue(draft);
    }
    setDraft(null);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
      setDraft(null);
      return;
    }

    if (!isOpen && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      setIsOpen(true);
      setActiveIndex(filteredOptions.length > 0 ? 0 : -1);
      event.preventDefault();
      return;
    }

    if (!isOpen) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) =>
        current < filteredOptions.length - 1 ? current + 1 : 0,
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) =>
        current > 0 ? current - 1 : filteredOptions.length - 1,
      );
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      selectOption(filteredOptions[activeIndex]);
    }
  };

  const showCustomHint =
    allowCustom &&
    (isFocused ? draft ?? displayValue : displayValue).trim().length > 0 &&
    !options.some(
      (option) =>
        option.toLowerCase() === (draft ?? value).trim().toLowerCase() ||
        labelFor(option).toLowerCase() === (draft ?? displayValue).trim().toLowerCase(),
    );

  return (
    <div className="searchable-combobox" ref={rootRef}>
      <label className="searchable-combobox__label" htmlFor={id}>
        {label}
        {required ? (
          <span className="searchable-combobox__required" aria-hidden="true">
            {' '}
            *
          </span>
        ) : null}
      </label>

      <div className="searchable-combobox__control">
        <input
          id={id}
          className={[
            'searchable-combobox__input',
            error ? 'searchable-combobox__input--error' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-invalid={Boolean(error)}
          value={displayValue}
          placeholder={resolvedPlaceholder}
          disabled={disabled}
          required={required}
          onChange={(event) => {
            const next = event.target.value;
            setDraft(next);
            onChange(next);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => {
            setIsFocused(true);
            setDraft(displayValue);
            setIsOpen(true);
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className="searchable-combobox__toggle"
          aria-label={t('common.showOptionsFor', { label })}
          disabled={disabled}
          onClick={() => setIsOpen((open) => !open)}
        >
          ▾
        </button>
      </div>

      {hint ? <p className="searchable-combobox__hint">{hint}</p> : null}

      {isOpen && filteredOptions.length > 0 ? (
        <ul id={listId} className="searchable-combobox__list" role="listbox">
          {filteredOptions.map((option, index) => (
            <li key={option} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={value === option || activeIndex === index}
                className={[
                  'searchable-combobox__option',
                  activeIndex === index ? 'searchable-combobox__option--active' : '',
                  value === option ? 'searchable-combobox__option--selected' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectOption(option)}
              >
                {labelFor(option)}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {showCustomHint && isOpen ? (
        <p className="searchable-combobox__custom-hint" role="status">
          {t('common.usingCustomValue', {
            value: (draft ?? displayValue).trim(),
          })}
        </p>
      ) : null}

      {error ? (
        <p className="searchable-combobox__error" role="alert">{error}</p>
      ) : null}
    </div>
  );
}
