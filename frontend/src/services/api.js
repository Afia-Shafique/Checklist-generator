import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL || '';


const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadDocument = async (formData, region = 'saudi') => {
  try {
    const response = await api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: {
        region: region
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


// New backend call: expects a FormData object with file, region, and codebook_ids[]
export const matchSectionsWithCodebooks = async (formData) => {
  try {
    const response = await api.post('/api/match', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default api;