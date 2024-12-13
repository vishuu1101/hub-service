import { IsEmail, IsNotEmpty, IsString, isValidationOptions } from "class-validator";

export class UserDTO{
    @IsEmail()
    emailId: string;
    @IsString()
    password: string;
}