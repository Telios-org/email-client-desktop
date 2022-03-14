import React from 'react';

type Props = {
  label: string;
  value: string;
  editMode: boolean;
  onEdit: (e: Event) => void;
};

const NotesField = (props: Props) => {
  const { label, value, editMode, onEdit } = props;

  return (
    <div className="sm:col-span-2">
      {!editMode && (
        <>
          <dt className="text-sm font-medium text-gray-500">{label}</dt>
          <dd className="mt-1 max-w-prose text-sm text-gray-900 space-y-5 whitespace-pre-line">
            {value}
          </dd>
        </>
      )}
      {editMode && (
        <>
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700"
          >
            {`Add your ${label}`}
          </label>
          <div className="mt-1">
            <textarea
              rows={4}
              name="comment"
              id="comment"
              className="form-textarea shadow-sm focus:ring-sky-500 focus:border-sky-500 block w-full sm:text-sm border-gray-300 rounded-md"
              value={value}
              onChange={onEdit}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default NotesField;
