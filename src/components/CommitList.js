import React, { useEffect, useState } from 'react';
import { fetchCommitEmails } from '../services/githubService';

const CommitList = ({ owner, repo }) => {
  const [commits, setCommits] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        const commitData = await fetchCommitEmails(owner, repo);
        setCommits(commitData);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchCommits();
  }, [owner, repo]);

  return (
    <div>
      <h2>Commit List for {repo}</h2>
      {error && <p>Error: {error}</p>}
      <ul>
        {commits.map(commit => (
          <li key={commit.sha}>
            <strong>{commit.author}</strong> ({commit.email}): {commit.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommitList;
