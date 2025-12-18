import axios from 'axios';
import { RecommendResponse } from './types';

// Change this when deploying
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const getRecommendations = async (query: string): Promise<RecommendResponse> => {
    const response = await axios.post(`${API_URL}/recommend`, { query });
    return response.data;
};

export const checkHealth = async (): Promise<{ status: string }> => {
    const response = await axios.get(`${API_URL}/health`);
    return response.data;
};
