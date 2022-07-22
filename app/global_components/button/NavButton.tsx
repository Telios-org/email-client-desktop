import React from 'react';

// EXTERNAL LIBRAIRIES
import clsx from 'clsx';
import { Link } from 'react-router-dom';

const styles = {
  primary: {
    btn:
      'w-full px-6 py-3 rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue-600 border border-gray-300 bg-gradient-to-tr from-[#0284C7] to-[#0EA5E9] hover:to-[#0284C7] ',
    spinner: 'text-white'
  }, // For some reason the blue gradient doesn't always work and needs to be added in classname on the component declaration.
  outline: {
    btn:
      'w-full px-4 py-3 rounded-md shadow-sm text-sm text-gray-400 hover:text-gray-500 font-medium  border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-gray-300',
    spinner: ''
  }
};

type Props = {
  variant?: string;
  to: string;
  className?: string;
  children: any;
};

const NavButton = ({ variant = 'primary', to, className, children }: Props) => {
  const cls = clsx(styles[variant].btn, className, 'text-center hover:no-underline');

  return (
    <Link to={to} className={cls}>
      {children}
    </Link>
  );
};

NavButton.defaultProps = {
  variant: 'primary',
  className: ''
};

export default NavButton;
