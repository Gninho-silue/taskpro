import axios from 'axios';

const API_URL = 'http://localhost:8081/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour déballer SuccessResponse { data, message, code, timestamp }
api.interceptors.response.use(
  (response) => {
    const maybeEnvelope = response?.data;
    if (
      maybeEnvelope &&
      typeof maybeEnvelope === 'object' &&
      'data' in maybeEnvelope &&
      'timestamp' in maybeEnvelope &&
      'code' in maybeEnvelope
    ) {
      // Réécrit response.data pour retourner directement le contenu utile
      // Exemple: PageResponse, entité, valeur primitive...
      // eslint-disable-next-line no-param-reassign
      response.data = maybeEnvelope.data;
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;