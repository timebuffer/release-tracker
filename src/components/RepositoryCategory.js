import React, { useState }  from 'react';
import RepositoryReleases from './RepositoryReleases';
import CommitList from './CommitList';

const RepositoryCategory = ({ category, repositories }) => {

  const [selectedRepo, setSelectedRepo] = useState(null);

  const handleRepoClick = (repo) => {
    setSelectedRepo(repo);
  };


  return (
    <div>
      <h2>{category}</h2>
      <ul>
        {repositories.map(repo => (
          <li key={repo.id}>
            
            <strong onClick={() => handleRepoClick(repo)} style={{ cursor: 'pointer' }}>{repo.name}</strong> - {repo.description}
            <RepositoryReleases repoFullName={repo.full_name} />
            <CommitList owner={repo.owner.login} repo={repo.name} />
            {selectedRepo && selectedRepo.id === repo.id && (
              <CommitList owner={repo.owner.login} repo={repo.name} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RepositoryCategory;
