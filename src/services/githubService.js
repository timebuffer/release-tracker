import axios from 'axios';

const GITHUB_API_BASE_URL = 'https://api.github.com';
const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN;

let cache = {};
let requestCount = 0;
const MAX_REQUESTS_PER_HOUR = 5000;

export const fetchPopularRepositories = async (starsThreshold = 10000, perPage = 30, page = 1) => {
  const cacheKey = `popularRepos:${starsThreshold}:${perPage}:${page}`;
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  if (requestCount >= MAX_REQUESTS_PER_HOUR) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  try {
    const response = await axios.get(`${GITHUB_API_BASE_URL}/search/repositories`, {
      params: {
        q: `stars:>${starsThreshold}`,
        sort: 'stars',
        order: 'desc',
        per_page: perPage,
        page: page,
      },
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`
      }
    });

    requestCount++;
    cache[cacheKey] = response.data.items;
    return response.data.items;
  } catch (error) {
    console.error('Error fetching repositories:', error);
    return [];
  }
};

export const fetchReleases = async (repoFullName) => {
  const cacheKey = `releases:${repoFullName}`;
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  if (requestCount >= MAX_REQUESTS_PER_HOUR) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  try {
    const response = await axios.get(`${GITHUB_API_BASE_URL}/repos/${repoFullName}/releases`, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`
      }
    });

    requestCount++;
    cache[cacheKey] = response.data;
    return response.data;
  } catch (error) {
    console.error('Error fetching releases:', error);
    return [];
  }
};

export const filterRepositories = (repositories, language, topics) => {
  return repositories.filter(repo => {
    const matchesLanguage = language ? repo.language === language : true;
    const matchesTopics = topics ? topics.every(topic => repo.topics.includes(topic)) : true;
    return matchesLanguage && matchesTopics;
  });
};
