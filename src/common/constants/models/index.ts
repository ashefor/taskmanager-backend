// export type taskStatus = 'BACKLOG' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
// export type taskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export enum TaskStatus {
  BACKLOG = 'BACKLOG',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}