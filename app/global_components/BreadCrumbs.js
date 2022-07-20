import React from 'react';
import { HomeIcon} from '@heroicons/react/solid'
import { Link } from 'react-router-dom'

const BreadCrumbs = (props) => {

    const { breadcrumbs } = props

  return <nav className="hidden border-b border-gray-200 dark:border-gray-400 lg:block py-3" aria-label="Breadcrumb">
  <ol role="list" className="max-w-screen-xl w-full mx-auto px-4 flex space-x-4 sm:px-6 lg:px-8">
    <li className="flex">
      <div className="flex items-center">
        <Link to="/" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
          <HomeIcon className="flex-shrink-0 h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Home</span>
        </Link>
      </div>
    </li>
    {breadcrumbs.map((item) => (
      <li key={item.name} className="flex">
        <div className="flex items-center">
        <svg
                            className="flex-shrink-0 h-5 w-5 text-gray-300"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                          </svg>
          <Link
            to={item.to}
            className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            aria-current={item.current ? 'page' : undefined}
          >
            {item.name}
          </Link>
        </div>
      </li>
    ))}
  </ol>
</nav>;
};

export default BreadCrumbs;
