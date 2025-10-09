import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UiState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  currentView: 'kanban' | 'list' | 'calendar'
  isLoading: boolean
  globalLoading: boolean
}

const initialState: UiState = {
  sidebarOpen: false,
  theme: 'light',
  currentView: 'kanban',
  isLoading: false,
  globalLoading: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
      localStorage.setItem('theme', action.payload)
    },
    setCurrentView: (state, action: PayloadAction<'kanban' | 'list' | 'calendar'>) => {
      state.currentView = action.payload
      localStorage.setItem('currentView', action.payload)
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload
    },
  },
})

export const { 
  toggleSidebar, 
  setSidebarOpen, 
  setTheme, 
  setCurrentView, 
  setLoading, 
  setGlobalLoading 
} = uiSlice.actions
export default uiSlice.reducer;