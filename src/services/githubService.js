import axios from 'axios';
import { Octokit } from '@octokit/rest';


const GITHUB_API_BASE_URL  = process.env.REACT_APP_API_URL || 'https://api.github.com';

// other code using baseUrl

const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN;
//const logger = require('./logger'); // Import the logger

let cache = {};
let requestCount = 0;
const MAX_REQUESTS_PER_HOUR = 200;//5000;

const octokit = new Octokit({
  auth: GITHUB_TOKEN
});

const logRequest = (url, params) => {
  //logger.info(`Request made to ${url} with params: ${JSON.stringify(params)}`);
};

export const fetchPopularRepositories = async (starsThreshold = 10000, perPage = 200, page = 1) => {
  const cacheKey = `popularRepos:${starsThreshold}:${perPage}:${page}`;
  if (cache[cacheKey]) {
    console.log('Returning cached data for', cacheKey);
    return cache[cacheKey];
  }

  if (requestCount >= MAX_REQUESTS_PER_HOUR) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  try {
    

    const url = `${GITHUB_API_BASE_URL}/search/repositories`;
    



    console.log(`Fetching popular repositories: page ${page}`);
    const response = await axios.get(`${GITHUB_API_BASE_URL}/search/repositories`, {
      params: {
        q: `stars:>${starsThreshold}`,
        sort: 'stars',
        order: 'desc',
        per_page: 200,
        page: 1,
      },
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
      },
    });

    incrementRequestCount();

    const rateLimit = response.headers['x-ratelimit-limit'];
    const rateLimitRemaining = response.headers['x-ratelimit-remaining'];
    const rateLimitReset = response.headers['x-ratelimit-reset'];

    console.log(`Rate Limit: ${rateLimit}`);
    console.log(`Rate Limit Remaining: ${rateLimitRemaining}`);
    console.log(`Rate Limit Reset: ${new Date(rateLimitReset * 1000).toLocaleString()}`);

    if (rateLimitRemaining === 0) {
      console.warn('Rate limit exceeded. Please wait until it resets.');
    }

    return response.data.items;
    const repos = response.data.items;

    // Fetch topics for each repository
    /*const reposWithTopics = await Promise.all(repos.map(async repo => {
      try {
        
        const topicsUrl = `${GITHUB_API_BASE_URL}/repos/${repo.owner.login}/${repo.name}/topics`;
        const topicsParams = {};

        logRequest(topicsUrl, topicsParams); // Log the topics request
        
        const topicsResponse = await axios.get(`${GITHUB_API_BASE_URL}/repos/${repo.owner.login}/${repo.name}/topics`, {
          headers: {
            Accept: 'application/vnd.github.mercy-preview+json',
            Authorization: `token ${GITHUB_TOKEN}`
          }
        });

        if (topicsResponse && topicsResponse.data) {
          repo.topics = topicsResponse.data.names;
          console.log(topicsResponse.data);
        } else {
          console.error(`Invalid response for ${repo.full_name}:`, topicsResponse);
          repo.topics = [];
        }
      } catch (error) {
        console.error(`Error fetching topics for ${repo.full_name}:`, error);
        repo.topics = [];
      }
      return repo;
    }));

    cache[cacheKey] = reposWithTopics;
    console.log('Fetched repositories with topics:', reposWithTopics);*/
    return reposWithTopics;
  } catch (error) {
    console.error('Error fetching repositories:', error);
    return [];
  }
};

const incrementRequestCount = () => {
  requestCount++;
  if (requestCount >= MAX_REQUESTS_PER_HOUR) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }
};

export const fetchReleases = async (repoFullName) => {
  const cacheKey = `releases:${repoFullName}`;
  if (cache[cacheKey]) {
    console.log('Returning cached data for', cacheKey);
    return cache[cacheKey];
  }

  if (requestCount >= MAX_REQUESTS_PER_HOUR) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  try {
    console.log(`Fetching releases for ${repoFullName}`);
    const response = await axios.get(`${GITHUB_API_BASE_URL}/repos/${repoFullName}/releases`, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`
      }
    });

    requestCount++;
    cache[cacheKey] = response.data;
    console.log('Fetched releases:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching releases:', error);
    return [];
  }
};

export const fetchCommitEmails = async (owner, repo, releaseTag) => {
  try {
    let commits;

    if (releaseTag) {
      // Fetch commits associated with the release
      const { data: release } = await octokit.repos.getReleaseByTag({
        owner,
        repo,
        tag: releaseTag,
      });

      const base = release.target_commitish;
      const { data: compare } = await octokit.repos.compareCommits({
        owner,
        repo,
        base,
        head: releaseTag,
      });

      commits = compare.commits;
    } else {
      // Fetch the latest commits
      const { data } = await octokit.repos.listCommits({
        owner,
        repo,
        per_page: 30, // Adjust the number of commits to fetch per page
      });
      commits = data;
    }

    return commits.map(commit => ({
      sha: commit.sha,
      author: commit.commit.author.name,
      email: commit.commit.author.email,
      message: commit.commit.message,
    }));
  } catch (error) {
    console.error('Error fetching commit emails:', error);
    return [];
  }
};


export const fetchRepositoryDetails = async (owner, repo) => {
  try {
    const { data } = await octokit.repos.get({
      owner,
      repo,
    });
    return data;
  } catch (error) {
    console.error('Error fetching repository details:', error);
    return null;
  }
};

export const filterRepositories = (repositories, language, topics) => {
  return repositories.filter(repo => {
    const matchesLanguage = language ? repo.language === language : true;
    const matchesTopics = topics ? topics.every(topic => repo.topics.includes(topic)) : true;
    return matchesLanguage && matchesTopics;
  });
};
