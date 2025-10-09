export interface Notification {
    id: number;
    message: string;
    type: NotificationType;
    read: boolean;
    userId?: number;
    taskId?: number;
    taskTitle?: string;
    projectId?: number;
    projectName?: string;
    // Backend envoie 'sentAt'. On garde 'createdAt' pour compat mais on ajoute 'sentAt'.
    createdAt?: string;
    sentAt?: string;
}

export enum NotificationType {
    TASK_ASSIGNED = 'TASK_ASSIGNED',
    TASK_COMMENTED = 'TASK_COMMENTED',
    TASK_COMPLETED = 'TASK_COMPLETED',
    TASK_STATUS_CHANGED = 'TASK_STATUS_CHANGED',
    TASK_DUE_SOON = 'TASK_DUE_SOON',
    PROJECT_INVITATION = 'PROJECT_INVITATION',
    TEAM_INVITATION = 'TEAM_INVITATION',
    GENERAL = 'GENERAL'
}
