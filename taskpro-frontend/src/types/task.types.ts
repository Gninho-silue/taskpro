export interface Task {
    id: number;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string;
    estimatedHours?: number;
    actualHours?: number;
    projectId: number;
    projectName: string;
    creatorId: number;
    creatorName: string;
    assigneeId?: number;
    assigneeName?: string;
    parentTaskId?: number;
    subtaskIds: number[];
    labelIds: number[];
    labels?: Label[];
    attachmentIds: number[];
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
    CRITICAL = 'CRITICAL'
}

export interface CreateTaskData {
    title: string;
    description?: string;
    priority?: TaskPriority;
    dueDate?: string;
    estimatedHours?: number;
    assigneeId?: number;
    parentTaskId?: number;
    labelIds?: number[];
}

export interface UpdateTaskData {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string;
    estimatedHours?: number;
    actualHours?: number;
    assigneeId?: number;
}

export interface Label {
    id: number;
    name: string;
    color: string;
    projectId?: number;
}