import React from 'react';
import {
  CheckCircleIcon,
  ChevronLeftIcon,
  CheckIcon
} from '@heroicons/react/solid';

const limitedOffer = [
  {
    name: 'Early Adopter',
    price: 349,
    included: [
      'Ultimate Plan - Lifetime Subscription',
      'Telios T-shirt',
      'Priority Support',
      'Sneak Peaks'
    ],
    description: `You believe in what we are building and can picture yourself as a super user. Than this is for you. 
      This limited offering will grant you access to one of only <b>1000 available</b> Lifetime Early Adopter Memberships.`
  }
];

const subscriptions = [
  {
    name: 'Basic',
    price: {
      monthly: 0,
      yearly: 0
    },
    description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit.',
    includes: [
      'Unlimited Devices',
      'Unlimited On Device Storage',
      ' Unlimited Emails In Network',
      '100 Emails daily out of Network',
      'Send up to 2GB in Network',
      '1 Namespace',
      '5 Aliases',
      'Community Support'
    ]
  },
  {
    name: 'Starter',
    price: {
      monthly: 8,
      yearly: 96
    },
    description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit.',
    includes: [
      'Unlimited Devices',
      'Unlimited On Device Storage',
      '5GB Cloud Backup',
      ' Unlimited Emails In Network',
      '500 Emails daily out of Network',
      'Send up to 2GB in Network',
      '1 Namespace',
      '5 Aliases',
      'Limited Support'
    ]
  },
  {
    name: 'Premium',
    price: {
      monthly: 10,
      yearly: 120
    },
    description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit.',
    includes: [
      'Unlimited Devices',
      'Unlimited On Device Storage',
      '25GB Cloud Backup',
      ' Unlimited Emails In Network',
      'Unlimited Emails out of Network',
      'Send up to 5GB in Network',
      '1 Namespace',
      '10 Aliases',
      'Priority Support'
    ]
  },
  {
    name: 'Ultimate',
    price: {
      monthly: 15,
      yearly: 180
    },
    description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit.',
    includes: [
      'Unlimited Devices',
      'Unlimited On Device Storage',
      '1TB Cloud Backup',
      ' Unlimited Emails In Network',
      'Unlimited Emails out of Network',
      'No attachment limits in Network',
      '1 Namespace',
      '25 Aliases',
      'Priority Support'
    ]
  }
];

const PlanComparison = props => {

    const { hide, currentPlan } = props

  return (
    <section
      aria-labelledby="account-user-plan"
      className="space-y-6 xl:space-y-4 select-none"
    >
      <div className="flex flex-row items-center text-gray-400 hover:text-gray-700">
        <ChevronLeftIcon
          className="flex-shrink-0 h-5 w-5 "
          aria-hidden="true"
        />
        <button className="outline-none" onClick={hide}>Account & Usage</button>
      </div>
      <h3>Limited Time Offer</h3>
      <div className="grid grid-cols-12 space-y-2 mt-2 xl:mt-0">
        {limitedOffer.map(offer => (
          <div className="col-span-12 border border-gray-300 bg-white rounded-md overflow-hidden flex">
            <div className="flex-1 bg-white px-10 py-8 border-r">
              <h3 className="text-xl font-extrabold text-gray-900">
                {offer.name}
              </h3>
              <p
                className="mt-3 text-sm text-gray-500"
                dangerouslySetInnerHTML={{ __html: offer.description }}
              />
              <div className="mt-4">
                <div className="flex items-center">
                  <h4 className="flex-shrink-0 pr-4 bg-white text-sm tracking-wider font-semibold uppercase text-purple-600">
                    What's included
                  </h4>
                  <div className="flex-1 border-t-2 border-gray-200" />
                </div>
                <ul
                  role="list"
                  className="mt-4 space-y-0 grid grid-cols-2 gap-x-2 gap-y-2"
                >
                  {offer.included.map(feature => (
                    <li
                      key={feature}
                      className="flex items-start lg:col-span-1"
                    >
                      <div className="flex-shrink-0">
                        <CheckCircleIcon
                          className="h-5 w-5 text-green-400"
                          aria-hidden="true"
                        />
                      </div>
                      <p className="ml-3 text-sm text-gray-700">{feature}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="text-center bg-gray-50 flex-shrink-0 flex flex-col justify-center p-4 min-w-[240px]">
              <p className="text-base leading-6 font-medium text-gray-900">
                Pay once, own it forever
              </p>
              <div className="mt-4 flex items-center justify-center text-2xl font-extrabold text-gray-900">
                <span>$349</span>
                <span className="ml-3 text-base font-medium text-gray-500">
                  USD
                </span>
              </div>
              <div className="mt-6 relative">
                <button className="w-full bg-gradient-to-bl from-purple-600 to-purple-500 disabled:from-gray-300 disabled:to-gray-300 border border-transparent rounded-md shadow-sm py-3 inline-flex justify-center text-sm font-medium text-white hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-700">
                  Purchase
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <h3>Subscription Plans</h3>
      <div className="mt-2 xl:grid xl:grid-cols-12 space-y-2 xl:space-y-0 xl:space-x-2 flex-col-reverse flex ">
        {subscriptions.map(plan => (
          <div
            className="flex-1 xl:col-span-3 border border-gray-300 bg-white rounded-md overflow-hidden flex xl:flex-col first:mt-2 xl:first:mt-0"
            key={plan.name}
          >
            <div className="flex-1 bg-white px-8 py-6 border-r xl:border-b xl:border-r-0">
              <h3 className="text-xl font-extrabold text-gray-900">
                {plan.name}
              </h3>
              <p
                className="mt-3 text-sm text-gray-500"
                dangerouslySetInnerHTML={{ __html: plan.description }}
              />
              <div className="mt-4">
                <div className="flex items-center">
                  <h4 className="flex-shrink-0 pr-4 bg-white text-sm tracking-wider font-semibold uppercase text-purple-600">
                    What's included
                  </h4>
                  <div className="flex-1 border-t-2 border-gray-200" />
                </div>
                <ul
                  role="list"
                  className="mt-4 space-y-0 grid grid-cols-2 gap-x-2 gap-y-2 xl:gap-y-4"
                >
                  {plan.includes.map(feature => (
                    <li
                      key={feature}
                      className="flex items-start col-span-1 xl:col-span-2"
                    >
                      <div className="flex-shrink-0">
                        <CheckCircleIcon
                          className="h-5 w-5 text-green-400"
                          aria-hidden="true"
                        />
                      </div>
                      <p className="ml-3 text-sm text-gray-700">{feature}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="text-center bg-gray-50 flex-shrink-0 flex flex-col justify-center p-4 min-w-[240px] xl:min-h-[165px]">
              <div className="mt-4 flex items-center justify-center text-2xl font-extrabold text-gray-900">
                {plan.price.monthly !== 0 && <><span>{`$${plan.price.monthly}`}</span>
                <div className="ml-4 flex flex-col items-start">
                        <span className="text-xs font-bold text-gray-500">
                          USD / mo
                        </span>
                        <span className="text-xs font-bold text-gray-500">
                          Yearly (${plan.price.yearly})
                        </span>
                      </div>
                </>}
                {plan.price.monthly === 0 && <span>FREE</span>}
              </div>
              {plan.name !== "Basic" && <div className="mt-6 relative">
                <button className="w-full bg-gradient-to-bl from-purple-600 to-purple-500 disabled:from-gray-300 disabled:to-gray-300 border border-transparent rounded-md shadow-sm py-3 inline-flex justify-center text-sm font-medium text-white hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-700">
                  Upgrade
                </button>
              </div>}
              {(plan.name === "Basic") && (currentPlan !== "FREE") && <div>
                <a href="#" className="mt-4 text-sm font-medium text-gray-500 underline">
                    Cancel my Subscription
                  </a>
             </div>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PlanComparison;

// {subscriptions.map(plan => (
//     <div
//       className="col-span-4 border border-gray-300 bg-white rounded-md overflow-hidden mr-2"
//       key={plan.name}
//     >
//       <div className="p-6 border-gray-300 border-b">
//         <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
//           {plan.name}
//         </span>
//         <div className="mt-2 flex items-baseline text-2xl font-extrabold text-gray-900">
//           {`$${plan.price.monthly}`}
//           <span className="ml-1 text-base font-medium text-gray-500">
//             /mo
//           </span>
//         </div>
//         <p className="mt-3 text-sm text-gray-500">{plan.description}</p>
//       </div>

//       <div className="bg-gray-50 ">
//         <ul role="list" className="pt-6 pl-8 pr-4 space-y-3 text-sm">
//           {plan.includes.map(feature => (
//             <li key={feature} className="flex">
//               <CheckIcon
//                 className="flex-shrink-0 w-6 h-6 text-blue-500"
//                 aria-hidden="true"
//               />
//               <span className="ml-3 text-gray-500">{feature}</span>
//             </li>
//           ))}
//         </ul>
//         <div className="py-6 -mt-3 relative mx-auto px-8">
//           <button className="w-full bg-gradient-to-bl from-purple-600 to-purple-500 disabled:from-gray-300 disabled:to-gray-300 border border-transparent rounded-md shadow-sm py-2 inline-flex justify-center text-sm font-medium text-white hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-700">
//             Upgrade
//           </button>
//         </div>
//       </div>
//     </div>
//   ))}
