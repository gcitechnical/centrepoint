import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Ministry } from './entities/ministry.entity';
import { CreateMinistryDto } from './dto/create-ministry.dto';
import { UpdateMinistryDto } from './dto/update-ministry.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class MinistriesService {
    constructor(
        @InjectRepository(Ministry)
        private ministryRepository: Repository<Ministry>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async create(createMinistryDto: CreateMinistryDto, user: User): Promise<Ministry> {
        // Check permissions
        if (
            user.role !== UserRole.SUPER_ADMIN &&
            user.role !== UserRole.TENANT_ADMIN &&
            user.role !== UserRole.BRANCH_ADMIN
        ) {
            throw new ForbiddenException('Insufficient permissions to create ministries');
        }

        const ministry = this.ministryRepository.create(createMinistryDto);
        return await this.ministryRepository.save(ministry);
    }

    async findAll(user: User, tenantId?: string, branchId?: string): Promise<Ministry[]> {
        const query = this.ministryRepository.createQueryBuilder('ministry')
            .leftJoinAndSelect('ministry.tenant', 'tenant')
            .leftJoinAndSelect('ministry.branch', 'branch')
            .orderBy('ministry.created_at', 'DESC');

        if (tenantId) {
            query.where('ministry.tenant_id = :tenantId', { tenantId });
        } else if (user.role !== UserRole.SUPER_ADMIN && user.tenant_id) {
            query.where('ministry.tenant_id = :tenantId', { tenantId: user.tenant_id });
        }

        if (branchId) {
            query.andWhere('ministry.branch_id = :branchId', { branchId });
        }

        return await query.getMany();
    }

    async findOne(id: string, user: User): Promise<Ministry> {
        const ministry = await this.ministryRepository.findOne({
            where: { id },
            relations: ['tenant', 'branch', 'members'],
        });

        if (!ministry) {
            throw new NotFoundException('Ministry not found');
        }

        if (user.role !== UserRole.SUPER_ADMIN) {
            if (user.tenant_id !== ministry.tenant_id) {
                throw new ForbiddenException('You do not have access to this ministry');
            }
        }

        return ministry;
    }

    async update(id: string, updateMinistryDto: UpdateMinistryDto, user: User): Promise<Ministry> {
        const ministry = await this.findOne(id, user);

        if (user.role === UserRole.USER) {
            throw new ForbiddenException('Insufficient permissions to update ministries');
        }

        Object.assign(ministry, updateMinistryDto);
        return await this.ministryRepository.save(ministry);
    }

    async remove(id: string, user: User): Promise<void> {
        if (user.role === UserRole.USER) {
            throw new ForbiddenException('Insufficient permissions to delete ministries');
        }

        const ministry = await this.findOne(id, user);
        await this.ministryRepository.remove(ministry);
    }

    async addMember(id: string, userId: string, user: User): Promise<Ministry> {
        const ministry = await this.findOne(id, user);

        if (user.role === UserRole.USER) {
            throw new ForbiddenException('Insufficient permissions to add members');
        }

        const member = await this.userRepository.findOne({ where: { id: userId } });
        if (!member) {
            throw new NotFoundException('User not found');
        }

        const isMember = ministry.members?.some(m => m.id === userId);
        if (isMember) {
            throw new ConflictException('User is already a member of this ministry');
        }

        ministry.members = [...(ministry.members || []), member];
        return await this.ministryRepository.save(ministry);
    }

    async removeMember(id: string, userId: string, user: User): Promise<Ministry> {
        const ministry = await this.findOne(id, user);

        if (user.role === UserRole.USER) {
            throw new ForbiddenException('Insufficient permissions to remove members');
        }

        ministry.members = (ministry.members || []).filter(m => m.id !== userId);
        return await this.ministryRepository.save(ministry);
    }
}
