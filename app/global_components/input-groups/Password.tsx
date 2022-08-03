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
  onVisibilityToggle?: () => void;
};

const Password = (props: Props) => {
  const {
    label,
    id,
    name,
    className,
    autoComplete = 'current-password',
    required = false,
    onChange,
    error,
    value,
    show = null, // Not required only if you want the state to be handled by parent
    onVisibilityToggle // Not required only if you want the state to be handled by parent
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

  return (
    <div className={clsx('relative', className)}>
      {label.length > 0 && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-slate-700 dark:text-white capitalize"
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
          className={clsx(
            'appearance-none block w-full px-3 py-2 border sm:text-sm',
            'rounded-md shadow-sm dark:shadow-md dark:shadow-primary-blue-500/50 placeholder-gray-400',
            error?.length > 0
              ? 'pr-10 border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:outline-none focus:ring-primary-blue-500 focus:border-primary-blue-500'
          )}
          aria-invalid={error?.length > 0 ? 'true' : 'false'}
          aria-describedby="password"
          value={value}
        />

        <div
          onClick={overwriteToggle}
          className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-300 hover:text-gray-400"
          style={{ cursor: 'pointer' }}
        >
          {!showPassword && (
            <EyeOffIcon className="h-5 w-5" aria-hidden="true" />
          )}
          {showPassword && <EyeIcon className="h-5 w-5" aria-hidden="true" />}
          {error?.length > 0 && (
            <div className="absolute inset-y-0 right-6 pr-3 flex items-center pointer-events-none">
              <ExclamationCircleIcon
                className="h-5 w-5 text-red-500"
                aria-hidden="true"
              />
            </div>
          )}
        </div>

        <div className="absolute -bottom-6 flex items-center justify-start text-xs">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    </div>
  );
};

export default Password;
