import React, { memo, useEffect, useRef, useState } from 'react';
import { DateTime } from 'luxon';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import {
  CheckIcon,
  SparklesIcon,
  XIcon,
  HashtagIcon,
  DatabaseIcon,
  UploadIcon
} from '@heroicons/react/outline';

import AccountService from '../../../services/account.service';

import PlanComparison from './BillingPayments/PlanComparison';
import teliosLogo from '../../../../resources/img/telios_color_logo.svg';
import classNames from '../../../utils/helpers/css';

// REDUX STATE SELECTORS
import { selectAuthToken } from '../../selectors/global';

// IMPORT A FEW CSS CLASSES
import styles from './BillingPayments.css';

const envAPI = require('../../../env_api.json');
const humanFileSize = require('../../../utils/attachment.util');

const params = window.location.search.replace('?', '');
const env = params.split('=')[1];
const requestBase = env === 'production' ? envAPI.prod : envAPI.dev;

type Props = {
  handleOverlay: (url: string) => void;
};

const BillingPayments = (props: Props) => {
  const dispatch = useDispatch();
  const authToken = useSelector(selectAuthToken);
  const stats = useSelector(state => state.account.stats);

  const { handleOverlay } = props;

  const [pctValues, setPctValues] = useState({
    namespacePct: '',
    aliasPct: '',
    storagePct: '',
    dailyTrafficPct: ''
  });

  const [showPricing, setShowPricing] = useState(false);
  const [pricingData, setPricingData] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(undefined);

  const pctString = (numerator, denominator) => {
    const value = Math.round((numerator / denominator) * 100);
    return `${value}%`;
  };

  useEffect(() => {
    setPctValues({
      namespacePct: pctString(stats.namespaceUsed, stats.maxAliasNames),
      aliasPct: pctString(stats.aliasesUsed, stats.maxAliasAddresses),
      storagePct: pctString(
        stats.storageSpaceUsed,
        stats.maxGBCloudStorage * 1048576
      ),
      dailyTrafficPct: pctString(stats.dailyEmailUsed, stats.maxOutgoingEmails)
    });
  }, [stats]);

  const retrievePlans = async () => {
    const options = {
      method: 'get',
      url: `${requestBase}/stripe/plans`,
      data: {}
    };

    const {
      data: { plans }
    } = await axios(options);
    setPricingData(plans);
    setCurrentPlan(plans.filter(p => p.id === stats.plan.toLowerCase())[0]);
    return plans;
  };

  useEffect(() => {
    retrievePlans();
  }, []);

  const togglePriceCompare = () => {
    setShowPricing(!showPricing);
  };

  const openStripe = async (endpoint, plan) => {
    try {
      const token = await AccountService.refreshToken();

      let options = {
        method: 'post',
        url: `${requestBase}/stripe/customer-portal`,
        headers: {
          Authorization: `Bearer ${token}`
        },
        data: {}
      };

      if (endpoint === 'checkout') {
        options = {
          method: 'post',
          url: `${requestBase}/stripe/create-checkout-session`,
          headers: {
            Authorization: `Bearer ${token}`
          },
          data: {
            plan,
            billing: 'monthly'
          }
        };
      }
      console.log(options);
      const {
        data: { url }
      } = await axios(options);
      console.log(url);
      handleOverlay(url);
    } catch (error) {
      console.log(error);
    }
  };

  if (showPricing) {
    return (
      <PlanComparison
        currentPlan={stats.plan}
        hide={togglePriceCompare}
        pricingData={pricingData}
        onStripeOpen={openStripe}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section
        aria-labelledby="account-user-plan"
        className="xl:grid xl:grid-cols-3 xl:gap-6"
      >
        <div className="xl:col-span-1">
          <h3
            id="payment-details-heading"
            className="text-lg leading-6 font-medium text-gray-900"
          >
            Current Plan
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Lists your current subscription with Telios and allows you to manage
            your billing preferences
          </p>
        </div>
        <div className="mt-5 xl:mt-0 border border-gray-300 bg-white rounded-md overflow-hidden xl:col-span-2">
          <div className="py-6 px-7 flex flex-row relative border-gray-300 border-b justify-between">
            <div className="flex flex-row">
              <img
                className="w-10 h-10 mr-3 top-[0.1rem] relative text-sky-900"
                src={teliosLogo}
                alt="Telios Logo"
              />
              <div>
                <h4 className="text-sm leading-6 font-bold text-gray-900">
                  {`${
                    currentPlan && currentPlan.name ? currentPlan.name : 'Basic'
                  } Privacy Plan`}
                </h4>

                <p className="text-xs">{currentPlan?.description}</p>
              </div>
            </div>
            <div className="leading-6 font-bold text-lg text-gray-900 flex items-center uppercase">
              {currentPlan !== undefined && currentPlan.price !== 0 && (
                <>
                  <span>{`$${currentPlan?.price?.monthly}`}</span>
                  <div className="ml-4 flex flex-col items-start">
                    <span className="text-xs font-bold text-gray-500">
                      USD / mo
                    </span>
                    <span className="text-xs font-bold text-gray-500">
                      {`Yearly ($${currentPlan?.price?.yearly})`}
                    </span>
                  </div>
                </>
              )}
              {currentPlan !== undefined && currentPlan.price === 0 && (
                <span>FREE</span>
              )}
            </div>
          </div>
          <div className="flex justify-between py-3 bg-gray-50 pl-8 pr-4">
            <a
              href=""
              className={classNames(
                stats.plan === 'FREE'
                  ? 'text-gray-200 pointer-events-none'
                  : 'text-gray-500',
                'text-sm font-medium underline flex items-center focus:outline-none'
              )}
            >
              Cancel Plan
            </a>
            <div>
              <button
                type="button"
                onClick={togglePriceCompare}
                className={classNames(
                  stats.plan !== 'FREE'
                    ? 'bg-white focus:ring-gray-400 hover:bg-blue-gray-50 mr-3'
                    : 'bg-green-500 hover:bg-green-600 focus:ring-green-500 text-white',
                  'py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-blue-gray-900 disabled:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2'
                )}
              >
                {stats.plan !== 'FREE' ? 'Compare Plans' : 'Upgrade Plan'}
              </button>
              {stats.plan !== 'FREE' && (
                <button
                  type="button"
                  onClick={() => openStripe('portal', null)}
                  className="bg-green-500 disabled:bg-gray-300 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Manage Plan
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
      <section
        aria-labelledby="account-usage"
        className="xl:grid xl:grid-cols-3 xl:gap-6"
      >
        <div className="xl:col-span-1">
          <h3
            id="account-usage-heading"
            className="text-lg leading-6 font-medium text-gray-900"
          >
            Usage
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            An accounting of your plan resource consumption.
          </p>
        </div>
        <div className="mt-5 xl:mt-0 xl:col-span-2 space-y-6">
          {/* DAILY EMAIL CONSUMPTIONS */}
          <div className="border border-gray-300 bg-white rounded-md overflow-hidden">
            <div className="bg-gray-50 py-4 px-7 flex flex-row relative border-gray-300 border-b">
              <UploadIcon className="w-10 h-10 mr-3 top-[0.1rem] relative text-sky-500" />
              <div>
                <h4 className="text-sm leading-6 font-bold text-gray-900">
                  Email Traffic
                </h4>

                <p className="text-xs">
                  Limit will reset on
                  <span className="font-bold">
                    {stats.dailyEmailResetDate.toLocaleString(
                      DateTime.DATETIME_SHORT
                    )}
                  </span>
                </p>
              </div>
            </div>
            <div className="bg-white py-6 px-7 text-sm">
              {/* EMAIL LIMIT */}
              <li
                className={`relative text-gray-600 pl-[3.25rem] ${styles.featureSvgLast} flex flex-row justify-between space-x-6`}
              >
                <div className="flex-grow">
                  <div className="flex flex-row justify-between">
                    <span className="text-sm leading-6 font-bold">
                      Email Sent out of Network
                    </span>
                    <span className="text-sm">
                      <span className="text-purple-500 font-bold">
                        {stats.dailyEmailUsed}
                      </span>
                      {` of `}
                      {stats.maxOutgoingEmails !== 0 && (
                        <>
                          <span className="font-bold">{`${stats.maxOutgoingEmails} `}</span>
                          included
                        </>
                      )}
                      {stats.maxOutgoingEmails === 0 && (
                        <span className="font-bold">Unlimited</span>
                      )}
                    </span>
                  </div>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blueGray-200">
                      <div
                        style={{
                          width: pctValues.dailyTrafficPct
                        }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                          pctValues.dailyTrafficPct === '100%'
                            ? 'bg-red-500'
                            : 'bg-blueGray-400'
                        }`}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end items-center">
                  <button
                    type="submit"
                    onClick={togglePriceCompare}
                    className="h-fit bg-green-500 disabled:bg-gray-300 border border-transparent rounded-md shadow-sm py-1 px-4 inline-flex justify-center text-xs font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
                  >
                    Add More
                  </button>
                </div>
              </li>
            </div>
          </div>
          {/* ALIASES */}
          <div className="border border-gray-300 bg-white rounded-md overflow-hidden">
            <div className="bg-gray-50 py-4 px-7 flex flex-row relative border-gray-300 border-b">
              <HashtagIcon className="w-10 h-10 mr-3 top-[0.1rem] relative text-sky-500" />
              <div>
                <h4 className="text-sm leading-6 font-bold text-gray-900">
                  Aliases
                </h4>

                <p className="text-xs">
                  Includes disabled aliases and namespaces
                </p>
              </div>
            </div>
            <div className="bg-white py-6 px-7 text-sm">
              <ul className="space-y-5">
                {/* NAMESPACES */}
                <li
                  className={`relative text-gray-600 pl-[3.25rem] ${styles.featureSvg} flex flex-row justify-between space-x-6`}
                >
                  <div className="flex-grow">
                    <div className="flex flex-row justify-between">
                      <span className="text-sm leading-6 font-bold">
                        Namespaces
                      </span>
                      <span className="text-sm">
                        <span className="text-purple-500 font-bold">
                          {stats.namespaceUsed}
                        </span>
                        {` of `}
                        <span className="font-bold">{`${stats.maxAliasNames} `}</span>
                        included
                      </span>
                    </div>
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blueGray-200">
                        <div
                          style={{
                            width: pctValues.namespacePct
                          }}
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                            pctValues.namespacePct === '100%'
                              ? 'bg-red-500'
                              : 'bg-blueGray-400'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end items-center">
                    <button
                      type="button"
                      onClick={togglePriceCompare}
                      className="h-fit bg-green-500 disabled:bg-gray-300 border border-transparent rounded-md shadow-sm py-1 px-4 inline-flex justify-center text-xs font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
                    >
                      Add More
                    </button>
                  </div>
                </li>
                {/* ALIASES */}
                <li
                  className={`relative text-gray-600 pl-[3.25rem] ${styles.featureSvgLast} flex flex-row justify-between space-x-6`}
                >
                  <div className="flex-grow">
                    <div className="flex flex-row justify-between">
                      <span className="text-sm leading-6 font-bold">
                        Alias Addresses
                      </span>
                      <span className="text-sm">
                        <span className="text-purple-500 font-bold">
                          {stats.aliasesUsed}
                        </span>
                        {` of `}
                        <span className="font-bold">{`${stats.maxAliasAddresses} `}</span>
                        included
                      </span>
                    </div>
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blueGray-200">
                        <div
                          style={{
                            width: pctValues.aliasPct
                          }}
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                            pctValues.aliasPct === '100%'
                              ? 'bg-red-500'
                              : 'bg-blueGray-400'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end items-center">
                    <button
                      type="button"
                      onClick={togglePriceCompare}
                      className="h-fit bg-green-500 disabled:bg-gray-300 border border-transparent rounded-md shadow-sm py-1 px-4 inline-flex justify-center text-xs font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
                    >
                      Add More
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          {/* STORAGE */}
          <div className="border border-gray-300 bg-white rounded-md overflow-hidden">
            <div className="bg-gray-50 py-4 px-7 flex flex-row relative border-gray-300 border-b">
              <DatabaseIcon className="w-10 h-10 mr-3 top-[0.1rem] relative text-sky-500" />
              <div>
                <h4 className="text-sm leading-6 font-bold text-gray-900">
                  Storage
                </h4>

                <p className="text-xs">
                  Includes all of your encrypted data and metadata
                </p>
              </div>
            </div>
            <div className="bg-white py-6 px-7 text-sm">
              {/* STORAGE */}
              <li
                className={`relative text-gray-600 pl-[3.25rem] ${styles.featureSvgLast} flex flex-row justify-between space-x-6`}
              >
                <div className="flex-grow">
                  <div className="flex flex-row justify-between">
                    <span className="text-sm leading-6 font-bold">
                      Server Backup
                    </span>
                    <span className="text-sm">
                      <span className="text-purple-500 font-bold">
                        {humanFileSize(stats.storageSpaceUsed, true, 2)}
                      </span>
                      {` of `}
                      <span className="font-bold">{`${stats.maxGBBandwidth}GB `}</span>
                      included
                    </span>
                  </div>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blueGray-200">
                      <div
                        style={{
                          width: pctValues.storagePct
                        }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                          pctValues.storagePct === '100%'
                            ? 'bg-red-500'
                            : 'bg-blueGray-400'
                        }`}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end items-center">
                  <button
                    type="button"
                    onClick={togglePriceCompare}
                    className="h-fit bg-green-500 disabled:bg-gray-300 border border-transparent rounded-md shadow-sm py-1 px-4 inline-flex justify-center text-xs font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
                  >
                    Add More
                  </button>
                </div>
              </li>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BillingPayments;
