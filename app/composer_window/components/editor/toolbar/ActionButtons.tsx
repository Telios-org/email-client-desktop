import createActionButton from './utils/createActionButton';

export const SendEmailButton = createActionButton({
  icon: 'send',
  tooltip: 'send',
  text: 'SEND'
});

export const AddAttachmentsButton = createActionButton({
  icon: 'attachment',
  tooltip: 'add attachment(s)'
});
