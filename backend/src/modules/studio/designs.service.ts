import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDesign } from './entities/user-design.entity';
import { CreateDesignDto } from './dto/create-design.dto';
import { UpdateDesignDto } from './dto/update-design.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class DesignsService {
    constructor(
        @InjectRepository(UserDesign)
        private designRepository: Repository<UserDesign>,
    ) { }

    async create(createDesignDto: CreateDesignDto, user: User): Promise<UserDesign> {
        const design = this.designRepository.create({
            ...createDesignDto,
            created_by: user.id,
            status: createDesignDto.status || 'draft',
        });

        return await this.designRepository.save(design);
    }

    async findAll(user: User, tenantId?: string, status?: string): Promise<UserDesign[]> {
        const query = this.designRepository.createQueryBuilder('design')
            .leftJoinAndSelect('design.template', 'template')
            .leftJoinAndSelect('design.tenant', 'tenant')
            .leftJoinAndSelect('design.branch', 'branch')
            .orderBy('design.created_at', 'DESC');

        // Filter by tenant
        if (tenantId) {
            query.where('design.tenant_id = :tenantId', { tenantId });
        } else if (user.role !== UserRole.SUPER_ADMIN && user.tenant_id) {
            query.where('design.tenant_id = :tenantId', { tenantId: user.tenant_id });
        }

        // Filter by status
        if (status) {
            query.andWhere('design.status = :status', { status });
        }

        // Branch admins only see their branch's designs
        if (user.role === UserRole.BRANCH_ADMIN && user.branch_id) {
            query.andWhere('design.branch_id = :branchId', { branchId: user.branch_id });
        }

        // Regular users only see their own designs
        if (user.role === UserRole.USER) {
            query.andWhere('design.created_by = :userId', { userId: user.id });
        }

        return await query.getMany();
    }

    async findOne(id: string, user: User): Promise<UserDesign> {
        const design = await this.designRepository.findOne({
            where: { id },
            relations: ['template', 'tenant', 'branch'],
        });

        if (!design) {
            throw new NotFoundException('Design not found');
        }

        // Check access
        if (user.role !== UserRole.SUPER_ADMIN) {
            if (design.tenant_id !== user.tenant_id) {
                throw new ForbiddenException('You do not have access to this design');
            }

            if (user.role === UserRole.BRANCH_ADMIN && design.branch_id !== user.branch_id) {
                throw new ForbiddenException('You do not have access to this design');
            }

            if (user.role === UserRole.USER && design.created_by !== user.id) {
                throw new ForbiddenException('You do not have access to this design');
            }
        }

        return design;
    }

    async update(id: string, updateDesignDto: UpdateDesignDto, user: User): Promise<UserDesign> {
        const design = await this.findOne(id, user);

        // Users can only update their own designs
        if (user.role === UserRole.USER && design.created_by !== user.id) {
            throw new ForbiddenException('You can only update your own designs');
        }

        Object.assign(design, updateDesignDto);
        return await this.designRepository.save(design);
    }

    async remove(id: string, user: User): Promise<void> {
        const design = await this.findOne(id, user);

        // Users can only delete their own designs
        if (user.role === UserRole.USER && design.created_by !== user.id) {
            throw new ForbiddenException('You can only delete your own designs');
        }

        await this.designRepository.remove(design);
    }

    async approve(id: string, user: User): Promise<UserDesign> {
        const design = await this.findOne(id, user);

        // Only admins can approve
        if (
            user.role !== UserRole.SUPER_ADMIN &&
            user.role !== UserRole.TENANT_ADMIN &&
            user.role !== UserRole.BRANCH_ADMIN
        ) {
            throw new ForbiddenException('Insufficient permissions to approve designs');
        }

        design.status = 'approved';
        design.approved_by = user.id;
        design.approved_at = new Date();

        return await this.designRepository.save(design);
    }

    async addExport(id: string, format: string, url: string, user: User): Promise<UserDesign> {
        const design = await this.findOne(id, user);

        const exportRecord = {
            format,
            url,
            created_at: new Date().toISOString(),
        };

        design.exports = [...(design.exports || []), exportRecord];
        return await this.designRepository.save(design);
    }
}
