const axios = require('axios');
const axiosRetry = require('axios-retry').default;

const axiosInstance = axios.create({
  baseURL: 'https://api.openai.com/v1/',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  },
});

// Retry logic
axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
});

module.exports = axiosInstance;
