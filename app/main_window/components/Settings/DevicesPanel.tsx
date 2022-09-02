import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import QRCode from 'react-qr-code';

import { QrcodeIcon, DeviceMobileIcon } from '@heroicons/react/outline';
import { Show, Hide, Paper } from 'react-iconly';
import Countdown, { zeroPad } from 'react-countdown';

// INTERNAL COMPONENTS
import SettingsSection from './shared/SettingsSection';
import { Button } from '../../../global_components/button';
import Notification from '../Global/Notification';

// SELECTOR
import { selectActiveMailbox } from '../../selectors/mail';

// SERVICE
import AccountService from '../../../services/account.service';

const { clipboard } = require('electron');

const DevicesPanel = () => {
  const mailbox = useSelector(selectActiveMailbox);
  const account = useSelector(state => state.account);

  const [loading, setLoading] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [QrCode, setQrCode] = useState('');
  const [syncCode, setSyncCode] = useState('');
  const [showCountdown, setShowCountDown] = useState(false);

  const [copyText, setCopyText] = useState('Copy');

  const [showNotification, setShowNotification] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [codeSucceeded, setCodeSucceeded] = useState(true);

  const handleCopy = (value: string) => {
    clipboard.writeText(value ?? '');
    setCopyText('Copied!');
  };

  const resetCopy = () => {
    if (copyText === 'Copied!') {
      setCopyText('Copy');
    }
  };

  const generateCode = async () => {
    setLoading(true);
    setShowCountDown(false);
    AccountService.createSyncCode()
      .then(data => {
        const { code } = data;
        setSyncCode(code);
        setLoading(false);
        setShowCountDown(true);
        return true;
      })
      .catch(error => {
        setLoading(false);
        setCodeSucceeded(false);
        setNotifMessage('Something went wrong!');
        setShowNotification(true);
        console.log(error);
      });
  };

  const countdownRenderer = ({ hours, minutes, seconds, completed }) => {
    if (completed) {
      // Render a completed state
      return (
        <span className="text-red-500 text-xs">
          Code Expired! Generate new one.
        </span>
      );
    }
    // Render a countdown
    return (
      <span className="text-xs">
        Expires in:
{' '}
        <span className="font-medium text-purple-500">
          {zeroPad(minutes)}:{zeroPad(seconds)} min
        </span>
      </span>
    );
  };

  // const onPressGenerateQrCode = () => {
  //   setShowCode(false);
  //   setShowQrCode(!showQrCode);
  // };
  // const onPressGenerateCode = () => {
  //   setShowQrCode(false);
  //   setShowCode(!showCode);
  // };

  // const onCopyToClipboard = () => {
  //   if (syncInfo) {
  //     Clipboard.setString(syncInfo.code);
  //   }
  // };

  // const generateSyncInfo = async () => {
  //   if (showCode || (showQrCode && !syncInfo?.email && !syncInfo?.drive_key)) {
  //     try {
  //       setIsLoading(true);
  //       const resp = await dispatch(createAccountSyncInfo()).unwrap();
  //       setSyncInfo(resp);
  //     } catch (error) {
  //       Alert.alert(
  //         'Error',
  //         'Something went wrong while getting sync info, please try again.'
  //       );
  //     }
  //     setIsLoading(false);
  //   }
  // };

  useEffect(() => {
    if (
      mailbox?.address.length > 0 &&
      account?.driveSyncingPublicKey.length > 0
    ) {
      console.log(mailbox.address, account.driveSyncingPublicKey);
      setQrCode(
        JSON.stringify({
          email: mailbox.address,
          drive_key: account.driveSyncingPublicKey
        })
      );
      setShowQrCode(true);
    }
  }, [mailbox.address, account.driveSyncingPublicKey]);

  return (
    <>
      <SettingsSection
        header="Device Syncing"
        description="If you want to add your account to another computer or mobile device."
      >
        <div className="p-4 bg-white">
          <p className="pb-4">
            In order to sync your device use the QR code (mobile only) or
            manually generate a sync code. Manual code are only valid for 10
            minutes.
          </p>
          <div className="flex flex-row mx-auto w-fit">
            <div className="flex flex-col w-fit">
              <div className="block text-sm font-medium text-gray-700 pb-4 self-center">
                QR Code
              </div>
              <div className="relative bg-purple-100 shadow rounded-full w-fit p-9">
                <div className="bg-purple-500 p-1 absolute shadow rounded-full z-10 right-3 top-3">
                  <DeviceMobileIcon className="h-5 w-5 text-white" />
                </div>
                <div className="bg-purple-500 p-1 absolute shadow rounded-full z-10 left-3 bottom-3">
                  <QrcodeIcon className="h-5 w-5 text-white" />
                </div>
                <div className="shadow w-fit rounded-xl">
                  <div className="p-2 rounded-xl bg-white">
                    <div className="relative max-w-[100px] w-full p-2 rounded-lg  border-gray-300">
                      {/* <div className="absolute w-[70%] bg-white -top-3 left-1/2 transform -translate-x-1/2 text-xs text-center">
                      
                    </div>
                    <div className="absolute w-[70%] bg-white -bottom-3 left-1/2 transform -translate-x-1/2  text-xs text-center">
                      
                    </div>
                    <div className="absolute w-1 h-[70%] bg-white -left-1 top-1/2 transform -translate-y-1/2" />
                    <div className="absolute w-1 h-[70%] bg-white -right-1 top-1/2 transform -translate-y-1/2" /> */}

                      {showQrCode && (
                        <QRCode
                          size={100}
                          viewBox="0 0 100 100"
                          style={{
                            height: 'auto',
                            maxWidth: '100%',
                            width: '100%'
                          }}
                          value={QrCode}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative w-20 mx-8 self-center mt-7">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-2 text-sm text-gray-500 font-medium">
                  OR
                </span>
              </div>
            </div>
            <div className="flex flex-col w-[180px]">
              <div className="block text-sm font-medium text-gray-700 pb-4 self-center">
                Manual Code
              </div>
              <div className=" space-y-4 mt-2">
                {/* <span className="block text-sm font-medium text-gray-700" /> */}

                <div className="mt-2 flex flex-row w-full border border-gray-300 bg-gray-100 rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm font-medium">
                  <div className="break-words flex-1 min-w-[40%]">
                    {syncCode}
                  </div>
                  {/* COPY BUTTON */}
                  <button
                    type="button"
                    onMouseLeave={resetCopy}
                    onClick={() => handleCopy(syncCode)}
                    className="relative flex flex-col items-center group outline-none"
                  >
                    <Paper
                      size="small"
                      set="broken"
                      className="text-gray-400 hover:text-purple-600 mt-0.5 ml-1"
                      style={{ cursor: 'pointer' }}
                    />
                    <div className="absolute top-0 flex-col items-center hidden group-hover:flex -mt-9">
                      <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-gray-700 shadow-lg rounded">
                        {copyText}
                      </span>
                      <div className="w-3 h-3 -mt-2 rotate-45 bg-gray-700" />
                    </div>
                  </button>
                  {/* END */}
                </div>
                <Button
                  type="button"
                  className="py-2"
                  onClick={generateCode}
                  loading={loading}
                >
                  Generate Code
                </Button>
                <div className="text-center h-10">
                  {showCountdown && (
                    <Countdown
                      date={Date.now() + 600000}
                      renderer={countdownRenderer}
                    />
                  )}
                  {!showCountdown && (
                    <span className="text-gray-400 text-xs">
                      No code currently active. Generate one.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SettingsSection>
      <Notification
        show={showNotification}
        setShow={setShowNotification}
        success={codeSucceeded}
        successMsg={notifMessage}
        errorMsg="Something went wrong!"
      />
    </>
  );
};

export default DevicesPanel;
