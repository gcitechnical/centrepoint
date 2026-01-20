import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

export class RegisterDto {
    @IsNotEmpty()
    @IsString()
    first_name: string;

    @IsNotEmpty()
    @IsString()
    last_name: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;

    @IsOptional()
    @IsString()
    tenant_id?: string;

    @IsOptional()
    @IsString()
    branch_id?: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}
