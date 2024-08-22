import { createSlice } from '@reduxjs/toolkit';

const atPathSlice = createSlice({
  name: 'atPath',
  initialState: {
    value: 0
  },
  reducers: {
    resetAtPath: (state) => {
      state.value = 0;
    },
    modifyAtPath: (state, action) => {
      state.value = action.payload;
    }
  }
});

export const { resetAtPath, modifyAtPath } = atPathSlice.actions;

export default atPathSlice.reducer;