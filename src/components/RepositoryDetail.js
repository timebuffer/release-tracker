import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchRepositoryDetails, fetchPopularRepositories } from '../services/githubService';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as tf from '@tensorflow/tfjs';
//import { logger } from '../utils/logger'; // Adjust the path as necessary


const RepositoryDetail = ({ repositories }) => {
  const { owner, repo } = useParams();
  const [repository, setRepository] = useState(null);
  const [similarRepositories, setSimilarRepositories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepoDetails = async () => {
      const repoDetails = await fetchRepositoryDetails(owner, repo);
      setRepository(repoDetails);
      findSimilarRepositories(repoDetails);
    };

    fetchRepoDetails();
  }, [owner, repo]);

  const findSimilarRepositories = async (currentRepo) => {
    try{
      if (!currentRepo || !currentRepo.description) {
        //logger.error('Current repository is not valid:', currentRepo);
        setLoading(false);
        return;
      }
    
    const allRepositories = repositories;//await fetchPopularRepositories();
    const currentRepoText = currentRepo.description + ' ' + (currentRepo.topics || []).join(' ');

    console.log(currentRepo.description);

    const model = await use.load();
    const sentences = allRepositories.map(repo => repo.description + ' ' + (repo.topics || []).join(' '));
    console.log(allRepositories[0].description);
    console.log(allRepositories[1].description);
    console.log("allRepositories[0].description");
    const currentRepoEmbedding = await model.embed([currentRepoText]);
    const embeddings = await model.embed(sentences);

    const similarities = [];
    for (let i = 0; i < allRepositories.length; i++) {
      const similarity = tf.losses.cosineDistance(currentRepoEmbedding, embeddings.slice([i, 0], [1, -1]), 1).dataSync();
      similarities.push({ repo: allRepositories[i], similarity });
    }

    similarities.sort((a, b) => a.similarity - b.similarity);
    setSimilarRepositories(similarities.slice(0, 30).map(s => s.repo));
    setLoading(false);
  }catch(error){
    //logger.error('Error finding similar repositories:', error);
  }
  };

  if (!repository) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{repository.name}</h2>
      <p>{repository.description}</p>
      <p>Stars: {repository.stargazers_count}</p>
      <p>Forks: {repository.forks_count}</p>
      <p>Open Issues: {repository.open_issues_count}</p>
      <p>Language: {repository.language}</p>
      <h3>Similar Repositories</h3>
      {loading ? (
          <div>Loading similar repositories...</div>
        ) : (
      <ul>
        
        {similarRepositories.map(repo => (
          <li key={repo.id}>
            <a href={`/repository/${repo.owner.login}/${repo.name}`}>{repo.name}</a> - {repo.description}
          </li>
        ))}
      
      </ul>)}
    </div>
  );
};

export default RepositoryDetail;

