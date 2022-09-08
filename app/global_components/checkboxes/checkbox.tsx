import React, { useState, ChangeEventHandler } from 'react';

import clsx from 'clsx';

type Props = {
  label: string;
  id: string | number;
  name: string;
  className?: string;
  description: string;
  onChange: (e: ChangeEventHandler<HTMLInputElement>) => any | void;
  required?: boolean;
  children: JSX.Element;
  error?: string;
  value?: any;
  defaultValue?: any;
};

const Checkbox = (props: Props) => {
  const {
    label,
    id,
    name,
    className,
    description,
    onChange: onChangeFromProps,
    required,
    children,
    error,
    value: valueFromProps,
    defaultValue
  } = props;

  // A component can be considered controlled when its value prop is
  // not undefined.
  const isControlled = typeof valueFromProps !== 'undefined';
  // When a component is not controlled, it can have a defaultValue.
  const hasDefaultValue = typeof defaultValue !== 'undefined';
  // If a defaultValue is specified, we will use it as our initial
  // state.  Otherwise, we will simply use an empty string.
  const [internalValue, setInternalValue] = useState(
    hasDefaultValue ? defaultValue : ''
  );
  // Internally, we need to deal with some value. Depending on whether
  // the component is controlled or not, that value comes from its
  // props or from its internal state.
  const value = isControlled ? valueFromProps : internalValue;

  const onChange = e => {
    // When the user types, we will call props.onChange if it exists.
    // We do this even if there is no props.value (and the component
    // is uncontrolled.)
    if (onChangeFromProps) {
      onChangeFromProps(e);
    }
    // If the component is uncontrolled, we need to update our
    // internal value here.
    if (!isControlled) {
      setInternalValue(e.target.value);
    }
  };

  return (
    <div className={clsx('relative flex items-start', className)}>
      <div className="flex items-center h-5">
        <input
          id={id}
          aria-describedby="comments-description"
          name={name}
          required={required}
          onChange={onChange}
          type="checkbox"
          value={value}
          checked={value}
          className=" focus:ring-violet-500 h-4 w-4 text-violet-600 border-gray-300 rounded form-checkbox cursor-pointer"
          style={{cursor: "pointer"}}
        />
      </div>
      <div className="relative ml-3 text-sm">
        {!children && (
          <>
            <label htmlFor={id} className="font-medium text-gray-700">
              {label}
            </label>
            <span id={`${id}-description`} className="text-gray-500">
              <span className="sr-only">{label}</span>
              {description}
            </span>
          </>
        )}
        {children}
        <div className="absolute -bottom-6 left-2 flex items-center justify-start text-xs">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    </div>
  );
};

Checkbox.defaultProps = {
  className: '',
  required: false,
  error: '',
  value: undefined,
  defaultValue: undefined
};

export default Checkbox;
