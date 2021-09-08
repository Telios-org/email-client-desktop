import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import {
  AutoComplete,
  InputGroup,
  Icon,
  IconButton,
  Table,
  Avatar
} from 'rsuite';

import ContactModal from '../../../components/Contact/ContactModal';

import { StateType, Dispatch, ContactType } from '../../../reducers/types';

import {
  fetchRolladex,
  commitContactsUpdates,
  deleteContact
} from '../../../actions/contacts/contacts';

import { flattenObject } from '../../../../utils/form.util';

const { Column, HeaderCell, Cell } = Table;
const clone = require('rfdc')();

const ImageCell = ({
  rowData: { givenName = '', familyName = '', name = '' },
  dataKey,
  ...props
}: {
  rowData: { givenName: string; familyName: string; name: string };
  dataKey: any;
}) => {
  let initials = '';
  if (
    givenName &&
    givenName.length > 0 &&
    familyName &&
    familyName.length > 0
  ) {
    initials = `${givenName[0].toUpperCase()}${familyName[0].toUpperCase()}`;
  } else if (givenName && givenName.length > 0) {
    initials = `${givenName.substring(0, 2).toUpperCase()}`;
  } else if (familyName && familyName.length > 0) {
    initials = `${familyName.substring(0, 2).toUpperCase()}`;
  } else if (name && name.length > 0) {
    initials = `${name.substring(0, 1).toUpperCase()}`;
  }

  return (
    <Cell
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      className="-mt-1 p-0"
    >
      <Avatar size="sm">{`${initials}`}</Avatar>
    </Cell>
  );
};

const contactTemplate = {
  name: '',
  givenName: '',
  familyName: '',
  nickname: '',
  birthday: '',
  photo: '',
  email: '',
  phone: [
    {
      value: '',
      type: ''
    }
  ],
  address: [
    {
      formatted: '',
      street: '',
      street2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      type: ''
    }
  ],
  website: '',
  notes: '',
  organization: [
    {
      name: '',
      jobTitle: ''
    }
  ]
};

class ContactPage extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      showModal: false,
      sortColumn: '',
      sortType: undefined,
      contactEdit: false,
      currentContact: undefined
    };

    this.handleSortColumn = this.handleSortColumn.bind(this);
    this.getData = this.getData.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.setEditMode = this.setEditMode.bind(this);

    this.getContactCount = this.getContactCount.bind(this);
    this.saveContact = this.saveContact.bind(this);
    this.deleteContact = this.deleteContact.bind(this);
  }

  componentDidMount() {
    const { fetchContacts } = this.props;
    fetchContacts();
  }

  handleSortColumn(sortColumn: string, sortType: 'desc' | 'asc' | undefined) {
    this.setState({
      loading: true
    });

    setTimeout(() => {
      this.setState({
        sortColumn,
        sortType,
        loading: false
      });
    }, 500);
  }

  getData() {
    const { sortColumn, sortType } = this.state;
    const { contacts } = this.props;
    const data = clone(contacts);
    const transform = data.map(c => {
      return {
        ...c,
        organization_display:
          (c.organization &&
            c.organization.length > 0 &&
            c.organization[0].name) ||
          '',
        phone_display: (c.phone && c.phone.length > 0 && c.phone[0].value) || ''
      };
    });
    if (sortColumn && sortType) {
      return transform.sort((a, b) => {
        let x = a[sortColumn];
        let y = b[sortColumn];
        if (typeof x === 'string') {
          x = x.charCodeAt();
        }
        if (typeof y === 'string') {
          y = y.charCodeAt();
        }
        if (sortType === 'asc') {
          return x - y;
        }
        return y - x;
      });
    }
    return transform;
  }

  getContactCount() {
    const { contacts } = this.props;
    if (contacts && contacts.length > 0) {
      return `Total: ${contacts.length}`;
    }

    return 'Total: 0';
  }

  setEditMode(contactEdit: boolean) {
    this.setState({
      contactEdit
    });
  }

  saveContact(data: ContactType) {
    const { saveContacts } = this.props;
    saveContacts(data);
    this.setState({
      contactEdit: false,
      currentContact: data
    });
  }

  deleteContact(contactId: number) {
    const { removeContact } = this.props;
    removeContact(contactId);
  }

  openModal(data: ContactType | undefined, editMode: boolean) {
    let rawData: ContactType = undefined;

    if (data && data.id) {
      const { contacts } = this.props;
      // Referencing the raw contact data since we
      // may have manipulated the data to display in the table
      [rawData] = contacts.filter(c => c.id === data.id);
    }

    this.setState({
      showModal: true,
      currentContact: rawData,
      contactEdit: editMode
    });
  }

  closeModal() {
    this.setState({
      showModal: false
    });
  }

  render() {
    const {
      loading,
      sortType,
      sortColumn,
      showModal,
      contactEdit,
      currentContact
    } = this.state;

    return (
      <div className="flex flex-col m-8 select-none">
        <div className="flex flex-row justify-between mb-8">
          <div className="text-xl">Contacts</div>
          <div className="flex items-center">
            <IconButton
              appearance="primary"
              size="md"
              icon={<Icon icon="plus" />}
              className="mr-2"
              placement="left"
              onClick={() => this.openModal(contactTemplate, true)}
            >
              Add Contact
            </IconButton>
          </div>
        </div>
        <div className="block mb-24">
          <Table
            virtualized
            data={this.getData()}
            loading={loading}
            sortColumn={sortColumn}
            sortType={sortType}
            onSortColumn={this.handleSortColumn}
            onRowClick={data => this.openModal(data, false)}
            autoHeight
            affixHeader
          >
            <Column width={80} align="center" verticalAlign="middle">
              <HeaderCell>{this.getContactCount()}</HeaderCell>
              <ImageCell dataKey="avatar" />
            </Column>

            <Column width={200} sortable>
              <HeaderCell>Name</HeaderCell>
              <Cell dataKey="name" />
            </Column>

            <Column width={200} sortable>
              <HeaderCell>Organization</HeaderCell>
              <Cell dataKey="organization_display" />
            </Column>

            <Column width={200}>
              <HeaderCell>Email</HeaderCell>
              <Cell dataKey="email" />
            </Column>

            <Column width={200}>
              <HeaderCell>Phone</HeaderCell>
              <Cell dataKey="phone_display" />
            </Column>
          </Table>
        </div>
        <ContactModal
          data={currentContact}
          edit={contactEdit}
          onDelete={this.deleteContact}
          show={showModal}
          onEditMode={this.setEditMode}
          onClose={this.closeModal}
          onSave={data => this.saveContact(data)}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: StateType) => {
  return {
    contacts: state.contacts
  };
};

// Functions that I want the component to be able to dispatch
const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    fetchContacts: () => dispatch(fetchRolladex()),
    saveContacts: (contact: ContactType) =>
      dispatch(commitContactsUpdates(contact)),
    removeContact: (contactId: number) => dispatch(deleteContact(contactId))
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux & {
  // this object would hold any props not coming from redux
};

type State = {
  loading: boolean;
  sortType: 'asc' | 'desc' | undefined;
  sortColumn: string;
  showModal: boolean;
  contactEdit: boolean;
  currentContact: ContactType | undefined;
};

export default connector(ContactPage);
