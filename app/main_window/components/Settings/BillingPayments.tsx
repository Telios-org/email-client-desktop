import React, { memo, useEffect, useRef, useState } from 'react';
import { DateTime } from 'luxon';
import axios from 'axios';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import {
  CheckIcon,
  SparklesIcon,
  XIcon,
  HashtagIcon,
  DatabaseIcon,
  UploadIcon,
  GlobeIcon
} from '@heroicons/react/outline';

import { values } from 'lodash';
import { retrieveStats } from '../../actions/account/account';
import AccountService from '../../../services/account.service';

import PlanComparison from './BillingPayments/PlanComparison';
import InputField from './shared/InputField';

import teliosLogo from '../../../../resources/img/telios_color_logo.svg';
import classNames from '../../../utils/helpers/css';

// REDUX STATE SELECTORS
import { selectAccountStats } from '../../selectors/account';

// HELPER HOOKS
import useForm from '../../../utils/hooks/useForm';
import { useHandler } from '../../../utils/hooks/useHandler';

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
  const account = useSelector(state => state.account);
  const stats = useSelector(selectAccountStats);

  const { handleOverlay } = props;

  const [pctValues, setPctValues] = useState({
    namespacePct: '',
    aliasPct: '',
    storagePct: '',
    dailyTrafficPct: '',
    domainsPct: ''
  });

  const [showPricing, setShowPricing] = useState(false);
  const [pricingData, setPricingData] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(undefined);
  const [appSumoCode, setAppSumoCode] = useState(null);
  const [upgradeLoader, setUpgradeLoader] = useState(false);

  const pctString = (numerator, denominator) => {
    const value = Math.round((numerator / denominator) * 100);
    return `${value}%`;
  };

  // AppSumo Code Stacking
  const {
    handleSubmit,
    handleChange,
    manualChange,
    resetForm,
    isDirty,
    data,
    errors
  } = useForm({
    initialValues: {
      code: null
    },
    validations: {
      code: {
        custom: {
          isValid: () => {
            return appSumoCode !== null && appSumoCode;
          }
        }
      }
    },
    onSubmit: async (formData: any) => {
      setUpgradeLoader(true);
      try {
        const token = await AccountService.refreshToken();
        const options = {
          url: `${requestBase}/account/appsumo/upgrade`,
          method: 'post',
          headers: {
            Authorization: `Bearer ${token}`
          },
          data: {
            code: formData.code
          }
        };

        await axios(options);
        const newPlan = pricingData.filter(p => p.id === 'appsumot2')[0];
        setCurrentPlan(newPlan);
        setPctValues({
          namespacePct: pctString(stats.namespaceUsed, newPlan.maxAliasNames),
          aliasPct: pctString(stats.aliasesUsed, newPlan.maxAliasAddresses),
          domainsPct: pctString(stats.domainUsed, newPlan.maxDomains),
          storagePct: pctString(
            stats.storageSpaceUsed,
            newPlan.maxGBCloudStorage * 1000000000
          ),
          dailyTrafficPct: pctString(
            stats.dailyEmailUsed,
            newPlan.maxOutgoingEmails
          )
        });
      } catch (e) {
        console.log('failed AppSumo upgrade');
      }
      setUpgradeLoader(false);
    }
  });

  // End AppSumo Code Stacking

  useEffect(() => {
    setPctValues({
      namespacePct: pctString(stats.namespaceUsed, stats.maxAliasNames),
      aliasPct: pctString(stats.aliasesUsed, stats.maxAliasAddresses),
      domainsPct: pctString(stats.domainUsed, stats.maxDomains),
      storagePct: pctString(
        stats.storageSpaceUsed,
        stats.maxGBCloudStorage * 1000000000
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
    setCurrentPlan(plans.filter(p => p.id === account.plan.toLowerCase())[0]);
    return plans;
  };

  useEffect(() => {
    retrievePlans();
  }, []);

  useEffect(() => {
    setCurrentPlan(
      pricingData.filter(p => p.id === account.plan.toLowerCase())[0]
    );
  }, [account.plan]);

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

      const {
        data: { url }
      } = await axios(options);

      handleOverlay(url);
    } catch (error) {
      console.log(error);
    }
  };

  const checkCode = async appsumocode => {
    const options = {
      url: `${requestBase}/account/beta/verify`,
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        vcode: [appsumocode]
      }
    };

    if (appsumocode.length > 0) {
      try {
        await axios(options);
        setAppSumoCode(true);
      } catch (e) {
        setAppSumoCode(false);
      }
    } else {
      setAppSumoCode(null);
    }
  };

  const verifyCode = useHandler(checkCode, { debounce: 500 });

  const handleCodeChange = event => {
    const val = event.target.value;
    manualChange('code', val);
    verifyCode(val);
  };

  if (showPricing) {
    return (
      <PlanComparison
        currentPlan={account.plan}
        hide={togglePriceCompare}
        pricingData={pricingData}
        onStripeOpen={openStripe}
      />
    );
  }

  return (
    <div className="space-y-6 mb-10">
      {account.type === 'PRIMARY' && (
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
              Lists your current subscription with Telios and allows you to
              manage your billing preferences
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
                      currentPlan && currentPlan.name
                        ? currentPlan.name
                        : 'Basic'
                    } ${
                      currentPlan && currentPlan?.type === 'appsumo'
                        ? ''
                        : 'Privacy Plan'
                    }`}
                  </h4>

                  <p className="text-xs">
                    {currentPlan?.type !== 'subscription'
                      ? 'Limited Time Offer'
                      : currentPlan?.description}
                  </p>
                </div>
              </div>
              <div className="leading-6 font-bold text-lg text-gray-900 flex items-center">
                {currentPlan !== undefined &&
                  currentPlan.price !== 0 &&
                  currentPlan.price.monthly !== undefined && (
                    <>
                      <span className="uppercase text-2xl">{`$${currentPlan?.price?.monthly}`}</span>
                      <div className="ml-4 flex flex-col items-start">
                        <span className="text-sm font-bold text-gray-500">
                          / mo
                        </span>
                      </div>
                    </>
                  )}
                {currentPlan !== undefined &&
                  currentPlan.price === 0 &&
                  !(
                    currentPlan?.type === 'limited' ||
                    currentPlan?.type === 'appsumo'
                  ) && <span>FREE</span>}
                {(currentPlan?.type === 'limited' ||
                  currentPlan?.type === 'appsumo') && (
                  <span>LIFETIME MEMBER</span>
                )}
              </div>
            </div>
            {currentPlan?.type !== 'appsumo' && (
              <div className="flex justify-between py-3 bg-gray-50 pl-8 pr-4">
                <a
                  onClick={() => openStripe('portal', null)}
                  style={{ cursor: 'pointer' }}
                  className={classNames(
                    account.plan === 'FREE'
                      ? 'text-gray-200 pointer-events-none'
                      : 'text-gray-500',
                    'text-sm font-medium underline flex items-center focus:outline-none'
                  )}
                >
                  {currentPlan?.type !== 'limited' && 'Cancel Plan'}
                </a>
                <div>
                  <button
                    type="button"
                    onClick={togglePriceCompare}
                    className={classNames(
                      account.plan !== 'FREE'
                        ? 'bg-white focus:ring-gray-400 hover:bg-blue-gray-50 mr-3'
                        : 'bg-gradient-to-bl from-green-600 to-green-500 hover:to-green-600 focus:ring-green-500 text-white',
                      'py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-blue-gray-900 disabled:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2'
                    )}
                  >
                    {account.plan !== 'FREE' ? 'Compare Plans' : 'Upgrade Plan'}
                  </button>
                  {account.plan !== 'FREE' && (
                    <button
                      type="button"
                      onClick={() => openStripe('portal', null)}
                      className="bg-gradient-to-bl from-green-600 to-green-500 disabled:bg-gray-300 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Manage Plan
                    </button>
                  )}
                </div>
              </div>
            )}
            {currentPlan?.id === 'appsumot1' && (
              <div className="flex justify-between py-3 bg-gray-50 pl-8 pr-4">
                <a
                  href="https://appsumo.com/products/telios/"
                  className="text-gray-500 text-sm font-medium underline flex items-center focus:outline-none"
                >
                  Upgrade Tier
                </a>
                <div>
                  {/* <button
                    type="button"
                    onClick={togglePriceCompare}
                    className={classNames(
                      stats.plan !== 'FREE'
                        ? 'bg-white focus:ring-gray-400 hover:bg-blue-gray-50 mr-3'
                        : 'bg-gradient-to-bl from-green-600 to-green-500 hover:to-green-600 focus:ring-green-500 text-white',
                      'py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-blue-gray-900 disabled:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2'
                    )}
                  >
                    {stats.plan !== 'FREE' ? 'Compare Plans' : 'Upgrade Plan'}
                  </button> */}
                  <form onSubmit={handleSubmit} className="flex flex-row">
                    <div className="relative rounded-md shadow-sm">
                      <InputField
                        id="code"
                        placeholder="AppSumo Code"
                        className="-mt-2 mr-2"
                        value={data.code || ''}
                        onChange={handleCodeChange}
                        error={errors.code}
                        type="text"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {appSumoCode && appSumoCode !== null && (
                          <CheckIcon
                            className="h-5 w-5 text-green-500"
                            aria-hidden="true"
                          />
                        )}
                        {!appSumoCode && appSumoCode !== null && (
                          <XIcon
                            className="h-5 w-5 text-red-500"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                    </div>
                    <button
                      type="submit"
                      style={{ 'min-width': '112px' }}
                      className="bg-gradient-to-bl from-green-600 to-green-500 disabled:bg-gray-300 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      {upgradeLoader && (
                        <svg
                          className="animate-spin h-5 w-5 text-white"
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
                      )}
                      {!upgradeLoader && `Stack Code`}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
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
                  Total amount of emails that can be sent daily from this
                  account
                </p>

                {stats?.dailyEmailResetDate?.toLocaleString(
                  DateTime.DATETIME_SHORT
                ) !== 'Invalid DateTime' && (
                  <p className="text-xs">
                    {`Limit will reset on `}
                    <span className="font-bold">
                      {stats?.dailyEmailResetDate?.toLocaleString(
                        DateTime.DATETIME_SHORT
                      )}
                    </span>
                  </p>
                )}
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
                      Emails Sent out of Network
                    </span>
                    <span className="text-sm">
                      <span className="text-purple-500 font-bold">
                        {stats?.dailyEmailUsed}
                      </span>
                      {` of `}
                      {currentPlan?.maxOutgoingEmails !== 0 && (
                        <>
                          <span className="font-bold">{`${currentPlan?.maxOutgoingEmails} `}</span>
                          included
                        </>
                      )}
                      {currentPlan?.maxOutgoingEmails === 0 && (
                        <span className="font-bold">Unlimited</span>
                      )}
                    </span>
                  </div>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blueGray-200">
                      <div
                        style={{
                          width: pctValues?.dailyTrafficPct
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
                {stats?.maxOutgoingEmails !== 0 &&
                  currentPlan?.type !== 'appsumo' &&
                  account.type === 'PRIMARY' && (
                    <div className="flex justify-end items-center">
                      <button
                        type="button"
                        onClick={togglePriceCompare}
                        className="h-fit bg-gradient-to-bl from-green-600 to-green-500 disabled:bg-gray-300 border border-transparent rounded-md shadow-sm py-1 px-4 inline-flex justify-center text-xs font-medium text-white hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
                      >
                        Add More
                      </button>
                    </div>
                  )}
                {stats?.maxOutgoingEmails !== 0 &&
                  currentPlan?.id === 'appsumot1' &&
                  account.type === 'PRIMARY' && (
                    <div className="flex justify-end items-center">
                      <a
                        href="https://appsumo.com/products/telios/"
                        className="h-fit bg-gradient-to-bl from-green-600 to-green-500 disabled:bg-gray-300 border border-transparent rounded-md shadow-sm py-1 px-4 inline-flex justify-center text-xs font-medium text-white hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
                      >
                        Add More
                      </a>
                    </div>
                  )}
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
                        <span className="font-bold">
                          {`${
                            currentPlan?.maxAliasNames === 0
                              ? 'Unlimited'
                              : currentPlan?.maxAliasNames
                          } `}
                        </span>
                        {`${
                          currentPlan?.maxAliasNames === 0 ? '' : 'included'
                        } `}
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
                  {currentPlan?.maxAliasNames !== 0 &&
                    currentPlan?.type !== 'appsumo' &&
                    account.type === 'PRIMARY' && (
                      <div className="flex justify-end items-center">
                        <button
                          type="button"
                          onClick={togglePriceCompare}
                          className="h-fit bg-gradient-to-bl from-green-600 to-green-500 disabled:bg-gray-300 border border-transparent rounded-md shadow-sm py-1 px-4 inline-flex justify-center text-xs font-medium text-white hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
                        >
                          Add More
                        </button>
                      </div>
                    )}
                  {currentPlan?.maxAliasNames !== 0 &&
                    currentPlan?.id === 'appsumot1' &&
                    account.type === 'PRIMARY' && (
                      <div className="flex justify-end items-center">
                        <a
                          href="https://appsumo.com/products/telios/"
                          className="h-fit bg-gradient-to-bl from-green-600 to-green-500 disabled:bg-gray-300 border border-transparent rounded-md shadow-sm py-1 px-4 inline-flex justify-center text-xs font-medium text-white hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
                        >
                          Add More
                        </a>
                      </div>
                    )}
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
                        <span className="font-bold">
                          {`${
                            currentPlan?.maxAliasAddresses === 0
                              ? 'Unlimited'
                              : currentPlan?.maxAliasAddresses
                          } `}
                        </span>
                        {`${
                          currentPlan?.maxAliasAddresses === 0 ? '' : 'included'
                        } `}
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
                  {stats.maxAliasAddresses !== 0 &&
                    currentPlan?.type !== 'appsumo' &&
                    account.type === 'PRIMARY' && (
                      <div className="flex justify-end items-center">
                        <button
                          type="button"
                          onClick={togglePriceCompare}
                          className="h-fit bg-gradient-to-bl from-green-600 to-green-500 disabled:bg-gray-300 border border-transparent rounded-md shadow-sm py-1 px-4 inline-flex justify-center text-xs font-medium text-white hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
                        >
                          Add More
                        </button>
                      </div>
                    )}
                  {stats.maxAliasAddresses !== 0 &&
                    currentPlan?.id === 'appsumot1' &&
                    account.type === 'PRIMARY' && (
                      <div className="flex justify-end items-center">
                        <a
                          href="https://appsumo.com/products/telios/"
                          className="h-fit bg-gradient-to-bl from-green-600 to-green-500 disabled:bg-gray-300 border border-transparent rounded-md shadow-sm py-1 px-4 inline-flex justify-center text-xs font-medium text-white hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
                        >
                          Add More
                        </a>
                      </div>
                    )}
                </li>
              </ul>
            </div>
          </div>
{' '}
          {/* CUSTOM DOMAINS */}
          {currentPlan?.maxDomains > 0 && (
            <div className="border border-gray-300 bg-white rounded-md overflow-hidden">
              <div className="bg-gray-50 py-4 px-7 flex flex-row relative border-gray-300 border-b">
                <GlobeIcon className="w-10 h-10 mr-3 top-[0.1rem] relative text-sky-500" />
                <div>
                  <h4 className="text-sm leading-6 font-bold text-gray-900">
                    Domains
                  </h4>

                  <p className="text-xs">
                    Includes all of custom domains you have attached to your
                    account
                  </p>
                </div>
              </div>
              <div className="bg-white py-6 px-7 text-sm">
                {/* CUSTOM DOMAINS */}
                <li
                  className={`relative text-gray-600 pl-[3.25rem] ${styles.featureSvgLast} flex flex-row justify-between space-x-6`}
                >
                  <div className="flex-grow">
                    <div className="flex flex-row justify-between">
                      <span className="text-sm leading-6 font-bold">
                        Verified Domains
                      </span>
                      <span className="text-sm">
                        <span className="text-purple-500 font-bold">
                          {stats.domainUsed}
                        </span>
                        <>
                          {` of `}
                          <span className="font-bold">
                            {currentPlan?.maxDomains || '#N/A'}
                          </span>
                          {` included`}
                        </>
                      </span>
                    </div>

                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blueGray-200">
                        <div
                          style={{
                            width: pctValues.domainsPct
                          }}
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                            pctValues.domainsPct === '100%'
                              ? 'bg-red-500'
                              : 'bg-blueGray-400'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                  {currentPlan?.maxDomains !== 10 &&
                    currentPlan?.type !== 'appsumo' &&
                    account.type === 'PRIMARY' && (
                      <div className="flex justify-end items-center">
                        <button
                          type="button"
                          onClick={togglePriceCompare}
                          className="h-fit bg-gradient-to-bl from-green-600 to-green-500 disabled:bg-gray-300 border border-transparent rounded-md shadow-sm py-1 px-4 inline-flex justify-center text-xs font-medium text-white hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
                        >
                          Add More
                        </button>
                      </div>
                    )}
                </li>
              </div>
            </div>
          )}
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
                      <>
                        {` of `}
                        <span className="font-bold">
                          {humanFileSize(
                            currentPlan?.maxGBCloudStorage * 1000000000,
                            true,
                            2
                          )}
                        </span>
                        {` included`}
                      </>
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
                {currentPlan?.maxGBCloudStorage !== 1000 &&
                  currentPlan?.type !== 'appsumo' &&
                  account.type === 'PRIMARY' && (
                    <div className="flex justify-end items-center">
                      <button
                        type="button"
                        onClick={togglePriceCompare}
                        className="h-fit bg-gradient-to-bl from-green-600 to-green-500 disabled:bg-gray-300 border border-transparent rounded-md shadow-sm py-1 px-4 inline-flex justify-center text-xs font-medium text-white hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
                      >
                        Add More
                      </button>
                    </div>
                  )}
                {currentPlan?.maxGBCloudStorage !== 1000 &&
                  currentPlan?.id === 'appsumot1' &&
                  account.type === 'PRIMARY' && (
                    <div className="flex justify-end items-center">
                      <a
                        href="https://appsumo.com/products/telios/"
                        className="h-fit bg-gradient-to-bl from-green-600 to-green-500 disabled:bg-gray-300 border border-transparent rounded-md shadow-sm py-1 px-4 inline-flex justify-center text-xs font-medium text-white hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
                      >
                        Add More
                      </a>
                    </div>
                  )}
              </li>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BillingPayments;
