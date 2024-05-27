import axios from 'axios';
import { Octokit } from '@octokit/rest';

const GITHUB_API_BASE_URL = 'https://api.github.com';
const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN;

let cache = {};
let requestCount = 0;
const MAX_REQUESTS_PER_HOUR = 300;//5000;

const octokit = new Octokit({
  auth: GITHUB_TOKEN
});

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
    console.log(`Fetching popular repositories: page ${page}`);
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
    const repos = response.data.items;

    // Fetch topics for each repository
    const reposWithTopics = await Promise.all(repos.map(async repo => {
      try {
        const topicsResponse = await axios.get(`${GITHUB_API_BASE_URL}/repos/${repo.owner.login}/${repo.name}/topics`, {
          headers: {
            Accept: 'application/vnd.github.mercy-preview+json',
            Authorization: `token ${GITHUB_TOKEN}`
          }
        });
        repo.topics = topicsResponse.data.names;
      } catch (error) {
        console.error(`Error fetching topics for ${repo.full_name}:`, error);
        repo.topics = [];
      }
      return repo;
    }));

    cache[cacheKey] = reposWithTopics;
    console.log('Fetched repositories with topics:', reposWithTopics);
    return reposWithTopics;
  } catch (error) {
    console.error('Error fetching repositories:', error);
    return [];
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
