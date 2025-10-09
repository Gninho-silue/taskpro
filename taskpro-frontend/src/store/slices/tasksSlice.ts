import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task, TaskStatus } from '../../types/task.types';
import api from '../../services/api';

// Services inline minimalistes
async function getTasksByProject(projectId: number): Promise<Task[]> {
  const { data } = await api.get(`/tasks/project/${projectId}`);
  // data = PageResponse<TaskBasicDTO> → adapter ici si nécessaire
  return (data.content ?? data) as Task[];
}

async function createTaskApi(projectId: number, taskData: Partial<Task>): Promise<Task> {
  const { data } = await api.post('/tasks', { ...taskData, projectId });
  return data as Task;
}

async function updateTaskApi(taskId: number, taskData: Partial<Task>): Promise<Task> {
  const { data } = await api.patch(`/tasks/${taskId}`, taskData);
  return data as Task;
}

async function updateTaskStatusApi(taskId: number, status: TaskStatus): Promise<Task> {
  const { data } = await api.put(`/tasks/${taskId}/status`, null, { params: { status } });
  return data as Task;
}

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status: TaskStatus | 'ALL';
    assignee: string | 'ALL';
    priority: string | 'ALL';
  };
}

const initialState: TaskState = {
  tasks: [],
  currentTask: null,
  isLoading: false,
  error: null,
  filters: {
    status: 'ALL',
    assignee: 'ALL',
    priority: 'ALL',
  },
};

// Async thunks
export const fetchTasks = createAsyncThunk(
    'tasks/fetchTasks',
    async (projectId: number, { rejectWithValue }) => {
      try {
        return await getTasksByProject(projectId);
      } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
      }
    }
);

export const createTask = createAsyncThunk(
    'tasks/createTask',
    async ({ projectId, taskData }: { projectId: number; taskData: Partial<Task> }, { rejectWithValue }) => {
      try {
        return await createTaskApi(projectId, taskData);
      } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to create task');
      }
    }
);

export const updateTask = createAsyncThunk(
    'tasks/updateTask',
    async ({ taskId, taskData }: { taskId: number; taskData: Partial<Task> }, { rejectWithValue }) => {
      try {
        return await updateTaskApi(taskId, taskData);
      } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update task');
      }
    }
);

export const updateTaskStatus = createAsyncThunk(
    'tasks/updateTaskStatus',
    async ({ taskId, status }: { taskId: number; status: TaskStatus }, { rejectWithValue }) => {
      try {
        return await updateTaskStatusApi(taskId, status);
      } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update task status');
      }
    }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setCurrentTask: (state, action: PayloadAction<Task | null>) => {
      state.currentTask = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<Partial<TaskState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    // Pour le drag & drop optimiste
    optimisticallyMoveTask: (state, action: PayloadAction<{ taskId: number; newStatus: TaskStatus }>) => {
      const task = state.tasks.find(t => t.id === action.payload.taskId);
      if (task) {
        task.status = action.payload.newStatus;
      }
    },
  },
  extraReducers: (builder) => {
    builder
        // Fetch tasks
        .addCase(fetchTasks.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(fetchTasks.fulfilled, (state, action) => {
          state.isLoading = false;
          state.tasks = action.payload;
        })
        .addCase(fetchTasks.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload as string;
        })
        // Create task
        .addCase(createTask.fulfilled, (state, action) => {
          state.tasks.push(action.payload);
        })
        // Update task
        .addCase(updateTask.fulfilled, (state, action) => {
          const index = state.tasks.findIndex(t => t.id === action.payload.id);
          if (index !== -1) {
            state.tasks[index] = action.payload;
          }
        })
        // Update task status
        .addCase(updateTaskStatus.fulfilled, (state, action) => {
          const index = state.tasks.findIndex(t => t.id === action.payload.id);
          if (index !== -1) {
            state.tasks[index] = action.payload;
          }
        });
  },
});

export const { setCurrentTask, clearError, setFilters, optimisticallyMoveTask } = taskSlice.actions;
export default taskSlice.reducer;