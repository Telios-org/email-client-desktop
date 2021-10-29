import React from 'react';
import {
  Edit,
  Send,
  Danger,
  Delete,
  Star,
  Message,
  Bookmark
} from 'react-iconly';

const Hash = props => {
  const { className } = props;
  return <div className={`pl-1 ${className}`}>#</div>;
};

const CustomIcon = {
  new: Star,
  inbox: Message,
  pencil: Edit,
  'send-o': Send,
  'trash-o': Delete,
  'folder-o': Bookmark,
  ban: Danger,
  alias: Hash
};

export { CustomIcon as default };
