import React, { useEffect, useState } from 'react';
import { fetchPopularRepositories } from '../services/githubService';
import RepositoryCategory from './RepositoryCategory';

const RepositoryList = () => {
  const [repositories, setRepositories] = useState([]);
  const [categories, setCategories] = useState({});
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const repos = await fetchPopularRepositories(10000, 30, page);
        setRepositories(prevRepos => {
          const newRepos = repos.filter(repo => !prevRepos.some(prevRepo => prevRepo.id === repo.id));
          return [...prevRepos, ...newRepos];
        });
      } catch (err) {
        setError(err.message);
      }
    };

    fetchRepos();
  }, [page]);

  useEffect(() => {
    const categorizeRepositories = (repos) => {
      const categories = {
        frontend: [],
        backend: [],
        devops: [],
        dataScience: [],
      };

      repos.forEach(repo => {
        if (repo.language === 'JavaScript' || repo.language === 'TypeScript') {
          categories.frontend.push(repo);
        } else if (repo.language === 'Python' || repo.language === 'Java') {
          categories.backend.push(repo);
        } else if (repo.topics.includes('devops')) {
          categories.devops.push(repo);
        } else if (repo.topics.includes('data-science')) {
          categories.dataScience.push(repo);
        }
      });

      return categories;
    };

    setCategories(categorizeRepositories(repositories));
  }, [repositories]);

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  return (
    <div>
      <h1>Popular Repositories</h1>
      {error ? (
        <p>{error}</p>
      ) : (
        Object.keys(categories).map(category => (
          <RepositoryCategory key={category} category={category} repositories={categories[category]} />
        ))
      )}
      <button onClick={loadMore}>Load More</button>
    </div>
  );
};

export default RepositoryList;
