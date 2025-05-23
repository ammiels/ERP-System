// Simple utility to test API connectivity
import axios from 'axios';
import { REQUESTS_API_URL } from '../config.js';

// Function to test API connectivity
export async function testRequestsApi(token) {
  console.log('Testing connection to Requests API at:', REQUESTS_API_URL);
  
  try {
    const response = await axios.get(`${REQUESTS_API_URL}/requests/pending`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Connection successful!', response.status);
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received');
    }
    return false;
  }
}
