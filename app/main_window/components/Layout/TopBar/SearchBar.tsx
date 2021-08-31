import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { AutoComplete, InputGroup, Icon } from 'rsuite';
import { Search } from 'react-iconly'
import Highlighter from 'react-highlight-words';
import { StateType, Dispatch, MailMessageType } from '../../../reducers/types';
import { messageSelection, setHighlightValue } from '../../../actions/mail';

const Mail = require('../../../../services/mail.service');

const SearchBar = (props: Props) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async searchQuery => {
    setSearchValue(searchQuery);
    let callResults = await Mail.search(searchQuery);
    if (callResults) {
      callResults = callResults.map((item, index) => {
        const result = { ...item };
        result.index = index;
        return JSON.stringify(result);
      });

      setResults(callResults);
      setSearchQuery(searchQuery);
    }
  };

  const handleSelect = (selected, event) => {
    const { selectMessage, highlightSearch } = props;
    highlightSearch(searchQuery);
    selectMessage(JSON.parse(selected.value), 'showMaxDisplay');
    setTimeout(() => {
      setSearchValue('');
    });
  };

  const handleExit = () => {
    setSearchQuery('');
    setSearchValue('');
    setResults([]);
  };

  return (
    <InputGroup inside>
      <InputGroup.Addon>
        <Search size="small" set="broken" className="text-sm" />
      </InputGroup.Addon>
      <AutoComplete
        className="text-sm"
        data={results}
        value={searchValue}
        placeholder="Search"
        onChange={handleSearch}
        onSelect={handleSelect}
        onClose={handleExit}
        renderItem={item => {
          const email = JSON.parse(item.label);
          let bodyArr = email.bodyAsText.split(' ');
          bodyArr = bodyArr.slice(0, 30);
          const bodyAsText = bodyArr.join(' ');
          return (
            <div className="z-100">
              <div className="flex">
                <div className="flex-initial">
                  <Icon icon="envelope" className="mr-3" />
                </div>
                <div className="flex-grow-0">
                  <strong>
                    <Highlighter
                      highlightClassName="bg-yellow-300"
                      searchWords={searchValue.split(' ')}
                      autoEscape
                      textToHighlight={email.subject}
                    />
                  </strong>
                  <p
                    className="text-gray-500"
                    style={{ width: '500px', maxWidth: '500px' }}
                  >
                    <Highlighter
                      highlightClassName="bg-yellow-300"
                      searchWords={searchValue.split(' ')}
                      autoEscape
                      textToHighlight={bodyAsText}
                    />
                  </p>
                </div>
              </div>
            </div>
          );
        }}
      />
    </InputGroup>
  );
};

const mapStateToProps = (state: StateType) => ({});

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    selectMessage: async (message: MailMessageType, action: string) => {
      await dispatch(messageSelection(message, action));
    },
    highlightSearch: (searchQuery: string) => {
      dispatch(setHighlightValue(searchQuery));
    }
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux & {
  // this object would hold any props not coming from redux
};

export default connector(SearchBar);
