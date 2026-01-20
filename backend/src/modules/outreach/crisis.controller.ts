import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    UseGuards,
} from '@nestjs/common';
import { CrisisService } from './crisis.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserRole } from '../users/entities/user.entity';
import { CrisisStatus } from './entities/crisis-request.entity';

@Controller('outreach/crisis')
export class CrisisController {
    constructor(private readonly crisisService: CrisisService) { }

    @Post('report')
    async report(@Body() data: any, @CurrentUser() user: User) {
        return await this.crisisService.reportCrisis(data, user);
    }

    @Get('active')
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.STAFF)
    async getActive(@CurrentUser() user: User) {
        return await this.crisisService.findAllActive(user.tenant_id);
    }

    @Get(':id/matches')
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.STAFF)
    async getMatches(@Param('id') id: string) {
        return await this.crisisService.matchServiceProviders(id);
    }

    @Patch(':id/status')
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.STAFF)
    async updateStatus(
        @Param('id') id: string,
        @Body() body: { status: CrisisStatus, notes?: string }
    ) {
        return await this.crisisService.updateStatus(id, body.status, body.notes);
    }
}
