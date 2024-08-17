import { configureStore } from '@reduxjs/toolkit';
import authRedirectPathReducer from './reduxStates/authRedirectPathSlice';

const store = configureStore({
  reducer: {
    authRedirectPath: authRedirectPathReducer
  }
});

export default store;