import axios from 'axios';
import {redirect} from 'next/navigation';

const checkAuth = async (logState) => {
  const token = localStorage.getItem('token');
  if(logState == 'in'){
  if (!token) {
    redirect('/login');
    return false;
  }

  try {
    const res = await axios.post('/api/verifytoken', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return true;
  } catch (e) { 
    const authErrors = ['Unauthorised user', 'Invalid token', 'No user found', 'Password changed']
    if (authErrors.includes(e.response?.data?.message)) {
      localStorage.removeItem('token')
      redirect('/login');
    }
    return false;
  }
  }else if('out'){
  if (token) {
    redirect('/home');
    return false;
  }
  }
};

export default checkAuth;