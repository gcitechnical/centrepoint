import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class BranchesService {
    constructor(
        @InjectRepository(Branch)
        private branchRepository: Repository<Branch>,
    ) { }

    async create(createBranchDto: CreateBranchDto, user: User): Promise<Branch> {
        // Check permissions
        if (
            user.role !== UserRole.SUPER_ADMIN &&
            user.role !== UserRole.TENANT_ADMIN
        ) {
            throw new ForbiddenException('Insufficient permissions to create branches');
        }

        // Tenant admins can only create branches for their own tenant
        if (
            user.role === UserRole.TENANT_ADMIN &&
            user.tenant_id !== createBranchDto.tenant_id
        ) {
            throw new ForbiddenException('You can only create branches for your own tenant');
        }

        // Check for duplicate slug within tenant
        const existingBranch = await this.branchRepository.findOne({
            where: {
                tenant_id: createBranchDto.tenant_id,
                slug: createBranchDto.slug,
            },
        });

        if (existingBranch) {
            throw new ConflictException('Branch with this slug already exists for this tenant');
        }

        const branch = this.branchRepository.create(createBranchDto);
        return await this.branchRepository.save(branch);
    }

    async findAll(user: User, tenantId?: string): Promise<Branch[]> {
        const query = this.branchRepository.createQueryBuilder('branch')
            .leftJoinAndSelect('branch.tenant', 'tenant')
            .leftJoinAndSelect('branch.ministries', 'ministries')
            .orderBy('branch.created_at', 'DESC');

        // Filter by tenant
        if (tenantId) {
            query.where('branch.tenant_id = :tenantId', { tenantId });
        } else if (user.role !== UserRole.SUPER_ADMIN && user.tenant_id) {
            query.where('branch.tenant_id = :tenantId', { tenantId: user.tenant_id });
        }

        return await query.getMany();
    }

    async findOne(id: string, user: User): Promise<Branch> {
        const branch = await this.branchRepository.findOne({
            where: { id },
            relations: ['tenant', 'ministries'],
        });

        if (!branch) {
            throw new NotFoundException('Branch not found');
        }

        // Check access
        if (user.role !== UserRole.SUPER_ADMIN && user.tenant_id !== branch.tenant_id) {
            throw new ForbiddenException('You do not have access to this branch');
        }

        return branch;
    }

    async update(id: string, updateBranchDto: UpdateBranchDto, user: User): Promise<Branch> {
        const branch = await this.findOne(id, user);

        // Check permissions
        if (
            user.role !== UserRole.SUPER_ADMIN &&
            user.role !== UserRole.TENANT_ADMIN &&
            user.role !== UserRole.BRANCH_ADMIN
        ) {
            throw new ForbiddenException('Insufficient permissions to update branches');
        }

        // Branch admins can only update their own branch
        if (user.role === UserRole.BRANCH_ADMIN && user.branch_id !== branch.id) {
            throw new ForbiddenException('You can only update your own branch');
        }

        Object.assign(branch, updateBranchDto);
        return await this.branchRepository.save(branch);
    }

    async remove(id: string, user: User): Promise<void> {
        // Only super admins and tenant admins can delete branches
        if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.TENANT_ADMIN) {
            throw new ForbiddenException('Insufficient permissions to delete branches');
        }

        const branch = await this.findOne(id, user);
        await this.branchRepository.remove(branch);
    }
}
