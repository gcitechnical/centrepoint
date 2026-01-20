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
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserRole } from '../users/entities/user.entity';

@Controller('branches')
@UseGuards(RolesGuard)
export class BranchesController {
    constructor(private readonly branchesService: BranchesService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
    async create(
        @Body() createBranchDto: CreateBranchDto,
        @CurrentUser() user: User,
    ) {
        const branch = await this.branchesService.create(createBranchDto, user);
        return {
            message: 'Branch created successfully',
            data: branch,
        };
    }

    @Get()
    async findAll(
        @CurrentUser() user: User,
        @Query('tenant_id') tenantId?: string,
    ) {
        const branches = await this.branchesService.findAll(user, tenantId);
        return {
            message: 'Branches retrieved successfully',
            data: branches,
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @CurrentUser() user: User) {
        const branch = await this.branchesService.findOne(id, user);
        return {
            message: 'Branch retrieved successfully',
            data: branch,
        };
    }

    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.BRANCH_ADMIN)
    async update(
        @Param('id') id: string,
        @Body() updateBranchDto: UpdateBranchDto,
        @CurrentUser() user: User,
    ) {
        const branch = await this.branchesService.update(id, updateBranchDto, user);
        return {
            message: 'Branch updated successfully',
            data: branch,
        };
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
    async remove(@Param('id') id: string, @CurrentUser() user: User) {
        await this.branchesService.remove(id, user);
        return {
            message: 'Branch deleted successfully',
        };
    }
}
