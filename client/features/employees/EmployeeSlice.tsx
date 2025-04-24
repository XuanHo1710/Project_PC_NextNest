import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../config/configError';
const API_ROUTE = "employee";

interface Employee {
    avatar: string;
    name: string;
    email: string;
    age: number;
    address: string;
    gender: string;
    role: string;
    _id?: string;
}

interface EmployeeState {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  status: string
}

const initialState: EmployeeState = {
  employees: [],
  loading: false,
  error: null,
  status: ""
};

// thunk để gọi API
export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (queryParams: string) => {
    const response = await axios.get(API_ROUTE + queryParams)
    const data = await response.data;
    return data;
  }
);

export const fetchAddEmployee = createAsyncThunk(
    'employees/fetchAddEmployee',
    async (employee : Employee) => {
      const response = await axios.post(API_ROUTE, employee)
      const data = await response.data;
      
      return data;
    }
);

export const fetchDeleteEmployee = createAsyncThunk(
  'employees/fetchDeleteEmployee',
  async (_id:string) => {
    const response = await axios.delete(API_ROUTE + "/" + _id)
    const data = await response.data;
    return data;
  }
);

export const fetchUpdateEmployee = createAsyncThunk(
  'employees/fetchUpdateEmployee',
  async (employee : Employee) => {
    const response = await axios.patch(API_ROUTE + "/" + employee._id, employee)
    const data = await response.data;
    return data;
  }
);


const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
    // Get all list employees
      .addCase(fetchEmployees.pending, state => {
        state.loading = true;
        state.error = null;
        state.status = "pending";
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
        state.status = "success";
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
        state.status = "error";
      })

      // Add employee
      .addCase(fetchAddEmployee.pending, state => {
        state.loading = true;
        state.error = null;
        state.status = "pending";
      })
      .addCase(fetchAddEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
        state.status = "success";
      })
      .addCase(fetchAddEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
        state.status = "pending";
      })

      // Delete employee
      .addCase(fetchDeleteEmployee.pending, state => {
        state.loading = true;
        state.error = null;
        state.status = "pending";
      })
      .addCase(fetchDeleteEmployee.fulfilled, (state) => {
        state.loading = false;
        state.status = "success";
      })
      .addCase(fetchDeleteEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
        state.status = "pending";
      })

       // Update employee
       .addCase(fetchUpdateEmployee.pending, state => {
        state.loading = true;
        state.error = null;
        state.status = "pending";
      })
      .addCase(fetchUpdateEmployee.fulfilled, (state) => {
        state.loading = false;
        state.status = "success";
      })
      .addCase(fetchUpdateEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
        state.status = "pending";
      });
  }
});

export default employeeSlice.reducer;
