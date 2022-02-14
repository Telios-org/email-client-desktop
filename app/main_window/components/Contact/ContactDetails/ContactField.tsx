import React from 'react';

type Props = {
  label: string;
  value: string;
  editMode: boolean;
  onEdit?: () => void;
};

const ContactField = (props: Props) => {
  const { label, value, editMode, onEdit = () => {} } = props;

  return (
    <div className="sm:col-span-1">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value}</dd>
    </div>
  );
};

export default ContactField;
