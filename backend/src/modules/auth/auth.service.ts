import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto): Promise<{ user: User; access_token: string }> {
        // Check if user already exists
        const existingUser = await this.userRepository.findOne({
            where: { email: registerDto.email },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Create new user
        const user = this.userRepository.create({
            ...registerDto,
            status: UserStatus.ACTIVE, // Auto-activate for now
            role: registerDto.role || UserRole.USER,
        });

        await this.userRepository.save(user);

        // Generate JWT token
        const access_token = await this.generateToken(user);

        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword as User,
            access_token,
        };
    }

    async login(loginDto: LoginDto): Promise<{ user: User; access_token: string }> {
        // Find user with password
        const user = await this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.email = :email', { email: loginDto.email })
            .leftJoinAndSelect('user.tenant', 'tenant')
            .leftJoinAndSelect('user.branch', 'branch')
            .leftJoinAndSelect('user.ministries', 'ministries')
            .getOne();

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Validate password
        const isPasswordValid = await user.validatePassword(loginDto.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }
        // Check if user is active
        if (user.status !== UserStatus.ACTIVE) {
            throw new UnauthorizedException('Your account is not active');
        }

        // Update last login
        await this.userRepository.update(user.id, {
            last_login_at: new Date(),
        });

        // Generate JWT token
        const access_token = await this.generateToken(user);

        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword as User,
            access_token,
        };
    }

    async validateUser(userId: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['tenant', 'branch', 'ministries'],
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        if (user.status !== UserStatus.ACTIVE) {
            throw new UnauthorizedException('User account is not active');
        }

        return user;
    }

    async getProfile(userId: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['tenant', 'branch', 'ministries'],
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        return user;
    }

    private async generateToken(user: User): Promise<string> {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            tenant_id: user.tenant_id,
            branch_id: user.branch_id,
        };

        return this.jwtService.sign(payload);
    }
}
