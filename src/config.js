import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://backend-d6mx.vercel.app";

// Note: We use token-based auth via Authorization header, not cookies
// axios.defaults.withCredentials is NOT set to allow CORS with wildcard origin

export default API_BASE_URL;
