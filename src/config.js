import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8031";

// Create axios instance with base URL
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true // This is crucial for cookies to be sent/received
});

// Response interceptor for handling errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401/403 errors (unauthorized) - redirect to login if needed
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Clear any cached user data (but NOT cookies - server handles those)
            localStorage.removeItem('vendorUser');
        }
        return Promise.reject(error);
    }
);

// Export the API_BASE_URL and axios instance
export { api };
export default API_BASE_URL;
