export interface UserProfile {
  userId: string;
  name: string;
  gradeLevel?: number;
  createdAt: Date;
  preferences: {
    currency: string;
    weekStartDay: number;
  };
}
