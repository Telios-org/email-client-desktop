import React, { ChangeEventHandler } from 'react';

import clsx from 'clsx';

type Props = {
  label: string;
  onChange?: (value: ChangeEventHandler<HTMLInputElement>) => void | undefined;
  id: string | number;
  name: string;
  type: string;
  autoComplete?: string;
  required: boolean;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  value?: any;
};

const Input = (props: Props) => {
  const {
    label,
    onChange,
    id,
    name,
    type,
    autoComplete = '',
    required = false,
    error = '',
    placeholder = '',
    disabled,
    value
  } = props;

  return (
    <div>
      {label.length > 0 && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-slate-700 dark:text-white capitalize"
        >
          {label}
        </label>
      )}
      <div className="relative mt-1">
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required={required}
          onChange={onChange}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          className={clsx(
            disabled && 'bg-gray-200 font-medium text-gray-500',
            `appearance-none block w-full px-3 py-2 border border-gray-300 
            rounded-md shadow-sm dark:shadow-md 
            dark:shadow-primary-blue-500/50 placeholder-gray-400 
            focus:outline-none focus:ring-primary-blue-500 
            focus:border-primary-blue-500 sm:text-sm`
          )}
        />
        <div className="absolute -bottom-6 left-2 flex items-center justify-start text-xs">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    </div>
  );
};

Input.defaultProps = {
  autoComplete: '',
  error: '',
  placeholder: '',
  disabled: false,
  onChange: undefined,
  value: ''
};

export default Input;
