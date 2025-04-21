import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import employeeReducer from '../features/employees/EmployeeSlice';

export const store = configureStore({
  reducer: {
    employee: employeeReducer,
  },
});

// types cho TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
