import { createSlice } from '@reduxjs/toolkit';

const authRedirectPathSlice = createSlice({
  name: 'authRedirectPath',
  initialState: {
    value: ''
  },
  reducers: {
    dropPath: (state) => {
      state.value = '';
    },
    addPath: (state, action) => {
      state.value = action.payload;
    }
  }
});

export const { dropPath, addPath } = authRedirectPathSlice.actions;

export default authRedirectPathSlice.reducer;