import React from 'react';
import { useParams, Link } from 'react-router-dom';

const CategoryDetail = ({ repositories }) => {
  const { category } = useParams();
  const filteredRepos = repositories.filter(repo => repo.category === category);

  return (
    <div>
      <h2>Category: {category}</h2>
      <ul>
        {filteredRepos.map(repo => (
          <li key={repo.id}>
            <Link to={`/repository/${repo.owner.login}/${repo.name}`}>{repo.name}</Link> - {repo.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryDetail;
