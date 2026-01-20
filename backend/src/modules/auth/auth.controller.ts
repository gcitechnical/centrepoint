import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        const result = await this.authService.register(registerDto);
        return {
            message: 'Registration successful',
            data: result,
        };
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {
        const result = await this.authService.login(loginDto);
        return {
            message: 'Login successful',
            data: result,
        };
    }

    @Get('profile')
    async getProfile(@CurrentUser() user: User) {
        const profile = await this.authService.getProfile(user.id);
        return {
            message: 'Profile retrieved successfully',
            data: profile,
        };
    }

    @Get('me')
    async getCurrentUser(@CurrentUser() user: User) {
        return {
            message: 'Current user retrieved successfully',
            data: user,
        };
    }
}
