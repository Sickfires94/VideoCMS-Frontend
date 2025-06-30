import { UserResponseDto } from "./UserResponseDto";

export interface LoginResponseDto extends UserResponseDto{
    token: string;
  
}