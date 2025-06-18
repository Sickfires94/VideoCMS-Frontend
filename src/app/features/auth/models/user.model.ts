export interface User {
    id: string;
    username: string;
    email: string;
    roles?: string[]; // Optional: if your app uses roles
  }