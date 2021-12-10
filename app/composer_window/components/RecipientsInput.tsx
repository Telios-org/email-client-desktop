import React, { Component } from 'react';
import CreatableSelect from 'react-select/creatable';
import { components } from 'react-select';
import { Avatar, Whisper, Tooltip } from 'rsuite';

import ComposerService from '../../services/composer.service';

const validateEmail = (email: string) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // eslint-disable-line
  return re.test(email);
};

const validateTeliosEmail = (email: string) => {
    const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/g; // eslint-disable-line
  return re.test(email);
};

const isValidEmail = (email: string) => {
  if (email.indexOf('telios') > -1) {
    return validateTeliosEmail(email);
  }
  return validateEmail(email);
};

const customStyles = {
  control: () => ({
    marginTop: '3px'
  }),
  indicatorsContainer: inlineCss => ({
    ...inlineCss,
    display: 'none'
  }),
  placeholder: inlineCss => ({
    ...inlineCss,
    display: 'none'
  }),
  multiValue: (styles, { data }) => {
    const style = {
      ...styles
    };

    if (!isValidEmail(data.value)) {
      style.color = 'white';
      style.backgroundColor = 'red';
    }
    return style;
  },
  multiValueLabel: (styles, { data }) => {
    const style = {
      ...styles
    };

    if (!isValidEmail(data.value)) {
      style.color = 'white';
    }
    return style;
  }
};

const MultiValueContainer = props => {
  return (
    <Whisper
      placement="bottom"
      trigger={props.data.value !== props.data.label ? 'hover' : 'none'}
      speaker={<Tooltip>{props.data.value}</Tooltip>}
    >
      <div>
        <components.MultiValueContainer {...props} />
      </div>
    </Whisper>
  );
};

const formattedOptionLabel = option => {
  if (typeof option.label === 'string') {
    let initials = '';
    const nameArr = option.label.split(' ');

    if (nameArr.length === 2) {
      initials = `${nameArr[0][0]}${nameArr[1][0]}`;
    }

    if (nameArr.length === 1) {
      initials = `${nameArr[0][0]}`;
    }

    return (
      <div>
        {option.photo && (
          <Avatar
            size="xs"
            className="uppercase align-middle mr-2"
            alt={initials}
            src={`${option.photo}`}
          />
        )}
        <span>{option.label}</span>
      </div>
    );
  }

  return <span>{option.value}</span>;
};

const formattedCreateLabel = option => {
  return <span>{option.value}</span>;
};

class RecipientsInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuIsOpen: false,
      options: [],
      recipients: null
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.queryContacts = this.queryContacts.bind(this);
  }

  handleInputChange(input, { action }) {
    if (input.length > 0) {
      this.setState({ menuIsOpen: true });
      this.queryContacts(input);
    }

    if (action === 'set-value') {
      this.setState({ menuIsOpen: false });
    }
  }

  handleChange(data, { action }) {
    const { onUpdateData } = this.props;
    let items = data ? [...data] : [];

    if (items.length > 0) {
      items = items.map(item => {
        return {
          label: typeof item.label === 'string' ? item.label : item.value,
          value: item.value,
          isValid: !!isValidEmail(item.value)
        };
      });

      this.setState({
        recipients: items
      });
    } else {
      this.setState({
        recipients: []
      });
    }
    onUpdateData(items);
  }

  handleBlur() {
    this.setState({ menuIsOpen: false });
  }

  async queryContacts(query: string) {
    if (query.length > 2) {
      try {
        const results = await ComposerService.searchContact(query);

        const contacts = results.map(contact => {
          return {
            label: contact.name,
            value: contact.address,
            photo: contact.photo
          };
        });
        this.setState({ options: contacts });
      } catch (err) {
        console.log('queryContacts Method ERROR', err);
      }
    }
  }

  render() {
    const { options, menuIsOpen, recipients } = this.state;
    const { defaultRecipients } = this.props;

    return (
      <CreatableSelect
        components={{ MultiValueContainer }}
        options={options}
        value={recipients || defaultRecipients}
        styles={customStyles}
        menuIsOpen={menuIsOpen}
        onInputChange={this.handleInputChange}
        onChange={this.handleChange}
        onBlur={this.handleBlur}
        formatOptionLabel={formattedOptionLabel}
        formatCreateLabel={formattedCreateLabel}
        isMulti
      />
    );
  }
}

export default RecipientsInput;
