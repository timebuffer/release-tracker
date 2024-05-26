import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchRepositoryDetails } from '../services/githubService';

const RepositoryDetail = () => {
  const { owner, repo } = useParams();
  const [repository, setRepository] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepoDetails = async () => {
      setLoading(true);
      const repoDetails = await fetchRepositoryDetails(owner, repo);
      setRepository(repoDetails);
      setLoading(false);
    };

    fetchRepoDetails();
  }, [owner, repo]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!repository) {
    return <div>Repository not found</div>;
  }

  return (
    <div>
      <h2>{repository.name}</h2>
      <p>{repository.description}</p>
      <p>Stars: {repository.stargazers_count}</p>
      <p>Forks: {repository.forks_count}</p>
      <p>Open Issues: {repository.open_issues_count}</p>
      <p>Language: {repository.language}</p>
      {/* Add more details as needed */}
    </div>
  );
};

export default RepositoryDetail;

