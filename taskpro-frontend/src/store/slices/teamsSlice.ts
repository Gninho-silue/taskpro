import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Team } from '../../types';
import api from '../../services/api.ts';

interface TeamsState {
  teams: Team[];
  currentTeam: Team | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TeamsState = {
  teams: [],
  currentTeam: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchTeams = createAsyncThunk(
  'teams/fetchTeams',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/teams');
      return response.data.content;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch teams');
    }
  }
);

export const fetchTeamById = createAsyncThunk(
  'teams/fetchTeamById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/teams/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch team');
    }
  }
);

export const createTeam = createAsyncThunk(
  'teams/createTeam',
  async (teamData: Partial<Team>, { rejectWithValue }) => {
    try {
      const response = await api.post('/teams', teamData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create team');
    }
  }
);

export const updateTeam = createAsyncThunk(
  'teams/updateTeam',
  async ({ id, teamData }: { id: number; teamData: Partial<Team> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/teams/${id}`, teamData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update team');
    }
  }
);

export const deleteTeam = createAsyncThunk(
  'teams/deleteTeam',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/teams/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete team');
    }
  }
);

export const addTeamMember = createAsyncThunk(
  'teams/addTeamMember',
  async ({ teamId, userId }: { teamId: number; userId: number }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/teams/${teamId}/members/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add member to team');
    }
  }
);

export const removeTeamMember = createAsyncThunk(
  'teams/removeTeamMember',
  async ({ teamId, userId }: { teamId: number; userId: number }, { rejectWithValue }) => {
    try {
      await api.delete(`/teams/${teamId}/members/${userId}`);
      return { teamId, userId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove member from team');
    }
  }
);

// Slice
const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    clearCurrentTeam: (state) => {
      state.currentTeam = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch teams
      .addCase(fetchTeams.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action: PayloadAction<Team[]>) => {
        state.isLoading = false;
        state.teams = action.payload;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch team by id
      .addCase(fetchTeamById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeamById.fulfilled, (state, action: PayloadAction<Team>) => {
        state.isLoading = false;
        state.currentTeam = action.payload;
      })
      .addCase(fetchTeamById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create team
      .addCase(createTeam.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTeam.fulfilled, (state, action: PayloadAction<Team>) => {
        state.isLoading = false;
        state.teams.push(action.payload);
        state.currentTeam = action.payload;
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update team
      .addCase(updateTeam.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTeam.fulfilled, (state, action: PayloadAction<Team>) => {
        state.isLoading = false;
        const index = state.teams.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.teams[index] = action.payload;
        }
        if (state.currentTeam?.id === action.payload.id) {
          state.currentTeam = action.payload;
        }
      })
      .addCase(updateTeam.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete team
      .addCase(deleteTeam.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTeam.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false;
        state.teams = state.teams.filter(t => t.id !== action.payload);
        if (state.currentTeam?.id === action.payload) {
          state.currentTeam = null;
        }
      })
      .addCase(deleteTeam.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Add team member
      .addCase(addTeamMember.fulfilled, (state, action: PayloadAction<Team>) => {
        const index = state.teams.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.teams[index] = action.payload;
        }
        if (state.currentTeam?.id === action.payload.id) {
          state.currentTeam = action.payload;
        }
      })
      
      // Remove team member
      .addCase(removeTeamMember.fulfilled, (state, action: PayloadAction<{ teamId: number; userId: number }>) => {
        const { teamId, userId } = action.payload;
        const teamIndex = state.teams.findIndex(t => t.id === teamId);
        
        if (teamIndex !== -1) {
          // Remove the user from the team's members array
          state.teams[teamIndex].members = state.teams[teamIndex].members.filter(
            member => member.id !== userId
          );
          
          // Update current team if it's the same team
          if (state.currentTeam?.id === teamId) {
            state.currentTeam = state.teams[teamIndex];
          }
        }
      });
  },
});

export const { clearCurrentTeam, clearError } = teamsSlice.actions;
export default teamsSlice.reducer;