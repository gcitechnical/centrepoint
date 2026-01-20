import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
} from '@nestjs/common';
import { DesignsService } from './designs.service';
import { CreateDesignDto } from './dto/create-design.dto';
import { UpdateDesignDto } from './dto/update-design.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserRole } from '../users/entities/user.entity';

@Controller('studio/designs')
@UseGuards(RolesGuard)
export class DesignsController {
    constructor(private readonly designsService: DesignsService) { }

    @Post()
    async create(
        @Body() createDesignDto: CreateDesignDto,
        @CurrentUser() user: User,
    ) {
        const design = await this.designsService.create(createDesignDto, user);
        return {
            message: 'Design created successfully',
            data: design,
        };
    }

    @Get()
    async findAll(
        @CurrentUser() user: User,
        @Query('tenant_id') tenantId?: string,
        @Query('status') status?: string,
    ) {
        const designs = await this.designsService.findAll(user, tenantId, status);
        return {
            message: 'Designs retrieved successfully',
            data: designs,
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @CurrentUser() user: User) {
        const design = await this.designsService.findOne(id, user);
        return {
            message: 'Design retrieved successfully',
            data: design,
        };
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateDesignDto: UpdateDesignDto,
        @CurrentUser() user: User,
    ) {
        const design = await this.designsService.update(id, updateDesignDto, user);
        return {
            message: 'Design updated successfully',
            data: design,
        };
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @CurrentUser() user: User) {
        await this.designsService.remove(id, user);
        return {
            message: 'Design deleted successfully',
        };
    }

    @Post(':id/approve')
    @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.BRANCH_ADMIN)
    async approve(@Param('id') id: string, @CurrentUser() user: User) {
        const design = await this.designsService.approve(id, user);
        return {
            message: 'Design approved successfully',
            data: design,
        };
    }

    @Post(':id/export')
    async addExport(
        @Param('id') id: string,
        @Body() body: { format: string; url: string },
        @CurrentUser() user: User,
    ) {
        const design = await this.designsService.addExport(id, body.format, body.url, user);
        return {
            message: 'Export recorded successfully',
            data: design,
        };
    }
}
