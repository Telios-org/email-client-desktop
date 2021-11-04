import React from 'react';
import { Loader } from 'rsuite';
import { BsReplyAll, BsReply, BsForward, BsTrash } from 'react-icons/bs';
import styles from './ActionButton.css';

type Props = {
  action: string;
  loading: boolean;
  onClick: () => void;
};

const ACTION_ICON = {
  reply: <BsReply className={`pb-1 w-6 h-6 ${styles.flip} cursor-pointer`} />,
  replyall: <BsReplyAll className={`pb-1 w-6 h-6 ${styles.flip} cursor-pointer`} />,
  forward: <BsForward className={`pb-1 w-6 h-6 ${styles.flip} cursor-pointer`} />,
  trash: <BsTrash className="w-4 h-4 mt-1" />
};

export default function ActionButton(props: Props) {
  const { action, loading, onClick } = props;

  const Icon = () => {
    if (loading) {
      return <Loader className="focus:outline-none" />;
    }

    return (
      <button type="button" className="focus:outline-none" onClick={onClick}>
        {ACTION_ICON[action]}
      </button>
    );
  };

  return (
    <div className="focus:outline-none w-6 h-6 ml-3 text-gray-500 flex items-center justify-center">
      {Icon()}
    </div>
  );
}
