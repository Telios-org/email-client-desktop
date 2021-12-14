import React, { useState, forwardRef, Ref } from 'react';
import RecipientsInput from '../recipientsInputs/RecipientsInput';
import { Recipients, Recipient } from '../../../main_window/reducers/types';

type Props = {
  onUpdateRecipients: (recipients: Recipients) => void;
  setToRef: (node) => void;
  defaultRecipients?: Recipients;
};

const clone = require('rfdc')();

const MessageInputs = (props: Props, ref) => {
  const {
    onUpdateRecipients,
    setToRef,
    defaultRecipients = {
      to: {
        arr: []
      },
      cc: {
        show: false,
        arr: []
      },
      bcc: {
        show: false,
        arr: []
      }
    }
  } = props;
  const [recipients, setRecipients] = useState({
    to: {
      arr: []
    },
    cc: {
      show: false,
      arr: []
    },
    bcc: {
      show: false,
      arr: []
    }
  });

  const handleUpdate = (field: string, arr: Array<Recipient>) => {
    const newRecip = clone(recipients);

    newRecip[field].arr = arr;
    setRecipients(newRecip);
    onUpdateRecipients(newRecip);
  };

  const handleCC = (type: string) => {
    const newRecip = clone(recipients);

    if (type === 'cc') {
      newRecip.cc.show = true;
    } else {
      newRecip.bcc.show = true;
    }

    setRecipients(newRecip);
  };

  return (
    <div className="px-3 z-10">
      <div className="border-b flex relative">
        <div className="w-8 text-gray-600 p-2">To</div>
        <div className="w-full">
          <RecipientsInput
            onUpdateData={arr => handleUpdate('to', arr)}
            recipients={recipients.to.arr}
            defaultRecipients={defaultRecipients.to.arr}
            setRef={setToRef}
          />
        </div>
        <div className="flex-none text-gray-600 self-end pb-2">
          {!(
            recipients.cc.show ||
            (defaultRecipients && defaultRecipients.cc.arr.length > 0)
          ) && (
            <button
              type="button"
              tabIndex={-1}
              className="focus:outline-none mr-2"
              onClick={() => handleCC('cc')}
            >
              Cc
            </button>
          )}
          {!(
            recipients.bcc.show ||
            (defaultRecipients && defaultRecipients.bcc.arr.length > 0)
          ) && (
            <button
              type="button"
              tabIndex={-1}
              className="focus:outline-none"
              onClick={() => handleCC('bcc')}
            >
              Bcc
            </button>
          )}
        </div>
      </div>

      {(recipients.cc.show ||
        (defaultRecipients && defaultRecipients.cc.arr.length > 0)) && (
        <div className="border-b flex relative">
          <div className="w-8 text-gray-600 p-2">Cc</div>
          <div className="w-full">
            <RecipientsInput
              onUpdateData={arr => handleUpdate('cc', arr)}
              recipients={recipients.cc.arr}
              defaultRecipients={defaultRecipients.cc.arr}
            />
          </div>
        </div>
      )}

      {(recipients.bcc.show ||
        (defaultRecipients && defaultRecipients.bcc.arr.length > 0)) && (
        <div className="border-b flex relative">
          <div className="w-9 text-gray-600 p-2">Bcc</div>
          <div className="w-full">
            <RecipientsInput onUpdateData={arr => handleUpdate('bcc', arr)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageInputs;
