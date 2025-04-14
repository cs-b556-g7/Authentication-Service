import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export const verifyCaptcha = async (token) => {
  try {
    const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: token,
      },
    });

    return response.data.success;
  } catch (error) {
    console.error('CAPTCHA verification failed:', error);
    return false;
  }
};
