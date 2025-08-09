// User types
export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  profileImage?: string;
  dateOfBirth?: string;
  preferredLanguage: string;
  role: UserRole;
  lastLogin?: string;
}

export enum UserRole {
  USER = 'USER',
  TEAM_LEADER = 'TEAM_LEADER',
  ADMIN = 'ADMIN'
}

// Project types
export interface Project {
  id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate?: string;
  dueDate?: string;
  archived: boolean;
  owner: User;
  members: User[];
  team?: Team;
  createdAt: string;
  updatedAt: string;
}

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Task types
export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  completedAt?: string;
  project: Project;
  creator: User;
  assignee?: User;
  comments: Comment[];
  attachments: TaskAttachment[];
  labels: Label[];
  parentTask?: Task;
  subtasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// Team types
export interface Team {
  id: number;
  name: string;
  description?: string;
  leader: User;
  members: User[];
  projects: Project[];
  createdAt: string;
  updatedAt: string;
}

// Comment types
export interface Comment {
  id: number;
  content: string;
  task: Task;
  user: User;
  createdAt: string;
  updatedAt: string;
}

// TaskAttachment types
export interface TaskAttachment {
  id: number;
  filename: string;
  originalFilename: string;
  fileType: string;
  fileSize: number;
  task: Task;
  uploadedBy: User;
  createdAt: string;
  updatedAt: string;
}

// Label types
export interface Label {
  id: number;
  name: string;
  color: string;
  project: Project;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

// Notification types
export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
  read: boolean;
  sentAt: string;
  user: User;
  relatedTask?: Task;
  relatedProject?: Project;
}

export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  TASK_COMMENT = 'TASK_COMMENT',
  PROJECT_INVITATION = 'PROJECT_INVITATION',
  TEAM_INVITATION = 'TEAM_INVITATION',
  SYSTEM = 'SYSTEM'
}

// Auth types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}