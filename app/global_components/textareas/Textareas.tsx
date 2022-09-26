import React, { ChangeEventHandler } from 'react';

import clsx from 'clsx';

type Props = {
  label: string;
  onChange?: (value: ChangeEventHandler<HTMLInputElement>) => void | undefined;
  id: string | number;
  rows?: number;
  name: string;
  required: boolean;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  value?: string;
  defaultValue?: string;
};

const Textareas = (props: Props) => {
  const {
    label,
    onChange = () => {},
    id,
    name,
    rows,
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
      <div className="mt-1">
        <textarea
          rows={rows}
          name={name}
          id={id}
          disabled={disabled}
          value={value}
          required={required}
          placeholder={placeholder}
          onChange={onChange}
          className="form-textarea shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        />
        <div className="absolute -bottom-6 left-2 flex items-center justify-start text-xs">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    </div>
  );
};

Textareas.defaultProps = {
  error: '',
  placeholder: '',
  disabled: false,
  onChange: undefined,
  value: '',
  rows: 4
};

export default Textareas;
