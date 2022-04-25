import React, { useEffect, useState } from 'react';
import {
  CheckCircleIcon,
  ChevronLeftIcon,
  CheckIcon
} from '@heroicons/react/solid';
import classNames from '../../../../utils/helpers/css';

type Props = {
  hide: () => void;
  pricingData: any[];
  currentPlan: string;
  onStripeOpen: (endpoint: string, plan: string) => void;
};

const PlanComparison = (props: Props) => {
  const { hide, currentPlan, pricingData, onStripeOpen } = props;

  const [limitedOffer, setLimitedOffer] = useState([] as any[]);
  const [subscriptions, setSubscriptions] = useState([] as any[]);
  const [appSumo, setAppSumo] = useState([] as any[]);
  const [currentPricing, setCurrentPricing] = useState(undefined);

  useEffect(() => {
    setCurrentPricing(
      pricingData.filter(p => p.id === currentPlan.toLowerCase())[0]
    );
    console.log(
      'CURRENT PRICING',
      currentPlan.toLowerCase(),
      currentPricing,
      pricingData
    );
  }, [currentPlan, pricingData]);

  useEffect(() => {
    setLimitedOffer(pricingData.filter(p => p.type === 'limited'));
    setSubscriptions(pricingData.filter(p => p.type === 'subscription'));
    setAppSumo(pricingData.filter(p => p.type === 'appsumo'));
  }, [pricingData]);

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
        <button type="button" className="outline-none" onClick={hide}>
          Account & Usage
        </button>
      </div>
      {limitedOffer.length > 0 && (
        <>
          <h3>Limited Time Offer</h3>
          <div className="grid grid-cols-12 space-y-2 mt-2 xl:mt-0">
            {limitedOffer.map(offer => (
              <div
                className="col-span-12 border border-gray-300 bg-white rounded-md overflow-hidden flex"
                key={offer.name}
              >
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
                      {offer.features.map(feature => (
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
                          <p className="ml-3 text-sm text-gray-700">
                            {feature}
                          </p>
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
                    <span>$199</span>
                    <span className="ml-3 text-base font-medium text-gray-500">
                      USD
                    </span>
                  </div>
                  {currentPricing?.order !== offer?.order && (
                    <div className="mt-6 relative">
                      <button
                        type="button"
                        onClick={() => onStripeOpen('checkout', offer.id)}
                        className="w-full bg-gradient-to-bl from-purple-600 to-purple-500 disabled:from-gray-300 disabled:to-gray-300 border border-transparent rounded-md shadow-sm py-3 inline-flex justify-center text-sm font-medium text-white hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-700"
                      >
                        Purchase
                      </button>
                    </div>
                  )}
                  {currentPricing?.order === offer?.order && (
                    <div className="mt-6 relative">
                      <button
                        type="button"
                        onClick={() => onStripeOpen('portal', null)}
                        className="w-full bg-gradient-to-bl from-green-600 to-green-500 disabled:from-gray-300 disabled:to-gray-300 border border-transparent rounded-md shadow-sm py-3 inline-flex justify-center text-sm font-medium text-white hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
                      >
                        Manage Plan
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
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
                  {plan.features.map(feature => (
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
            <div className="xl:w-full text-center bg-gray-50 flex-shrink-0 flex flex-col justify-center p-4 xl:self-center min-w-[240px] xl:min-h-[165px]">
              <div className="mt-4 flex items-center justify-center text-2xl font-extrabold text-gray-900">
                {plan.price !== 0 && (
                  <>
                    <span>{`$${plan?.price?.monthly}`}</span>
                    <div className="ml-4 flex flex-col items-start">
                      <span className="text-xs font-bold text-gray-500">
                        USD / mo
                      </span>
                      <span className="text-xs font-bold text-gray-500">
                        {`Yearly ($${plan?.price?.yearly})`}
                      </span>
                    </div>
                  </>
                )}
                {plan.price === 0 && <span>FREE</span>}
              </div>
              {plan.order > currentPricing?.order && plan.id !== 'free' && (
                <div className="mt-6 relative">
                  <button
                    type="button"
                    onClick={() => onStripeOpen('checkout', plan.id)}
                    className="w-full bg-gradient-to-bl from-purple-600 to-purple-500 disabled:from-gray-300 disabled:to-gray-300 border border-transparent rounded-md shadow-sm py-3 inline-flex justify-center text-sm font-medium text-white hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-700"
                  >
                    Upgrade
                  </button>
                </div>
              )}
              {plan.order < currentPricing?.order && plan.id !== 'free' && (
                <div className="mt-6 relative">
                  <button
                    type="button"
                    onClick={() => onStripeOpen('checkout', plan.id)}
                    className="w-full bg-gray-300 text-gray-700 border border-transparent rounded-md shadow-sm py-3 inline-flex justify-center text-sm font-medium  hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                  >
                    Downgrade
                  </button>
                </div>
              )}
              {plan.order === currentPricing?.order && plan.id !== 'free' && (
                <div className="mt-6 relative">
                  <button
                    type="button"
                    onClick={() => onStripeOpen('portal', null)}
                    className="w-full bg-gradient-to-bl from-green-600 to-green-500 disabled:from-gray-300 disabled:to-gray-300 border border-transparent rounded-md shadow-sm py-3 inline-flex justify-center text-sm font-medium text-white hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
                  >
                    Manage Plan
                  </button>
                </div>
              )}
              {plan.id === 'free' && currentPlan !== 'FREE' && (
                <div>
                  <a
                    href="#"
                    className="mt-4 text-sm font-medium text-gray-500 underline"
                  >
                    Cancel my Subscription
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PlanComparison;
