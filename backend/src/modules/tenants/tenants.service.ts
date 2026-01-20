import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class TenantsService {
    constructor(
        @InjectRepository(Tenant)
        private tenantRepository: Repository<Tenant>,
    ) { }

    async create(createTenantDto: CreateTenantDto, user: User): Promise<Tenant> {
        // Only super admins can create tenants
        if (user.role !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException('Only super admins can create tenants');
        }

        // Check if slug already exists
        const existingTenant = await this.tenantRepository.findOne({
            where: { slug: createTenantDto.slug },
        });

        if (existingTenant) {
            throw new ConflictException('Tenant with this slug already exists');
        }

        const tenant = this.tenantRepository.create(createTenantDto);
        return await this.tenantRepository.save(tenant);
    }

    async findAll(user: User): Promise<Tenant[]> {
        // Super admins see all tenants
        if (user.role === UserRole.SUPER_ADMIN) {
            return await this.tenantRepository.find({
                relations: ['branches'],
                order: { created_at: 'DESC' },
            });
        }

        // Other users only see their own tenant
        if (!user.tenant_id) {
            return [];
        }

        const tenant = await this.tenantRepository.findOne({
            where: { id: user.tenant_id },
            relations: ['branches'],
        });

        return tenant ? [tenant] : [];
    }

    async findOne(id: string, user: User): Promise<Tenant> {
        const tenant = await this.tenantRepository.findOne({
            where: { id },
            relations: ['branches'],
        });

        if (!tenant) {
            throw new NotFoundException('Tenant not found');
        }

        // Check access
        if (user.role !== UserRole.SUPER_ADMIN && user.tenant_id !== tenant.id) {
            throw new ForbiddenException('You do not have access to this tenant');
        }

        return tenant;
    }

    async update(id: string, updateTenantDto: UpdateTenantDto, user: User): Promise<Tenant> {
        const tenant = await this.findOne(id, user);

        // Only super admins and tenant admins can update
        if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.TENANT_ADMIN) {
            throw new ForbiddenException('You do not have permission to update this tenant');
        }

        // If updating slug, check for conflicts
        if (updateTenantDto.slug && updateTenantDto.slug !== tenant.slug) {
            const existingTenant = await this.tenantRepository.findOne({
                where: { slug: updateTenantDto.slug },
            });

            if (existingTenant) {
                throw new ConflictException('Tenant with this slug already exists');
            }
        }

        Object.assign(tenant, updateTenantDto);
        return await this.tenantRepository.save(tenant);
    }

    async remove(id: string, user: User): Promise<void> {
        // Only super admins can delete tenants
        if (user.role !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException('Only super admins can delete tenants');
        }

        const tenant = await this.findOne(id, user);
        await this.tenantRepository.remove(tenant);
    }
}
