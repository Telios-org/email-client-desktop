import React from 'react';

import { Notification, Divider, Icon, IconButton, Dropdown } from 'rsuite';

import AttachmentPreview from './AttachmentPreview';

import ComposerService from '../../../services/composer.service';
import { AttachmentType } from '../../../main_window/reducers/types';
import styles from './Attachments.css';

const mime = require('mime-types');
const path = require('path');
const clone = require('rfdc')();
const humanFileSize = require('../../../main_window/utils/attachment.util');

type Props = {
  attachments: AttachmentType[];
  displayStatus: string;
  onAttachmentChange?: (newArray: AttachmentType[]) => void;
};

type subProps = {
  item: AttachmentType[];
  displayStatus: string;
  onDelete: () => void;
  onSave: () => void;
};

const AttachmentItem = ({
  item,
  displayStatus,
  onDelete,
  onSave
}: subProps) => (
  <li
    key={`${item.filename}`}
    className="flex px-2 flex-row items-center group cursor-pointer pt-4 w-auto"
  >
    <AttachmentPreview attachment={item} key={item.filename} />
    <div className="pl-4 pr-2 flex flex-col">
      <div className="text-sm font-medium text-gray-600 w-40 overflow-ellipsis overflow-hidden">
        {item.filename}
      </div>
      <div>
        <span className="text-gray-400 px-1 text-sm">&#9679; </span>
        {item.readableSize}
      </div>
    </div>
    <div className="invisible group-hover:visible">
      {displayStatus === 'editor' && (
        <IconButton
          appearance="subtle"
          color="red"
          icon={<Icon icon="close" />}
          size="xs"
          onClick={onDelete}
        />
      )}
      {displayStatus === 'recipient' && (
        <IconButton
          appearance="subtle"
          color="blue"
          icon={<Icon icon="download2" />}
          size="xs"
          onClick={onSave}
        />
      )}
    </div>
  </li>
);

const Attachments = (props: Props) => {
  const { attachments = [], onAttachmentChange, displayStatus } = props;
  let attClone = [];

  if (typeof attachments === 'string') {
    attClone = clone(JSON.parse(attachments));
  } else {
    attClone = clone(attachments);
  }

  const attachmentsTransform = attClone.map(a => {
      const extension = mime.extension(a.mimetype);
      const readableSize = humanFileSize(a.size, true, 2);
      const filename = path.basename(a.filename);

      return Object.assign(a, { extension, readableSize, filename });
  });

  const deleteItem = (index: number) => {
    const newArray = [...attachments];
    newArray.splice(index, 1);
    onAttachmentChange(newArray);
  };

  const deleteAll = () => {
    onAttachmentChange([]);
  };

  const saveItem = async (index: number) => {
    const att = attachments[index];
    const res = await ComposerService.saveFiles([att]);
    if (res === 'success') {
      Notification.success({
        title: `${att.filename} Saved`,
        placement: 'bottomEnd'
      });
    }
  };

  const saveAll = async () => {
    const res = await ComposerService.saveFiles(attachments);
    if (res === 'success') {
      Notification.success({
        title: 'Attachment(s) Saved',
        placement: 'bottomEnd'
      });
    }
  };

  return (
    <div className="text-gray-500">
      <ul className="flex-wrap inline-flex px-4">
        {attachmentsTransform.map((a, i) => (
          <AttachmentItem
            item={a}
            key={a.filename}
            displayStatus={displayStatus}
            onDelete={() => deleteItem(i)}
            onSave={() => saveItem(i)}
          />
        ))}
      </ul>
      {attachments.length > 0 && (
        <Divider className="mt-2">
          <Dropdown
            title="Attachments"
            size="xs"
            menuStyle={{
              padding: '0px',
              overflow: 'hidden',
              marginTop: '5px'
            }}
          >
            {displayStatus === 'editor' && (
              <Dropdown.Item
                icon={<Icon icon="trash-o" />}
                className={`text-sm ${styles.remove}`}
                onClick={deleteAll}
              >
                Remove all
              </Dropdown.Item>
            )}
            {displayStatus === 'recipient' && (
              <Dropdown.Item
                icon={<Icon icon="save" />}
                className={`text-sm `}
                onClick={saveAll}
              >
                Save all as
              </Dropdown.Item>
            )}
          </Dropdown>
        </Divider>
      )}
    </div>
  );
}

Attachments.defaultProps = {
  onAttachmentChange: (newArray: AttachmentType[]) => {}
};

export default Attachments;