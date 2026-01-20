import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { WebhooksController } from './webhooks.controller';
import { MpesaService } from './mpesa.service';
import { Transaction } from './entities/transaction.entity';
import { FinancialProject } from './entities/financial-project.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Transaction, FinancialProject])],
    controllers: [FinanceController, WebhooksController],
    providers: [FinanceService, MpesaService],
    exports: [FinanceService],
})
export class FinanceModule { }
