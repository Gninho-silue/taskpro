export interface Team {
    id: number;
    name: string;
    description?: string;
    leaderId: number;
    leaderName: string;
    memberIds: number[];
    projectIds: number[];
    createdAt: string;
    updatedAt: string;
}
