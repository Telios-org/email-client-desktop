import React from 'react'

// EXTERNAL LIBRAIRIES
import clsx from 'clsx'


const styles = {
    primary: {
        btn:'rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-tr from-[#4282b0] via-[#65b0db] to-[#6fc0ec] hover:to-[#5ba2cd] hover:via-[#5ba2cd] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue-500 border border-gray-300/50',
        spinner:'text-white'
    }
}

const Button = ({ variant = 'primary', type = "button", className, loading = false, children, ...props}) => {
  className = clsx(styles[variant].btn, className)
  const spinnerClass=clsx(styles[variant].spinner, "animate-spin -ml-1 mr-3 h-5 w-5")
  return (
    <button
        type="submit"
        className={className}
        {...props}
    >
        {!loading && children}
        {loading && <svg className={spinnerClass} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>}
    </button>
  )
}

export default Button