import { User } from './auth.types';
import { Team } from './team.types';
import { Task, Label } from './task.types';

// Basic Project (from ProjectBasicDTO)
export interface ProjectBasic {
  id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate?: string;
  dueDate?: string;
}

// Detailed Project (from ProjectDetailDTO)
export interface Project extends ProjectBasic {
  owner?: User;
  team?: Team;
  members?: User[];
  tasks?: Task[];
  labels?: Label[];
}

// Project Status (same as backend)
export enum ProjectStatus {
    PLANNING = 'PLANNING',
    IN_PROGRESS = 'IN_PROGRESS',
    ON_HOLD = 'ON_HOLD',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
  }

// Create Project Data
export interface CreateProjectData {
  name: string;
  description?: string;
  startDate?: string;
  dueDate?: string;
  teamId?: number;
}

// Update Project Data
export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string;
  dueDate?: string;
}

// Project State for Redux
export interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
}