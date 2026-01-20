import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Query,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserRole } from '../users/entities/user.entity';
import { TransactionType } from './entities/transaction.entity';

@Controller('finance')
export class FinanceController {
    constructor(private readonly financeService: FinanceService) { }

    @Post('projects')
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
    async createProject(@Body() data: any, @CurrentUser() user: User) {
        return await this.financeService.createProject(data, user);
    }

    @Get('projects')
    async getProjects(@CurrentUser() user: User) {
        return await this.financeService.findAllProjects(user.tenant_id);
    }

    @Post('give/mpesa')
    async giveMpesa(
        @Body() body: { amount: number; phone: string; type: TransactionType; project_id?: string },
        @CurrentUser() user: User
    ) {
        return await this.financeService.triggerStkPush(
            body.amount,
            body.phone,
            body.type,
            body.project_id,
            user
        );
    }

    @Post('mpesa/callback')
    async mpesaCallback(@Body() payload: any) {
        return await this.financeService.handleMpesaCallback(payload);
    }

    @Get('history')
    async getHistory(@CurrentUser() user: User) {
        return await this.financeService.getMemberGivingHistory(user.id);
    }

    @Get('stats')
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
    async getStats(@CurrentUser() user: User) {
        return await this.financeService.getTenantStats(user.tenant_id);
    }
}
