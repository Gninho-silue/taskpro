export interface ApiResponse<T> {
  code: number;
  message: string;
  timestamp: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface UserBasicDTO {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}

export interface UserDetailDTO extends UserBasicDTO {
  projects: ProjectBasicDTO[];
  teams: TeamBasicDTO[];
  assignedTasks: TaskBasicDTO[];
}

export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

export interface ProjectBasicDTO {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  dueDate: string;
}

export interface ProjectDetailDTO extends ProjectBasicDTO {
  owner: UserBasicDTO;
  team: TeamBasicDTO;
  members: UserBasicDTO[];
  tasks: TaskBasicDTO[];
  labels: LabelBasicDTO[];
}

export interface ProjectCreateDTO {
  name: string;
  description?: string;
  startDate?: string;
  dueDate?: string;
  teamId?: number;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'ARCHIVED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TaskBasicDTO {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
}

export interface CommentBasicDTO {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: UserBasicDTO;
}

export interface TaskAttachmentBasicDTO {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface LabelBasicDTO {
  id: number;
  name: string;
  color: string;
}

export interface TaskDetailDTO extends TaskBasicDTO {
  creator: UserBasicDTO;
  assignee: UserBasicDTO;
  parentTaskId: number;
  project: ProjectBasicDTO[];
  subtasks: TaskBasicDTO[];
  labels: LabelBasicDTO[];
  comments: CommentBasicDTO[];
  attachments: TaskAttachmentBasicDTO[];
}

export interface TaskCreateDTO {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  estimatedHours?: number;
  parentTaskId?: number;
  assigneeId?: number;
  projectId: number;
  labelIds?: number[];
}

export interface TeamBasicDTO {
  id: number;
  name: string;
  description: string;
}

export interface TeamDetailDTO extends TeamBasicDTO {
  leader: UserBasicDTO;
  members: UserBasicDTO[];
  projects: ProjectBasicDTO[];
}

export interface TeamCreateDTO {
  name: string;
  description?: string;
  leaderId: number;
  memberIds?: number[];
}

export interface CommentDetailDTO extends CommentBasicDTO {
  taskId: number;
  parentCommentId: number;
  replies: CommentBasicDTO[];
}

export interface CommentCreateDTO {
  content: string;
  taskId: number;
  parentCommentId?: number;
}

export interface LabelCreateDTO {
  name: string;
  color: string;
  projectId: number;
}

export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_COMMENTED'
  | 'TASK_STATUS_CHANGED'
  | 'TASK_DUE_SOON'
  | 'PROJECT_INVITATION'
  | 'TEAM_INVITATION'
  | 'GENERAL';

export interface NotificationBasicDTO {
  id: number;
  message: string;
  type: NotificationType;
  read: boolean;
  sentAt: string;
}

export interface NotificationDetailDTO extends NotificationBasicDTO {
  user: UserBasicDTO;
  relatedTask: TaskBasicDTO;
  relatedProject: ProjectBasicDTO;
}

export interface NotificationCreateDTO {
  message: string;
  type?: NotificationType;
  recipientUserId: number;
  relatedTaskId?: number;
  relatedProjectId?: number;
}

export interface NotificationWSDTO {
  id: number;
  message: string;
  sentAt: string;
  type: NotificationType;
  userId: number;
  taskId: number;
  projectId: number;
  taskTitle: string;
  projectName: string;
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
  dateOfBirth?: string;
}
