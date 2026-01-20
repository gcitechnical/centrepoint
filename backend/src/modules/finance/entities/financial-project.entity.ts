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
import { CrisisRequest } from '../../outreach/entities/crisis-request.entity';

@Entity('financial_projects')
export class FinancialProject {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string; // e.g., "Main Sanctuary Building Fund", "Education Support - Jane Doe"

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    target_amount: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    current_amount: number;

    @Column({ type: 'date', nullable: true })
    start_date: Date;

    @Column({ type: 'date', nullable: true })
    end_date: Date;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @Column({ type: 'boolean', default: false })
    is_emergency: boolean; // For Crisis Response matching

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;

    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column({ type: 'uuid', nullable: true })
    crisis_id: string;

    @ManyToOne(() => CrisisRequest, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'crisis_id' })
    crisis: CrisisRequest;
}
