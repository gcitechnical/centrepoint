import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';
import { FinancialProject } from './financial-project.entity';

export enum TransactionChannel {
    USSD = 'ussd',
    WEB = 'web',
    WHATSAPP = 'whatsapp',
    MANUAL = 'manual',
    POS = 'pos',
}

export enum PaymentProvider {
    MPESA = 'mpesa',
    AIRTEL_MONEY = 'airtel_money',
    BANK = 'bank',
    CASH = 'cash',
}

export enum TransactionType {
    TITHE = 'tithe',
    OFFERING = 'offering',
    PROJECT = 'project',
    THANKSGIVING = 'thanksgiving', // Local Mission Mapping Pillar
    OTHER = 'other',
}

export enum TransactionStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
}

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'uuid', nullable: true })
    user_id: string;

    @Column({ type: 'uuid', nullable: true })
    project_id: string;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    amount: number;

    @Column({
        type: 'enum',
        enum: TransactionType,
        default: TransactionType.OFFERING,
    })
    type: TransactionType;

    @Column({
        type: 'enum',
        enum: PaymentProvider,
        default: PaymentProvider.MPESA,
    })
    provider: PaymentProvider;

    @Column({
        type: 'enum',
        enum: TransactionChannel,
        default: TransactionChannel.WEB,
    })
    channel: TransactionChannel;

    @Column({ type: 'varchar', length: 100, nullable: true })
    reference_id: string; // The M-Pesa Code (e.g., RKJ12345)

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone_number: string; // Originating phone number

    @Column({ type: 'boolean', default: false })
    is_anonymous: boolean;

    @Column({
        type: 'enum',
        enum: TransactionStatus,
        default: TransactionStatus.PENDING,
    })
    status: TransactionStatus;

    @Column({ type: 'varchar', length: 100, nullable: true })
    checkout_request_id: string; // M-Pesa CheckoutRequestID for mapping

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;

    // Relations
    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => FinancialProject)
    @JoinColumn({ name: 'project_id' })
    project: FinancialProject;
}
