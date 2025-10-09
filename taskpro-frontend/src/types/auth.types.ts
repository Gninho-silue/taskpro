export interface User {
    id: number;
    username?: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profileImage?: string;
    role?: UserRole;
    preferredLanguage?: string;
    createdAt?: string;
    updatedAt?: string;
}

export enum UserRole {
    USER = 'USER',
    TEAM_LEADER = 'TEAM_LEADER',
    ADMIN = 'ADMIN'
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    preferredLanguage?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}