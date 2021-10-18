import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Modal, Table, Schema, Icon } from 'rsuite';

import { Danger } from 'react-iconly';
import { generateSlug } from 'random-word-slugs';

import AliasManagementTable from './AliasManagementTable';

// REDUX ACTION
import { registerNamespace } from '../../../../../../actions/mailbox/aliases';

// SELECTORS
import {
  selectActiveMailbox,
  selectFirstNamespace
} from '../../../../../../selectors/mail';

import i18n from '../../../../../../../i18n/i18n';

const { StringType } = Schema.Types;

const formModel = Schema.Model({
  namespace: StringType()
});

type Props = {
  show: boolean;
  onHide: () => void;
  onCreateAlias: () => void;
  onShowEdit: (aliasId: string) => void;
  domain: string;
};

const initialFormState = {
  namespace: ''
};

export default function AliasModal(props: Props) {
  const firstNamespace = useSelector(selectFirstNamespace);
  const aliases = useSelector(state => state.mail.aliases);

  const showTable = aliases.allIds.length > 0;

  const { onHide, show, onCreateAlias, domain, onShowEdit } = props;

  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    setShowHelp(false);
  }, [show]);

  const toggleHelp = () => {
    setShowHelp(!showHelp);
  };

  return (
    <>
      <Modal.Header>
        <Modal.Title className="font-bold flex-row flex justify-between select-none">
          <div>{i18n.t('aliasing.alias_management')}</div>
          <div
            onClick={toggleHelp}
            className="text-coolGray-400 font-extralight text-xs mr-4 mt-1 cursor-pointer hover:text-coolGray-600"
          >
            {`${showHelp ? 'Hide' : 'Show'} Help`}
          </div>
        </Modal.Title>
        <div className="text-xs">
          <span>Namespace:</span>
          <span className="font-semibold text-blue-500 ml-1">
            {firstNamespace.name}
          </span>
        </div>
      </Modal.Header>
      <Modal.Body className="mt-5">
        <div className={`text-sm mb-6 select-none ${showHelp ? '' : 'hidden'}`}>
          <p className="mb-4 text-sm">
            Need help creating aliases, you have
            <b> 2 options :</b>
          </p>
          <div className="px-5 py-4 rounded-lg bg-coolGray-100">
            <p>
              <span>
                <b>Option 1 - </b>
                On the fly creation
              </span>
            </p>
            <p className="leading-relaxed">
              To create an alias on the fly useing your namespace, simply make
              up an alias
              <span className="bg-white shadow-sm border border-coolGray-300 rounded px-1 mx-1 font-bold">
                <span className="text-blue-500">
                  {firstNamespace && firstNamespace.name}
                </span>
                #<span className="text-purple-600">mymadeupalias</span>
                {`@${domain}`}
              </span>
              and provide that to the service, website, newsletter or person in
              lieu of your primary email.
            </p>
            <p className="leading-relaxed text-xs flex flex-row">
              <Danger set="broken" className="text-purple-600" />
              <span className="mt-1 ml-2 text-purple-600">
                The alias will show up in the app automatically as soon as it
                receives its first email.
              </span>
            </p>
            <p className="mt-4">
              <b>Option 2 - </b>
              In app creation
            </p>
            <p>
              Click the
{' '}
              <span className="leading-relaxed bg-white shadow-sm border border-coolGray-300 rounded px-1 mx-1 font-bold">
                + Add alias
              </span>
{' '}
              button below
            </p>
          </div>

          {/* <p className="text-sm text-center bg-coolGray-100 shadow-sm border border-coolGray-200 py-2 my-3 rounded">
            <b>namespace</b>
            <b className="text-purple-500">#myalias</b>
            <b>@telios.io</b>
          </p>
          <p className="text-sm" /> */}
        </div>

        <div className="mb-3 flex flex-row-reverse">
          <Button
            onClick={onCreateAlias} 
            className="tracking-wide bg-purple-600 text-white border-color-purple-800 shadow-s "
          >
            <Icon icon="plus" className="mr-1 text-xs" />
{' '}
Add alias
</Button>
        </div>
        {!showTable && (
          <div className="bg-coolGray-100 w-full rounded-lg flex items-center flex-col pb-6 pt-4">
            {/* <CgHashtag className="text-3xl text-coolGray-400"/> */}
            <span className="text-2xl text-coolGray-400">@</span>
            <p className="text-sm text-coolGray-400">No alias created yet</p>
          </div>
        )}
        {showTable && (
          <AliasManagementTable domain={domain} aliases={aliases} ns={firstNamespace} onShowEdit={onShowEdit}/>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={onHide}
          appearance="ghost"
          className="border-coolGray-300 text-coolGray-400 tracking-wide"
        >
          Close
        </Button>
      </Modal.Footer>
    </>
  );
}
