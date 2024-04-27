import { useState } from 'react';
import clsx from 'clsx';

interface Props {
  callback: (url: string) => void;
}

const InputSearchBar: React.FC<Props> = ({ callback }) => {
  const [searchInput, setSearchInput] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const handleSubmit = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      callback(searchInput);
    }
  };

  return (
    <div className="flex justify-center mb-4 w-full">
      <input
        type="text"
        value={searchInput}
        onChange={handleInputChange}
        onKeyPress={handleSubmit}
        placeholder="Enter Youtube URL..."
        className='w-full h-12 p-3 text-lg rounded-full border-2 border-gray-100 shadow-xl'
      />
    </div>
  );
};

export default InputSearchBar;