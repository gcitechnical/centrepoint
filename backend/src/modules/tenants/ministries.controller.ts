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
import { MinistriesService } from './ministries.service';
import { CreateMinistryDto } from './dto/create-ministry.dto';
import { UpdateMinistryDto } from './dto/update-ministry.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserRole } from '../users/entities/user.entity';

@Controller('ministries')
@UseGuards(RolesGuard)
export class MinistriesController {
    constructor(private readonly ministriesService: MinistriesService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.BRANCH_ADMIN)
    async create(
        @Body() createMinistryDto: CreateMinistryDto,
        @CurrentUser() user: User,
    ) {
        const ministry = await this.ministriesService.create(createMinistryDto, user);
        return {
            message: 'Ministry created successfully',
            data: ministry,
        };
    }

    @Get()
    async findAll(
        @CurrentUser() user: User,
        @Query('tenant_id') tenantId?: string,
        @Query('branch_id') branchId?: string,
    ) {
        const ministries = await this.ministriesService.findAll(user, tenantId, branchId);
        return {
            message: 'Ministries retrieved successfully',
            data: ministries,
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @CurrentUser() user: User) {
        const ministry = await this.ministriesService.findOne(id, user);
        return {
            message: 'Ministry retrieved successfully',
            data: ministry,
        };
    }

    @Patch(':id')
    @Roles(
        UserRole.SUPER_ADMIN,
        UserRole.TENANT_ADMIN,
        UserRole.BRANCH_ADMIN,
        UserRole.MINISTRY_LEADER,
    )
    async update(
        @Param('id') id: string,
        @Body() updateMinistryDto: UpdateMinistryDto,
        @CurrentUser() user: User,
    ) {
        const ministry = await this.ministriesService.update(id, updateMinistryDto, user);
        return {
            message: 'Ministry updated successfully',
            data: ministry,
        };
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.BRANCH_ADMIN)
    async remove(@Param('id') id: string, @CurrentUser() user: User) {
        await this.ministriesService.remove(id, user);
        return {
            message: 'Ministry deleted successfully',
        };
    }

    @Post(':id/members/:userId')
    @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.BRANCH_ADMIN, UserRole.MINISTRY_LEADER)
    async addMember(
        @Param('id') id: string,
        @Param('userId') userId: string,
        @CurrentUser() user: User,
    ) {
        const ministry = await this.ministriesService.addMember(id, userId, user);
        return {
            message: 'Member added successfully',
            data: ministry,
        };
    }

    @Delete(':id/members/:userId')
    @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.BRANCH_ADMIN, UserRole.MINISTRY_LEADER)
    async removeMember(
        @Param('id') id: string,
        @Param('userId') userId: string,
        @CurrentUser() user: User,
    ) {
        const ministry = await this.ministriesService.removeMember(id, userId, user);
        return {
            message: 'Member removed successfully',
            data: ministry,
        };
    }
}
