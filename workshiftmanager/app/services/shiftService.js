import axios from 'axios';
import api from './api';

const API_URL = 'http://localhost:3001/shifts';

export const addShift = async (shiftData) => {
  try {
    const response = await axios.post(API_URL, shiftData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response;
  } catch (error) {
    console.error('Error adding shift:', error);
    throw error;
  }
};


export const getAllShifts = async () => {
    try {
      const response = await api.get('/shifts');
      console.log('Shifts:', response.data);
      return response;
    } catch (error) {
      console.error('Error getting shifts:', error);
      throw error;
    }
  };
  

  export const deleteShift = async (shiftId) => {
    try {
    const response = await api.delete(`/shifts/${shiftId}`);
    return response
    //   console.log('Shift deleted successfully');
    } catch (error) {
      console.error('Error deleting shift:', error);
      throw error;
    }
  };