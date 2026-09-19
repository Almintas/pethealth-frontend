import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
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
};

export function SearchableCombobox({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = 'Type or select…',
  disabled = false,
  required = false,
  error,
  allowCustom = true,
  hint,
}: SearchableComboboxProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const filteredOptions = useMemo(() => {
    const query = value.trim().toLowerCase();
    const base = query
      ? options.filter((option) => option.toLowerCase().includes(query))
      : [...options];

    if (
      allowCustom &&
      query &&
      !options.some((option) => option.toLowerCase() === query)
    ) {
      return base;
    }

    return base;
  }, [allowCustom, options, value]);

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

  const selectOption = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
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
    value.trim().length > 0 &&
    !options.some(
      (option) => option.toLowerCase() === value.trim().toLowerCase(),
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
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onChange={(event) => {
            onChange(event.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className="searchable-combobox__toggle"
          aria-label={`Show ${label} options`}
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
                {option}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {showCustomHint && isOpen ? (
        <p className="searchable-combobox__custom-hint" role="status">
          Using custom value: {value.trim()}
        </p>
      ) : null}

      {error ? (
        <p className="searchable-combobox__error" role="alert">{error}</p>
      ) : null}
    </div>
  );
}
