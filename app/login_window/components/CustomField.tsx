import React from 'react';
import { FormGroup, FormControl, ControlLabel } from 'rsuite';

const errorStyles = errorVisible => {
  return {
    display: errorVisible ? 'block' : 'none',
    color: 'red',
    marginTop: 6
  };
};

export default class CustomField extends React.PureComponent {
  render() {
    const {
      name,
      message,
      label,
      accepter,
      error,
      disabled,
      loading,
      ...props
    } = this.props;
    return (
      <FormGroup className={error ? 'has-error' : ''}>
        <ControlLabel className="font-medium mb-2 text-gray-500 select-none">
          {label}
        </ControlLabel>
        <FormControl
          name={name}
          accepter={accepter}
          disabled={loading}
          errorMessage={error}
          {...props}
        />
        <div style={errorStyles(error)}>{error}</div>
      </FormGroup>
    );
  }
}
