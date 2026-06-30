import axios from 'axios';

const API_URL = 'https://leadscorer-ai.onrender.com';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config)=>{
    const token=localStorage.getItem('access_token');
    if(token) {
      config.headers.Authorization=`Bearer ${token}`;
    }
    return config;
  },
  (error)=>Promise.reject(error)
);

export default api;