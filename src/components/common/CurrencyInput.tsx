import React, { useState, useEffect } from 'react';

interface CurrencyInputProps {
  value: number | '';
  onChange: (value: number | '') => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  className = '',
  placeholder = '0',
  disabled = false,
  required = false,
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
    let raw = e.target.value.replace(/[^0-9]/g, '');
    
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

  return (
    <input
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      className={className}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
    />
  );
};
