import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType, PaymentProvider, TransactionChannel, TransactionStatus } from './entities/transaction.entity';
import { FinancialProject } from './entities/financial-project.entity';
import { User } from '../users/entities/user.entity';
import { MpesaService } from './mpesa.service';

@Injectable()
export class FinanceService {
    private readonly logger = new Logger(FinanceService.name);

    constructor(
        @InjectRepository(Transaction)
        private transactionRepository: Repository<Transaction>,
        @InjectRepository(FinancialProject)
        private projectRepository: Repository<FinancialProject>,
        private mpesaService: MpesaService,
    ) { }

    async createProject(data: any, user: User): Promise<FinancialProject> {
        const project = this.projectRepository.create({
            ...data,
            tenant_id: user.tenant_id,
        });
        return await this.projectRepository.save(project) as any;
    }

    async findAllProjects(tenantId: string): Promise<FinancialProject[]> {
        return await this.projectRepository.find({
            where: { tenant_id: tenantId, is_active: true },
            order: { created_at: 'DESC' },
        });
    }

    async triggerStkPush(amount: number, phone: string, type: TransactionType, projectId?: string, user?: User) {
        this.logger.log(`Triggering LIVE STK Push: ${amount} for ${phone} (${type})`);

        const accountRef = projectId ? `Proj-${projectId.slice(0, 8)}` : type.toUpperCase();
        const desc = `Church Giving: ${type}`;

        try {
            const result = await this.mpesaService.triggerStkPush(amount, phone, accountRef, desc);

            // Create a pending record
            const transaction = this.transactionRepository.create({
                tenant_id: user?.tenant_id || '99999999-9999-9999-9999-999999999999', // Fallback for public giving
                user_id: user?.id,
                project_id: projectId,
                amount: amount,
                type: type,
                provider: PaymentProvider.MPESA,
                phone_number: phone,
                checkout_request_id: result.CheckoutRequestID,
                status: TransactionStatus.PENDING,
            });
            await this.transactionRepository.save(transaction);

            return result;
        } catch (error) {
            this.logger.error(`Live STK Push failed`, error.message);
            throw new BadRequestException('M-Pesa payment trigger failed. Please check your phone number.');
        }
    }

    async handleMpesaCallback(payload: any) {
        const result = payload.Body.stkCallback;
        const checkoutRequestId = result.CheckoutRequestID;

        const transaction = await this.transactionRepository.findOne({
            where: { checkout_request_id: checkoutRequestId }
        });

        if (!transaction) {
            this.logger.error(`Transaction not found for ID: ${checkoutRequestId}`);
            return;
        }

        if (result.ResultCode === 0) {
            this.logger.log(`Successful payment for ${checkoutRequestId}`);
            transaction.status = TransactionStatus.COMPLETED;

            // Extract M-Pesa Receipt Number from Metadata
            const items = result.CallbackMetadata.Item;
            const mpId = items.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
            if (mpId) transaction.reference_id = mpId;

            await this.transactionRepository.save(transaction);

            // If it's a project donation, update the project's progress
            if (transaction.project_id) {
                const project = await this.projectRepository.findOne({ where: { id: transaction.project_id } });
                if (project) {
                    project.current_amount = Number(project.current_amount) + Number(transaction.amount);
                    await this.projectRepository.save(project);
                }
            }
        } else {
            this.logger.warn(`Payment failed or cancelled for ${checkoutRequestId}: ${result.ResultDesc}`);
            transaction.status = TransactionStatus.FAILED;
            transaction.notes = result.ResultDesc;
            await this.transactionRepository.save(transaction);
        }
    }

    async getMemberGivingHistory(userId: string): Promise<Transaction[]> {
        return await this.transactionRepository.find({
            where: { user_id: userId },
            relations: ['project'],
            order: { created_at: 'DESC' },
        });
    }

    async getTenantStats(tenantId: string) {
        const totalRaised = await this.transactionRepository
            .createQueryBuilder('t')
            .where('t.tenant_id = :tenantId', { tenantId })
            .select('SUM(t.amount)', 'sum')
            .getRawOne();

        return {
            totalRaised: parseFloat(totalRaised.sum || 0),
        };
    }
}
