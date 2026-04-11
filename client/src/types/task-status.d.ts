export interface TaskStatus {
  id: string;
  title: string;
  position: number;
  isComplete: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
