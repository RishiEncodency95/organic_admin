import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

export interface HomeHero {
  _id?: string;
  img?: string;
  alt?: string;
  tagline?: string;
  titlePrimary?: string;
  titleSecondary?: string;
  subtitle?: string;
  description?: string;
  date?: string;
  location?: string;
  status?: string;
  button1Name?: string;
  button1Link?: string;
  button2Name?: string;
  button2Link?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface HomeHeroState {
  data: HomeHero[];
  loading: boolean;
  error: string | null;
}

const initialState: HomeHeroState = {
  data: [],
  loading: false,
  error: null,
};

const API_URL = "/website/home/home-hero";

export const fetchHomeHeros = createAsyncThunk('homeHero/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await api.get<HomeHero[]>(API_URL);
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch Home Hero data');
  }
});

export const createHomeHero = createAsyncThunk('homeHero/create', async (formData: FormData, { rejectWithValue }) => {
  try {
    return await api.postForm<HomeHero>(API_URL, formData);
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to create Home Hero');
  }
});

export const updateHomeHero = createAsyncThunk('homeHero/update', async ({ id, formData }: { id: string; formData: FormData }, { rejectWithValue }) => {
  try {
    return await api.putForm<HomeHero>(`${API_URL}/${id}`, formData);
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to update Home Hero');
  }
});

export const deleteHomeHero = createAsyncThunk('homeHero/delete', async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`${API_URL}/${id}`);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to delete Home Hero');
  }
});

const homeHeroSlice = createSlice({
  name: 'homeHero',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchHomeHeros.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHomeHeros.fulfilled, (state, action) => {
        state.loading = false;
        state.data = Array.isArray(action.payload) ? action.payload : (action.payload ? [action.payload] : []);
      })
      .addCase(fetchHomeHeros.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create
      .addCase(createHomeHero.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHomeHero.fulfilled, (state, action) => {
        state.loading = false;
        state.data.push(action.payload);
      })
      .addCase(createHomeHero.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update
      .addCase(updateHomeHero.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHomeHero.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.data.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(updateHomeHero.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete
      .addCase(deleteHomeHero.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteHomeHero.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter((item) => item._id !== action.payload);
      })
      .addCase(deleteHomeHero.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default homeHeroSlice.reducer;
