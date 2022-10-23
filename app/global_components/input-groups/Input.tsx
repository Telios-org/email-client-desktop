import React, { useState, ChangeEventHandler } from 'react';

// EXTERNAL LIBRAIRIES
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationIcon,
  MailIcon,
  KeyIcon
} from '@heroicons/react/outline';
import clsx from 'clsx';

type Props = {
  label?: string;
  onChange?: (value: ChangeEventHandler<HTMLInputElement>) => void | undefined;
  id: string | number;
  name: string;
  type?: string;
  icon?: 'none' | 'email' | 'key';
  autoComplete?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  value?: any;
  defaultValue?: any;
  addonPosition?: 'left' | 'right' | undefined;
  activityPosition?: 'left' | 'right' | undefined;
  addonLabel?: string;
  className?: string;
  isValid?: boolean | undefined;
  showLoader?: boolean;
};

const Input = (props: Props) => {
  const {
    label,
    onChange: onChangeFromProps,
    id,
    name,
    type,
    icon,
    autoComplete = '',
    required = false,
    error = '',
    placeholder = '',
    disabled,
    value: valueFromProps,
    defaultValue,
    addonPosition,
    addonLabel,
    activityPosition,
    className,
    isValid,
    showLoader
  } = props;

  // A component can be considered controlled when its value prop is
  // not undefined.
  const isControlled = typeof valueFromProps !== 'undefined';
  // When a component is not controlled, it can have a defaultValue.
  const hasDefaultValue = typeof defaultValue !== 'undefined';
  // If a defaultValue is specified, we will use it as our initial
  // state.  Otherwise, we will simply use an empty string.
  const [internalValue, setInternalValue] = useState(
    hasDefaultValue ? defaultValue : ''
  );
  // Internally, we need to deal with some value. Depending on whether
  // the component is controlled or not, that value comes from its
  // props or from its internal state.
  const value = isControlled ? valueFromProps : internalValue;

  const onChange = e => {
    // When the user types, we will call props.onChange if it exists.
    // We do this even if there is no props.value (and the component
    // is uncontrolled.)
    if (onChangeFromProps) {
      onChangeFromProps(e);
    }
    // If the component is uncontrolled, we need to update our
    // internal value here.
    if (!isControlled) {
      setInternalValue(e.target.value);
    }
  };

  return (
    <div className="flex-1">
      {label.length > 0 && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-slate-700 capitalize"
        >
          {label}
        </label>
      )}
      <div className="relative mt-1">
        <div className="relative flex rounded-md shadow-sm focus-within:ring-1 focus-within:ring-violet-500 focus-within:border-violet-500">
          {icon === 'email' &&
            (((isValid === undefined || value.length === 0) && !showLoader) ||
              activityPosition === 'right') && (
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MailIcon className="h-5 w-5 text-gray-400" />
              </div>
            )}
          {icon === 'key' &&
            (((isValid === undefined || value.length === 0) && !showLoader) ||
              activityPosition === 'right') && (
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyIcon className="h-5 w-5 text-gray-400" />
              </div>
            )}
          {!showLoader && isValid !== undefined && value.length > 0 && (
            <div
              className={clsx(
                'absolute inset-y-0 flex items-center pointer-events-none',
                activityPosition === 'left' ? 'left-0 pl-3' : 'right-0 pr-3'
              )}
            >
              {isValid && (
                <CheckCircleIcon className="text-green-500 h-5 w-5" />
              )}
              {!isValid && <ExclamationIcon className="text-red-500 h-5 w-5" />}
            </div>
          )}
          {showLoader && (
            <div
              className={clsx(
                'absolute inset-y-0 flex items-center pointer-events-none',
                activityPosition === 'left' ? 'left-0 pl-3' : 'right-0 pr-3'
              )}
            >
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          )}
          {addonPosition === 'left' && (
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
              {addonLabel}
            </span>
          )}
          <input
            id={id}
            name={name}
            type={type === 'email' ? 'text' : type}
            autoComplete={autoComplete}
            required={required}
            onChange={onChange}
            placeholder={placeholder}
            value={value}
            disabled={disabled}
            className={clsx(
              disabled && 'bg-gray-200 font-medium text-gray-500',
              addonPosition === 'left' && 'rounded-none rounded-r-md',
              addonPosition === 'right' && 'rounded-none rounded-l-md',
              !addonPosition && 'rounded-md',
              (isValid !== undefined ||
                icon !== 'none' ||
                (showLoader && activityPosition === 'left')) && activityPosition !== 'right' &&
                'pl-10',
              `appearance-none block w-full px-3 py-2 border border-gray-300 
          placeholder-gray-400 focus:outline-none
           sm:text-sm`,
              className
            )}
          />
          {addonPosition === 'right' && (
            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
              {addonLabel}
            </span>
          )}
        </div>

        <div className="absolute -bottom-6 left-2 flex items-center justify-start text-xs">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    </div>
  );
};

Input.defaultProps = {
  label: '',
  autoComplete: '',
  error: '',
  type: 'text',
  icon: 'none',
  placeholder: '',
  disabled: false,
  onChange: undefined,
  value: '',
  defaultValue: '',
  addonPosition: undefined,
  addonLabel: '',
  className: '',
  isValid: undefined,
  showLoader: false,
  required: false,
  activityPosition: 'left'
};

export default Input;
