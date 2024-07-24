import * as React from 'react';
import { Searchbar } from 'react-native-paper';

interface SearchBarInputProps {
    onChange?: (text: string) => void
}

const SearchBar: React.FC<SearchBarInputProps> = ({ onChange }) => {
  const [searchQuery, setSearchQuery] = React.useState('');

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
        borderColor: '#e1f7e8'
      }}
    />
  );
};

export default SearchBar;
