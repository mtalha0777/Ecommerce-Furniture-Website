// Base URL of the API. Set REACT_APP_API_URL at build time for deployed environments.
export const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:3001').replace(/\/$/, '');
