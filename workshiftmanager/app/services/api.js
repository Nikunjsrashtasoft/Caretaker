
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/', // Adjust this to your API's base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
