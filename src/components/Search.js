import React, { useState, useEffect } from 'react';
import Select, { components } from 'react-select';
import { useNavigate } from 'react-router-dom';
import './Search.css';

const Search = ({ repositories }) => {
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const languages = new Set();
    const names = new Set();

    repositories.forEach(repo => {
      if (repo.language) languages.add(repo.language);
      if (repo.name) names.add(repo.name);
    });

    const languageOptions = Array.from(languages).slice(0, 5).map(language => ({ label: language, value: language, type: 'language' }));
    const nameOptions = Array.from(names).slice(0, 5).map(name => ({ label: name, value: name, type: 'name' }));

    setOptions([
      { label: 'Names', options: nameOptions },
      { label: 'Languages', options: languageOptions }
    ]);
  }, [repositories]);

  const handleChange = (selectedOption) => {
    if (!selectedOption) return;

    if (selectedOption.type === 'language') {
      navigate(`/category/${selectedOption.value}`);
    } else if (selectedOption.type === 'name') {
      const selectedRepo = repositories.find(repo => repo.name === selectedOption.value);
      if (selectedRepo) {
        navigate(`/repository/${selectedRepo.owner.login}/${selectedRepo.name}`);
      }
    }
  };

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      borderBottom: '1px solid #ddd',
      color: state.isSelected ? 'black' : 'blue',
      padding: 10,
    }),
  };

  const DropdownIndicator = props => {
    return (
      <components.DropdownIndicator {...props}>
        <span>🔍</span>
      </components.DropdownIndicator>
    );
  };

  return (
    <div className="search-container">
      <div className="search-bar">
        <Select
          options={options}
          onChange={handleChange}
          onInputChange={(value) => setInputValue(value)}
          inputValue={inputValue}
          placeholder="Search by name or language..."
          isClearable
          menuIsOpen={inputValue.length > 0}
          components={{ DropdownIndicator }}
          styles={customStyles}
        />
      </div>
    </div>
  );
};

export default Search;
