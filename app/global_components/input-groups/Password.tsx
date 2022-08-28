import React, { useState, useEffect, ChangeEventHandler } from 'react';

// EXTERNAL LIBRARY
import { EyeIcon, EyeOffIcon } from '@heroicons/react/outline';
import { ExclamationCircleIcon } from '@heroicons/react/solid';
import clsx from 'clsx';

type Props = {
  label: string;
  id: string | number;
  name: string;
  className?: string;
  autoComplete?: string;
  required?: boolean;
  onChange: (value: ChangeEventHandler<HTMLInputElement>) => void;
  error: string;
  show?: boolean | null;
  value: string;
  defaultValue?: string;
  onVisibilityToggle?: () => void;
};

const Password = (props: Props) => {
  const {
    label,
    id,
    name,
    autoComplete = 'current-password',
    required,
    className,
    onChange: onChangeFromProps,
    error,
    show = null, // Not required only if you want the state to be handled by parent
    onVisibilityToggle, // Not required only if you want the state to be handled by parent
    value: valueFromProps,
    defaultValue
  } = props;
  // Functions below handle the Visibility state locally if not overwriten by parent.
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordView = () => {
    setShowPassword(!showPassword);
  };
  const overwriteToggle = () => {
    if (typeof onVisibilityToggle === 'function') {
      onVisibilityToggle();
    }
    togglePasswordView();
  };
  useEffect(() => {
    if (show !== null) {
      setShowPassword(show);
    }
  }, [show]);
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
    <div className={clsx('relative', className)}>
      {label.length > 0 && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-slate-700 capitalize"
        >
          {label}
        </label>
      )}
      <div className="mt-1 relative">
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          autoComplete={autoComplete}
          required={required}
          onChange={onChange}
          value={value}
          className={clsx(
            'appearance-none block w-full px-3 py-2 border sm:text-sm',
            'rounded-md shadow-sm placeholder-gray-400',
            error?.length > 0
              ? 'pr-10 border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:outline-none focus:ring-primary-blue-500 focus:border-primary-blue-500'
          )}
          aria-invalid={error?.length > 0 ? 'true' : 'false'}
          aria-describedby="password"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex flex-row space-x-2">
          <div className="flex items-center pointer-events-none">
            {error?.length > 0 && (
              <ExclamationCircleIcon
                className="h-5 w-5 text-red-500"
                aria-hidden="true"
              />
            )}
          </div>
          <div
            onClick={overwriteToggle}
            className="flex items-center cursor-pointer text-gray-400 hover:text-gray-500"
            style={{ cursor: 'pointer' }}
          >
            {!showPassword && (
              <EyeOffIcon className="h-5 w-5" aria-hidden="true" />
            )}
            {showPassword && <EyeIcon className="h-5 w-5" aria-hidden="true" />}
          </div>
        </div>
      </div>
      <div className="absolute -bottom-5 pl-2 flex items-center justify-start text-xs">
        <div className="text-red-600">{error}</div>
      </div>
    </div>
  );
};
export default Password;

Password.defaultProps = {
  className: '',
  autoComplete: '',
  required: false,
  show: null,
  defaultValue: ''
};
