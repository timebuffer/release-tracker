import React, { useEffect, useState } from 'react';
import { fetchReleases } from '../services/githubService';

const RepositoryReleases = ({ repoFullName }) => {
  const [releases, setReleases] = useState([]);

  useEffect(() => {
    const getReleases = async () => {
      const releasesData = await fetchReleases(repoFullName);
      setReleases(releasesData);
    };

    getReleases();
  }, [repoFullName]);

  return (
    <div>
      <h3>Releases</h3>
      <ul>
        {releases.map(release => (
          <li key={release.id}>{release.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default RepositoryReleases;
