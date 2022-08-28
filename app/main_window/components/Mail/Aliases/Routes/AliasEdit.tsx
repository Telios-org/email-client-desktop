import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  Fragment
} from 'react';
import { useDispatch, useSelector } from 'react-redux';

// EXTERNAL LIBRARIES
import { Dialog, Combobox, Transition } from '@headlessui/react';
import { AtSymbolIcon, LightningBoltIcon } from '@heroicons/react/outline';
import { generateSlug } from 'random-word-slugs';

// INTERNAL LIBRAIRIES
import useForm from '../../../../../utils/hooks/useForm';
import { validateString } from '../../../../../utils/helpers/regex';

// SELECTORS
import { selectAllNamespaces } from '../../../../selectors/mail';

// REDUX ACTION
import { updateAlias } from '../../../../actions/mailbox/aliases';

type Props = {
  close: (isSuccess: boolean, message: string) => void;
  domain: string;
  aliasId: string;
};

const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

const AliasEdit = forwardRef((props: Props, ref) => {
  const { close, domain, aliasId } = props;
  const dispatch = useDispatch();
  const namespaces = useSelector(selectAllNamespaces);
  const fwdAddresses = useSelector(state => state.mail.aliases.fwdAddresses);
  const [queryFwd, setQueryFwd] = useState('');
  const [loading, setLoader] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const aliasData = useSelector(state => state.mail.aliases.byId);

  const {
    handleChange,
    manualChange,
    bulkChange,
    resetForm,
    isDirty,
    handleSubmit,
    data: form,
    errors
  } = useForm({
    initialValues: {
      namespace: null,
      alias: '',
      description: '',
      fwdAddresses: []
    },
    onSubmit: async data => {
      const {
        namespace,
        alias,
        description = '',
        fwdAddresses: fwd = []
      } = data;
      const a = aliasData[aliasId];

      setSubmitError('');
      setLoader(true);

      console.log({
        namespaceName: namespace,
        domain,
        address: alias,
        description,
        fwdAddresses: fwd,
        disabled: a.disabled
      });

      const res = await dispatch(
        updateAlias({
          namespaceName: namespace,
          domain,
          address: alias,
          description,
          fwdAddresses: fwd,
          disabled: a.disabled
        })
      );
      if (res.success) {
        close(true, 'Alias Updated!');
      } else {
        setSubmitError(res.message);
      }
      setLoader(false);
    }
  });

  const filteredForwards =
    queryFwd === ''
      ? [...new Set([...form.fwdAddresses, ...fwdAddresses])]
      : [...new Set([...form.fwdAddresses, ...fwdAddresses])].filter(fwd =>
          fwd
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(queryFwd.toLowerCase().replace(/\s+/g, ''))
        );

  useEffect(() => {
    const a = aliasData[aliasId];

    bulkChange({
      description: a.description,
      fwdAddresses: a.fwdAddresses,
      namespace: a.namespaceKey,
      alias: a.name
    });
  }, [aliasId]);

  return (
    <Dialog.Panel
      ref={ref}
      className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all"
    >
      <Dialog.Title
        as="h3"
        className="text-base font-medium leading-6 text-gray-900 flex flex-row mb-4 pt-6 px-6 items-center"
      >
        <AtSymbolIcon
          className="w-5 h-5 text-sky-500 mr-2"
          aria-hidden="true"
        />
        Edit Alias
      </Dialog.Title>
      <div className="px-6">
        <div className="text-sm">
          <p className="text-sm text-center font-bold bg-coolGray-100 shadow-sm border border-coolGray-200 py-2 my-3 rounded max-w-md mx-auto">
            {`${form.namespace === null ? '' : `${form.namespace}+`}`}
            <span className="text-purple-600">
              {form.alias.length === 0 ? 'alias' : form.alias}
            </span>
            {`@${domain}`}
          </p>
        </div>
        {/* <div className="flex flex-col pl-7 my-4">
          <span className="text-sm font-normal">
            All emails sent to this alias will appear in Alias section of your
            inbox.
          </span>
        </div> */}
      </div>
      <form className="max-w-md m-auto">
        <div className="mt-6">
          <Combobox
            value={form.fwdAddresses}
            onChange={val => manualChange('fwdAddresses', val)}
            name="forward"
            multiple
          >
            <Combobox.Label className="block text-sm font-medium text-gray-700 mb-1">
              Forwarding Address(es)
            </Combobox.Label>

            <div className="relative">
              <span className="inline-block w-full rounded-md shadow-sm">
                <div className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-2 pr-10 text-left transition duration-150 ease-in-out focus-within:border-purple-500 focus-within:outline-none focus-within:ring-1 focus-within:ring-purple-500 sm:text-sm sm:leading-5">
                  <span className="block flex flex-wrap space-x-1">
                    {form.fwdAddresses.map(add => (
                      <span
                        key={add}
                        className="flex items-center rounded bg-blue-50 px-2 py-0.5 my-1"
                      >
                        <span>{add}</span>
                        <svg
                          className="h-4 w-4 cursor-pointer"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            manualChange(
                              'fwdAddresses',
                              form.fwdAddresses.filter((a: string) => a !== add)
                            );
                          }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </span>
                    ))}
                    <Combobox.Input
                      onChange={event => setQueryFwd(event.target.value)}
                      className="form-input border-none p-0 focus:ring-0 text-sm"
                      placeholder="Type Email..."
                    />
                  </span>
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        d="M7 7l3-3 3 3m0 6l-3 3-3-3"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Combobox.Button>
                </div>
              </span>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                afterLeave={() => setQueryFwd('')}
              >
                <Combobox.Options className="absolute z-20 mt-1 max-h-60 w-full bg-white overflow-auto rounded-md py-1 text-base leading-6 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm sm:leading-5">
                  {filteredForwards.length === 0 && queryFwd.length === 0 && (
                    <div className="flex justify-center select-none py-2 text-center focus:outline-none text-gray-400">
                      Type forwarding address
                    </div>
                  )}
                  {queryFwd.length > 0 && !filteredForwards.includes(queryFwd) && (
                    <Combobox.Option
                      value={queryFwd}
                      className={({ active }) => {
                        return classNames(
                          'relative cursor-default select-none py-2 pl-3 pr-9 focus:outline-none',
                          active ? 'bg-sky-500 text-white' : 'text-gray-900'
                        );
                      }}
                    >
                      Add{' '}
                      <b>"{queryFwd}"</b>{' '}
                    </Combobox.Option>
                  )}
                  {filteredForwards.map(fwd => (
                    <Combobox.Option
                      key={fwd}
                      value={fwd}
                      className={({ active }) => {
                        return classNames(
                          'relative cursor-default select-none py-2 pl-3 pr-9 focus:outline-none',
                          active ? 'bg-sky-500 text-white' : 'text-gray-900'
                        );
                      }}
                    >
                      {({ active, selected }) => (
                        <>
                          <span
                            className={classNames(
                              'block truncate',
                              selected ? 'font-semibold' : 'font-normal'
                            )}
                          >
                            {fwd}
                          </span>
                          {selected && (
                            <span
                              className={classNames(
                                'absolute inset-y-0 right-0 flex items-center pr-4',
                                active ? 'text-white' : 'text-sky-600'
                              )}
                            >
                              <svg
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          )}
                        </>
                      )}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              </Transition>
            </div>
          </Combobox>
        </div>
        <div className="mt-6 relative">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <div className="mt-1">
            <textarea
              rows={1}
              name="comment"
              id="comment"
              value={form.description}
              onChange={handleChange('description')}
              className="form-textarea shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div className="text-xs text-red-500 absolute -bottom-7 text-center w-full">
            {submitError.length > 0 && submitError}
          </div>
        </div>
        <div className="text-xs text-gray-400 pt-3 mt-6">
          <b>Note:</b> The + separator is interchangeable with - or # in case a
          website doesn't accept certain characters
        </div>
      </form>
      <div className="flex justify-end py-3 bg-gray-50 text-right px-6 border-t border-gray-300 mt-4">
        <button
          type="button"
          onClick={() => close(false, '')}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-blue-gray-900 disabled:text-gray-300 hover:bg-blue-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 mr-3"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="relative bg-gradient-to-bl from-purple-600 to-purple-500 disabled:from-gray-300 disabled:to-gray-300 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-700"
        >
          <span className={`${loading ? 'opacity-0' : 'opacity-100'}`}>
            Update
          </span>
          <span className={`${loading ? 'visible' : 'invisible'} absolute`}>
            <svg
              className="animate-spin h-5 w-5 text-white"
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
          </span>
        </button>
      </div>
    </Dialog.Panel>
  );
});

AliasEdit.displayName = 'AliasEdit';

export default AliasEdit;
