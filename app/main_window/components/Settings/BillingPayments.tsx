import React, { memo, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Divider, Panel, Icon, Button, Progress, Modal, Placeholder } from 'rsuite';

// REDUX STATE SELECTORS
import { selectAuthToken } from '../../selectors/global';

type Props = {
};

export default function BillingsPayemnts(props: Props) {
  const { Line } = Progress;
  const { Paragraph } = Placeholder;

  const authToken = useSelector(selectAuthToken);

  const [show, setShow] = useState(false);

  const close = () => {
    setShow(false);
  }

  const open = () => {
    setShow(true);
  }

  return (
    <div className="overflow-hidden">
      <div className="grid grid-cols-2">
        <h4 className="">Current plan</h4>
        <div className="justify-self-end">
          <Button
            className="text-purple-700 border-purple-700 active:shadow-sm mr-4"
            appearance="ghost"
          >
            View Billing Info
          </Button>
          <Button
            className="bg-gradient-to-tr from-purple-700 to-purple-500 rounded text-sm justify-center shadow active:shadow-sm"
            appearance="primary"
            onClick={open}
          >
            Upgrade
          </Button>
        </div>
      </div>
      <Divider style={{ margin: '8px 0' }} />
      <div className="mb-8">
        <Panel bordered bodyFill>
          <h6 className="bg-gray-100 p-4">Free</h6>
          <Divider style={{ margin: '0' }} />
          <div className="bg-white p-4">
            <ul>
              <li className="mb-2 text-sm">
                <span className="text-green-500 mr-2"><Icon icon="check" /></span> Unlimited emails in network
              </li>
              <li className="mb-2 text-sm">
                <span className="text-green-500 mr-2"><Icon icon="check" /></span> 100 outgoing emails daily out of network
              </li>
              <li className="mb-2 text-sm">
                <span className="text-green-500 mr-2"><Icon icon="check" /></span> 1 email address
              </li>
              <li className="mb-2 text-sm">
                <span className="text-green-500 mr-2"><Icon icon="check" /></span> 5 email aliases
              </li>
              <li className="mb-2 text-sm">
                <span className="text-green-500 mr-2"><Icon icon="check" /></span> Limited support
              </li>
            </ul>
          </div>
        </Panel>
      </div>
      <h4>Usage this month</h4>
      <Divider style={{ margin: '8px 0' }} />
      <div className="mb-8">
        <Panel bordered bodyFill>
          <h6 className="bg-gray-100 p-4">Storage</h6>
          <Divider style={{ margin: '0' }} />
          <div className="bg-white p-4">
            <span className="text-xs text-gray-500">Drive storage</span>
            <span className="text-xs text-gray-500 float-right">15 MB of 500 MB included</span>
            <Line style={{ padding: '8px 0' }} percent={15} showInfo={false} />
          </div>
        </Panel>
      </div>

      <div className="mb-8">
        <Panel bordered bodyFill>
          <h6 className="bg-gray-100 p-4">Email</h6>
          <Divider style={{ margin: '0' }} />
          <div className="bg-white p-4">
            <span className="text-xs text-gray-500">Outgoing emails</span>
            <span className="text-xs text-gray-500 float-right">80 of 100</span>
            <Line style={{ padding: '8px 0' }} percent={80} showInfo={false} />
          </div>
        </Panel>
      </div>

      <div className="mb-8">
        <Panel bordered bodyFill>
          <h6 className="bg-gray-100 p-4">Aliases</h6>
          <Divider style={{ margin: '0' }} />
          <div className="bg-white p-4 text-xs">
            <div className="mb-8">
              <span className="text-xs text-gray-500">Alias namespaces</span>
              <span className="text-xs text-gray-500 float-right">1 of 1</span>
              <Line style={{ padding: '8px 0' }} percent={100} showInfo={false} />
            </div>
            <div>
              <span className="text-xs text-gray-500">Alias addresses</span>
              <span className="text-xs text-gray-500 float-right">1 of 5</span>
              <Line style={{ padding: '8px 0' }} percent={20} showInfo={false} />
            </div>
          </div>
        </Panel>
      </div>

      <Modal className="h-screen" style={{ padding: '0', width: '100%' }} full show={show} onHide={close}>
        <Modal.Header>
          <Modal.Title>Upgrade Your Plan</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ margin: '0', padding: '0' }}>
          <div>
            {/* <webview style={{ margin: '0', padding: '0', height: '750px' }} className="w-full" src={`http://localhost:3001/client/subscribe?token=${authToken}`} ></webview> */}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}