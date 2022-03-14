import React from 'react';

type Props = {
  label: string;
  value: string;
  typeValue: string;
  editMode: boolean;
  onEdit: (e: Event) => void;
  onTypeChange: (e: Event) => void;
};

const PhoneField = (props: Props) => {
  const { label, value, typeValue, editMode, onEdit, onTypeChange } = props;

  return (
    <div className="sm:col-span-1">
      {!editMode && (
        <>
          <dt className="text-sm font-medium text-gray-500">{label}</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {value}
            {typeValue && (
              <span className="text-gray-400 pl-2">{`(${typeValue})`}</span>
            )}
          </dd>
        </>
      )}
      {editMode && (
        <>
          <label
            htmlFor={label}
            className="block text-sm font-medium text-gray-400"
          >
            {label}
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 flex items-center">
              <label htmlFor="country" className="sr-only">
                Phone Type
              </label>
              <select
                id="phoneType"
                name="phoneType"
                onChange={onTypeChange}
                value={typeValue}
                className="form-select focus:ring-purple-500 focus:border-purple-500 h-full py-0 pl-3 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md"
              >
                <option value="Cell">Cell</option>
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <input
              type="text"
              name="phone-number"
              id="phone-number"
              onChange={onEdit}
              className="form-input placeholder:text-gray-300 focus:ring-purple-500 focus:border-purple-500 block w-full pl-20 sm:text-sm border-gray-300 rounded-md"
              placeholder="+1 (910) 999-9999"
              value={value}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default PhoneField;
