import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserRole } from '../users/entities/user.entity';

@Controller('tenants')
@UseGuards(RolesGuard)
export class TenantsController {
    constructor(private readonly tenantsService: TenantsService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN)
    async create(
        @Body() createTenantDto: CreateTenantDto,
        @CurrentUser() user: User,
    ) {
        const tenant = await this.tenantsService.create(createTenantDto, user);
        return {
            message: 'Tenant created successfully',
            data: tenant,
        };
    }

    @Get()
    async findAll(@CurrentUser() user: User) {
        const tenants = await this.tenantsService.findAll(user);
        return {
            message: 'Tenants retrieved successfully',
            data: tenants,
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @CurrentUser() user: User) {
        const tenant = await this.tenantsService.findOne(id, user);
        return {
            message: 'Tenant retrieved successfully',
            data: tenant,
        };
    }

    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
    async update(
        @Param('id') id: string,
        @Body() updateTenantDto: UpdateTenantDto,
        @CurrentUser() user: User,
    ) {
        const tenant = await this.tenantsService.update(id, updateTenantDto, user);
        return {
            message: 'Tenant updated successfully',
            data: tenant,
        };
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN)
    async remove(@Param('id') id: string, @CurrentUser() user: User) {
        await this.tenantsService.remove(id, user);
        return {
            message: 'Tenant deleted successfully',
        };
    }
}
