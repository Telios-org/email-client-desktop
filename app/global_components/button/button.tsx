import React from 'react';

// EXTERNAL LIBRAIRIES
import clsx from 'clsx';

const styles = {
  primary: {
    btn:
      'w-full flex justify-center px-6 py-3 rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue-600 border border-gray-300 bg-gradient-to-tr from-[#0284C7] to-[#0EA5E9] hover:to-[#0284C7] ',
    spinner: 'text-white'
  },
  secondary: {
    btn:
      'w-full flex justify-center px-6 py-3 rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 border border-gray-300 bg-gradient-to-tr from-purple-600 to-purple-500 hover:to-purple-700 ',
    spinner: 'text-white'
  },
  outline: {
    btn:
      'w-full px-4 py-3 flex justify-center rounded-md shadow-sm text-sm text-gray-400 hover:text-gray-500 font-medium  border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300',
    spinner: ''
  },
  disabled: {
    btn:
      'w-full flex justify-center px-6 py-3 rounded-md shadow-sm text-sm font-medium text-white border border-gray-200 bg-gray-200 text-gray-300',
    spinner: ''
  }
};

type Props = {
  variant?: 'primary' | 'outline' | 'disabled' | 'secondary';
  type?: 'button' | 'submit';
  className?: string;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  onClick?: () => void;
  children: any;
};

const Button = ({
  variant,
  type,
  className,
  onClick,
  loading,
  loadingText,
  children,
  disabled,
  ...props
}: Props) => {
  const cls = clsx(
    disabled ? styles.disabled.btn : styles[variant].btn,
    className
  );
  const spinnerClass = clsx(
    styles[variant].spinner,
    'animate-spin -ml-1 mr-3 h-5 w-5'
  );
  return (
    <button
      type={type}
      className={cls}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {!loading && children}
      {loading && (
        <>
          <svg
            className={spinnerClass}
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
          <span className="text-sm animate-pulse">{loadingText}</span>
        </>
      )}
    </button>
  );
};

Button.defaultProps = {
  variant: 'primary',
  type: 'submit',
  className: '',
  loading: false,
  disabled: false,
  loadingText: '',
  onClick: () => {}
};

export default Button;
