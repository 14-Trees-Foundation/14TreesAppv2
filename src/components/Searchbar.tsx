import * as React from 'react';
import { Searchbar } from 'react-native-paper';
import { Strings } from '../services/Strings';

interface SearchBarInputProps {
  query?: string,
  onChange?: (text: string) => void
  autoFocus?: boolean
}

const SearchBar: React.FC<SearchBarInputProps> = ({ query, autoFocus, onChange }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const ref = React.useRef<any>(null)

  React.useEffect(() => {
    if (query !== undefined) setSearchQuery(query);
  }, [query])

  const handleChange = (text: string) => {
    setSearchQuery(text);
    onChange && onChange(text);
  }

  React.useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus();
    }
  }, [autoFocus])

  return (
    <Searchbar
      ref={ref}
      placeholder={Strings.buttonLabels.Search}
      onChangeText={handleChange}
      value={searchQuery}
      style={{
        backgroundColor: '#f2fff6',
        borderColor: '#e1f7e8',
      }}
      inputStyle={{
        color: 'black'
      }}
    />
  );
};

export default SearchBar;
