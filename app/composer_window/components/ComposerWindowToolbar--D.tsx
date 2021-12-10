import React from 'react';
import { useDispatch } from 'react-redux';
import { ButtonToolbar, Whisper, Tooltip, IconButton, Icon } from 'rsuite';
import Mail from '../../services/mail.service';

import { loadMailboxes } from '../../main_window/actions/mail';

type Props = {
  msgId: string;
  onClose: () => void;
  onMaximize: () => void;
};

export default function ComposerWindowToolbar(props: Props) {
  const dispatch = useDispatch();
  const { onClose, onMaximize, msgId } = props;

  // Permanently delete messages
  const deleteMessage = async (id: string) => {
    await Mail.removeMessages([id]);
    dispatch(loadMailboxes({ fullSync: false }));
    onClose({ action: 'delete' });
  };

  return (
    <ButtonToolbar className="pt-2 pl-2">
      <Whisper
        placement="top"
        trigger="hover"
        speaker={<Tooltip>Close</Tooltip>}
      >
        <IconButton
          circle
          size="lg"
          icon={<Icon icon="close" />}
          onClick={onClose}
        />
      </Whisper>
      <Whisper
        placement="top"
        trigger="hover"
        speaker={<Tooltip>Maximize</Tooltip>}
      >
        <IconButton
          circle
          size="lg"
          icon={<Icon icon="window-restore" />}
          onClick={onMaximize}
        />
      </Whisper>
      <Whisper
        placement="top"
        trigger="hover"
        speaker={<Tooltip>Delete</Tooltip>}
      >
        <IconButton
          circle
          size="lg"
          icon={<Icon icon="trash" />}
          onClick={() => {
            deleteMessage(msgId);
          }}
        />
      </Whisper>
    </ButtonToolbar>
  );
}
