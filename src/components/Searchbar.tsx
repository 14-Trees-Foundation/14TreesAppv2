import * as React from 'react';
import { Searchbar } from 'react-native-paper';

interface SearchBarInputProps {
  query?: string,
  onChange?: (text: string) => void
}

const SearchBar: React.FC<SearchBarInputProps> = ({ query, onChange }) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    if (query !== undefined) setSearchQuery(query);
  }, [query])

  const handleChange = (text: string) => {
    setSearchQuery(text);
    onChange && onChange(text);
  }

  return (
    <Searchbar
      placeholder="Search"
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
