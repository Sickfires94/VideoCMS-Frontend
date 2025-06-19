export interface User {
  userId: number; // Corresponds to 'userId' (integer)
  userName: string; // Corresponds to 'userName' (string)
  userEmail: string; // Corresponds to 'userEmail' (string)
  // userPassword: string; // Included if this DTO is used for login/registration payloads.
                         // Generally, avoid storing passwords directly in user models on the frontend post-authentication.
  userCreatedDate?: string; // Corresponds to 'userCreatedDate' (string, date format)
  userUpdatedDate?: string; // Corresponds to 'userUpdatedDate' (string, date format)
}