import React from 'react';
import RepositoryReleases from './RepositoryReleases';

const RepositoryCategory = ({ category, repositories }) => {
  return (
    <div>
      <h2>{category}</h2>
      <ul>
        {repositories.map(repo => (
          <li key={repo.id}>
            <strong>{repo.name}</strong> - {repo.description}
            <RepositoryReleases repoFullName={repo.full_name} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RepositoryCategory;
