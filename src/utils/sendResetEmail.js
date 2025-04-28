import axios from 'axios';

export const sendResetEmail = async (email, username, resetLink) => {
  console.log("send reset email util")
  console.log("request::", {email, username, resetLink})
  try {
    const response = await axios.post('https://email-service-latest-ps53.onrender.com/api/send-reset-email', {
      to: email,
      username,
      resetLink
    });
    return response.data;
  } catch (error) {
    console.error('Error sending reset email:', error?.response?.data || error.message);
    throw new Error('Failed to send password reset email');
  }
};
