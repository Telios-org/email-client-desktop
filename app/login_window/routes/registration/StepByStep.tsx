import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

// External Library
import { CheckIcon } from '@heroicons/react/solid';

// Internal Helper
import classNames from '../../../utils/helpers/css';

const StepByStep = () => {
  const location = useLocation();
  const data = [
    {
      name: 'Beta Consent',
      description: 'Accept terms and conditions',
      href: '/registration',
      status: 'complete'
    },
    {
      name: 'Create Account',
      description: 'Choose your email address',
      href: '/registration/emailpick',
      status: 'current'
    },
    {
      name: 'Master Password',
      description: 'Test and set your password',
      href: '/registration/password',
      status: 'upcoming'
    },
    {
      name: 'Recovery Email',
      description: 'Choose the email for disater recovery',
      href: '/registration/recovery',
      status: 'upcoming'
    },
    {
      name: 'Registration Complete',
      description: 'Download passphrase and go to your inbox',
      href: '/registration/success',
      status: 'upcoming'
    }
  ];

  const [steps, setSteps] = useState([]);

  useEffect(() => {
    let activeIndex = null;

    const output = data.map((s, index) => {
      console.log(index);
      let status;
      if (location.pathname === s.href) {
        status = 'current';
        activeIndex = index;
      } else if (
        (activeIndex !== null && index > activeIndex) ||
        location.pathname === '/registration/failure'
      ) {
        status = 'upcoming';
      } else {
        status = 'complete';
      }

      return {
        ...s,
        status
      };
    });
    console.log(activeIndex, location.pathname);
    setSteps(output);
  }, [location.pathname]);

  return (
    <nav aria-label="Progress" className="ml-10 mr-5 mt-5">
      <ol role="list" className="overflow-hidden">
        {steps.map((step, stepIdx) => (
          <li
            key={step.name}
            className={classNames(
              stepIdx !== steps.length - 1 ? 'pb-11' : '',
              'relative'
            )}
          >
            {step.status === 'complete' ? (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div
                    className="absolute top-4 left-4 -ml-px mt-0.5 h-full w-0.5 bg-violet-900"
                    aria-hidden="true"
                  />
                ) : null}
                <Link
                  to={step.href}
                  className="group relative flex items-start hover:no-underline"
                >
                  <span className="flex h-9 items-center">
                    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-violet-900 group-hover:bg-violet-800">
                      <CheckIcon
                        className="h-5 w-5 text-white"
                        aria-hidden="true"
                      />
                    </span>
                  </span>
                  <span className="ml-4 flex min-w-0 flex-col text-violet-900 group-hover:text-violet-700">
                    <span className="text-sm font-bold uppercase">
                      {step.name}
                    </span>
                    <span className="text-sm font-light">
                      {step.description}
                    </span>
                  </span>
                </Link>
              </>
            ) : step.status === 'current' ? (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div
                    className="absolute top-4 left-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300"
                    aria-hidden="true"
                  />
                ) : null}
                <Link
                  to={step.href}
                  className="group relative flex items-start no-underline"
                  aria-current="step"
                >
                  <span className="flex h-9 items-center" aria-hidden="true">
                    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-purple-200">
                      <span className="h-2.5 w-2.5 rounded-full bg-violet-900" />
                    </span>
                  </span>
                  <span className="ml-4 flex min-w-0 flex-col text-white">
                    <span className="text-sm font-bold uppercase">
                      {step.name}
                    </span>
                    <span className="text-sm font-light">
                      {step.description}
                    </span>
                  </span>
                </Link>
              </>
            ) : (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div
                    className="absolute top-4 left-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="group relative flex items-start no-underline">
                  <span className="flex h-9 items-center" aria-hidden="true">
                    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#884AFC]">
                      <span className="h-2.5 w-2.5 rounded-full bg-transparent" />
                    </span>
                  </span>
                  <span className="ml-4 flex min-w-0 flex-col text-white/40">
                    <span className="text-sm font-bold uppercase">
                      {step.name}
                    </span>
                    <span className="text-sm font-ligth">
                      {step.description}
                    </span>
                  </span>
                </div>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default StepByStep;
