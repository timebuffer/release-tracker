import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';

const Search = ({ repositories }) => {
  const [options, setOptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const categories = new Set();
    const names = new Set();

    repositories.forEach(repo => {
      if (repo.category) categories.add(repo.category);
      if (repo.name) names.add(repo.name);
    });

    const categoryOptions = Array.from(categories).map(category => ({ label: category, value: category, type: 'category' }));
    const nameOptions = Array.from(names).map(name => ({ label: name, value: name, type: 'name' }));
    setOptions([...categoryOptions.slice(0, 5), ...nameOptions.slice(0, 5)]);
  }, [repositories]);

  const handleChange = (selectedOption) => {
    if (!selectedOption) return;

    if (selectedOption.type === 'category') {
      navigate(`/category/${selectedOption.value}`);
    } else if (selectedOption.type === 'name') {
      const selectedRepo = repositories.find(repo => repo.name === selectedOption.value);
      if (selectedRepo) {
        navigate(`/repository/${selectedRepo.owner.login}/${selectedRepo.name}`);
      }
    }
  };

  return (
    <Select
      options={options}
      onChange={handleChange}
      placeholder="Search by category or name..."
      isClearable
    />
  );
};

export default Search;
