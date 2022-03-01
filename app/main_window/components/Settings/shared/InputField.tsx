import React from 'react';
import classNames from '../../../../utils/helpers/css';

type Props = {
  id: string;
  type?:
    | 'button'
    | 'checkbox'
    | 'color'
    | 'date'
    | 'datetime-local'
    | 'email'
    | 'file'
    | 'hidden'
    | 'image'
    | 'month'
    | 'number'
    | 'password'
    | 'radio'
    | 'range'
    | 'reset'
    | 'search'
    | 'submit'
    | 'tel'
    | 'text'
    | 'time'
    | 'url'
    | 'week';
  placeholder?: string;
  label: string;
  value: any;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  error?: string | null;
  disabled?: boolean;
};

const InputField = (props: Props) => {
  const {
    id,
    type,
    label,
    placeholder,
    value,
    onChange,
    className,
    error,
    disabled
  } = props;
  return (
    <div className={classNames('relative', className)}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type={type}
        name={id}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={classNames(
          disabled ? 'bg-gray-100 text-gray-500' : '',
          'mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-700 focus:border-purple-700 sm:text-sm'
        )}
      />
      {error && (
        <p className="absolute -bottom-4 text-red-400 text-xs pl-2 pt-1">
          {error}
        </p>
      )}
    </div>
  );
};

InputField.defaultProps = {
  type: 'text',
  placeholder: '',
  className: '',
  error: null,
  disabled: false,
  onChange: () => {}
};

export default InputField;
