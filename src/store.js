import { configureStore } from '@reduxjs/toolkit';
import authRedirectPathReducer from './reduxStates/authRedirectPathSlice';
import atPathReducer from './reduxStates/atPathSlice';

const store = configureStore({
  reducer: {
    authRedirectPath: authRedirectPathReducer,
    atPath: atPathReducer,
  }
});

export default store;