import React from 'react'

const Input = (props) => {
  const {
    label,
    onChange,
    id,
    name,
    type,
    autoComplete = '',
    required = false,
    error = '',
    placeholder='',
    value
  } = props;

  return (
    <div>
        {label.length > 0 && 
            <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-white capitalize">
                {label}
            </label>
        }
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
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:shadow-md dark:shadow-primary-blue-500/50 placeholder-gray-400 focus:outline-none focus:ring-primary-blue-500 focus:border-primary-blue-500 sm:text-sm" />
        <div className="absolute -bottom-6 left-2 flex items-center justify-start text-xs">
            <div className='text-red-600'>
                {error}
            </div>
        </div>
        </div>
    </div>
  )
}

export default Input