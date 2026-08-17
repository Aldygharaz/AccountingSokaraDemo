import React, { useState, useEffect } from 'react';

interface CurrencyInputProps {
  value: number | '';
  onChange: (value: number | '') => void;
  className?: string;
  containerClassName?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  showPrefix?: boolean;
  prefix?: string;
  autoFocus?: boolean;
  id?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  className = '',
  containerClassName = '',
  placeholder = '0',
  disabled = false,
  required = false,
  showPrefix = true,
  prefix = 'Rp',
  autoFocus = false,
  id,
}) => {
  const [displayValue, setDisplayValue] = useState<string>('');

  useEffect(() => {
    if (value === '' || value === null || value === undefined) {
      setDisplayValue('');
    } else {
      setDisplayValue(value.toLocaleString('id-ID'));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const raw = e.target.value.replace(/[^0-9]/g, '');

    if (raw === '') {
      setDisplayValue('');
      onChange('');
      return;
    }

    // Parse to integer
    const num = parseInt(raw, 10);
    setDisplayValue(num.toLocaleString('id-ID'));
    onChange(num);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  if (!showPrefix) {
    return (
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        className={`font-mono text-right tabular-nums transition-all focus:outline-none ${className}`}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoFocus={autoFocus}
      />
    );
  }

  return (
    <div
      className={`relative flex items-center rounded-xl border border-slate-200 dark:border-[#3F4147] bg-white dark:bg-[#1E1F22] shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 ${
        disabled ? 'opacity-60 cursor-not-allowed bg-slate-50 dark:bg-[#2B2D31]' : ''
      } ${containerClassName}`}
    >
      <span className="flex items-center justify-center pl-3.5 pr-2 py-2 text-xs font-black text-slate-400 dark:text-[#80848E] select-none font-mono border-r border-slate-100 dark:border-[#3F4147]">
        {prefix}
      </span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        className={`w-full py-2 px-3 bg-transparent text-sm font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#80848E] focus:outline-none tabular-nums ${className}`}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoFocus={autoFocus}
      />
    </div>
  );
};
