import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Toggle, Modal, Button, Whisper, Tooltip } from 'rsuite';

// UTILS
import { Edit, Delete, Danger, Paper } from 'react-iconly';
import i18n from '../../../../../../../i18n/i18n';
import {
  formatDateDisplay,
  formatFullDate
} from '../../../../../../utils/date.util';

// TYPESCRIPT
import { MailType } from '../../../../../../reducers/types';

// ACTION CREATORS
import {
  updateAlias,
  removeAlias
} from '../../../../../../actions/mailbox/aliases';

// CSS Style

import styles from './AliasManagementTable.css';

const { clipboard } = require('electron');

type Props = {
  domain: string;
  aliases: MailType[];
  ns: any;
  onShowEdit: (aliasId: string) => void;
};

const { Column, HeaderCell, Cell } = Table;

const CreatedDateCell = ({ rowData, dataKey, ...props }) => {
  return (
    <Cell {...props}>
      <div className="flex flex-row place-items-center">
        {/* <div className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </div> */}
        <div className="ml-1 flex text-xs">
          {formatDateDisplay(rowData[dataKey])}
        </div>
      </div>
    </Cell>
  );
};

const FwdPills = ({ rowData, dataKey, ...props }) => {
  return (
    <Cell {...props}>
      <div className="flex-col flex">
        {rowData[dataKey]?.map((fwd: string) => (
          <div key={`fwd_${fwd}`} className="inline-flex truncate">
            <div
              className={`${
                fwd.length > 0
                  ? 'bg-coolGray-100 py-1 px-3 text-xs rounded mb-1 truncate'
                  : ''
              }`}
            >
              {fwd}
            </div>
          </div>
        ))}
      </div>
    </Cell>
  );
};

export default function AliasManagementTable(props: Props) {
  const dispatch = useDispatch();
  const { aliases, domain, ns, onShowEdit } = props;
  const [showDelete, setShowDelete] = useState(false);
  const [deleteObj, setDeleteObj] = useState({});
  const [deleteLoading, setDeleteLoading] = useState(false);

  const data = aliases.allIds.map((al, index) => {
    const d = aliases.byId[al];

    return {
      id: index,
      alias: d.name,
      ns: ns.name,
      domain,
      createdDate: d.createdAt,
      disabled: d.disabled,
      fwdAddresses: d.fwdAddresses,
      description: d.description
    };
  });

  // const tableHeight = data?.length * 55 + 40;
  const tableHeight = data?.reduce((previousValue, curr) => {
    const multiplier =
      curr.fwdAddresses.length <= 1 ? 1 : curr.fwdAddresses.length * 0.75;
    return multiplier * 55 + previousValue;
  }, 40);

  const handleToggleAction = async (rowData, value, event) => {
    const payload = {
      namespaceName: rowData.ns,
      domain,
      address: rowData.alias,
      description: rowData.description,
      fwdAddresses: rowData.fwdAddresses,
      disabled: !rowData.disabled
    };
    dispatch(updateAlias(payload));
  };

  const handleDeleteAlias = async () => {
    const payload = {
      namespaceName: deleteObj.ns,
      domain,
      address: deleteObj.alias
    };
    setDeleteLoading(true);
    await dispatch(removeAlias(payload));
    setDeleteLoading(false);
    setShowDelete(false);
  };

  const handleDeleteAction = rowData => {
    setDeleteObj(rowData);
    setShowDelete(true);
  };

  return (
    <>
      <Table
        loading={data.length === 0}
        data={data}
        hover={false}
        className="text-xs text-coolGray-500 rounded"
        bordered
        height={tableHeight < 300 ? tableHeight : 300}
        rowHeight={rowData => {
          if (rowData?.fwdAddresses?.length > 1) {
            return rowData?.fwdAddresses?.length * 55 * 0.75;
          }

          return 55;
        }}
        onSortColumn={(sortColumn, sortType) => {
          console.log(sortColumn, sortType);
        }}
      >
        <Column width={125} fixed verticalAlign="middle">
          <HeaderCell className="font-bold text-coolGray-500">
            Created
          </HeaderCell>
          <CreatedDateCell className="text-sm" dataKey="createdDate" />
        </Column>
        <Column flexGrow={1} verticalAlign="middle">
          <HeaderCell className="font-bold text-coolGray-500">Alias</HeaderCell>
          <Cell>
            {rowData => {
              return (
                <>
                  <div className="text-xs font-semibold">
                    {`${rowData.ns}#`}
                    <span className="text-purple-600">{rowData.alias}</span>
                    {`@${rowData.domain}`}
                  </div>
                  {rowData.description?.length > 0 && (
                    <div className="text-2xs text-coolGray-400">
                      {rowData.description}
                    </div>
                  )}
                </>
              );
            }}
          </Cell>
        </Column>

        <Column verticalAlign="middle" fixed width={200}>
          <HeaderCell className="font-bold text-coolGray-500">
            Forward Addresses
          </HeaderCell>
          <FwdPills dataKey="fwdAddresses" />
        </Column>

        <Column fixed width={75} verticalAlign="middle">
          <HeaderCell className=" font-bold text-coolGray-500">
            Active
          </HeaderCell>

          <Cell className={`font-semibold ${styles.aliasActive}`}>
            {rowData => (
              <Toggle
                size="sm"
                checked={!rowData.disabled}
                onChange={(value, event) => {
                  return handleToggleAction(rowData, value, event);
                }}
              />
            )}
          </Cell>
        </Column>
        <Column fixed width={85} verticalAlign="middle" align="center">
          <HeaderCell />
          <Cell className="font-semibold">
            {rowData => (
              <div className="flex flex-row">
                <Whisper
                  trigger="click"
                  placement="top"
                  speaker={<Tooltip>Copied!</Tooltip>}
                >
                  <Paper
                    set="broken"
                    size="small"
                    className="hover:text-blue-500"
                    style={{ cursor: 'pointer' }}
                    onClick={() =>
                      clipboard.writeText(
                        `${rowData.ns}#${rowData.alias}@${rowData.domain}`
                      )}
                  />
                </Whisper>
                <span className="mx-1" />
                <Edit
                  set="broken"
                  size="small"
                  className="hover:text-blue-500"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onShowEdit(`${rowData.ns}#${rowData.alias}`)}
                />
                <span className="mx-1" />
                <Delete
                  set="broken"
                  size="small"
                  className="hover:text-red-500"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleDeleteAction(rowData)}
                />
              </div>
            )}
          </Cell>
        </Column>
      </Table>
      <Modal
        size="xs"
        show={showDelete}
        onHide={() => setShowDelete(false)}
        backdrop
      >
        <Modal.Header>
          <Modal.Title>Hmmmm, Bye Bye!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="leading-relaxed">
            Deleting
            <b>
              {` ${deleteObj?.ns}#`}
              <span className="text-purple-600">{deleteObj?.alias}</span>
              {`@${deleteObj?.domain} `}
            </b>
            will remove it from your list of aliases and block its incoming
            traffic.
          </p>
          <p>
            You can recreate this alias only through the app (as opposed to "on
            the fly creation").
          </p>
          <p className="leading-relaxed text-xs flex flex-row items-center ">
            <Danger set="broken" className="text-coolGray-400" />
            <span className="mt-2 ml-2 text-coolGray-400">
              All emails from this alias will be archived upon deletion.
            </span>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={handleDeleteAlias}
            loading={deleteLoading}
            className="tracking-wide border-color-purple-800 shadow-sm border-red-400 bg-red-500 text-white"
          >
            Yes, Delete
          </Button>
          <Button
            onClick={() => setShowDelete(false)}
            appearance="ghost"
            className="border-coolGray-300 text-coolGray-400 tracking-wide"
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
