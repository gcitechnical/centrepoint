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
import { Branch } from '../../tenants/entities/branch.entity';
import { DesignTemplate } from './design-template.entity';

@Entity('user_designs')
export class UserDesign {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'uuid', nullable: true })
    branch_id: string;

    @Column({ type: 'uuid', nullable: true })
    template_id: string;

    @Column({ type: 'uuid', nullable: true })
    event_id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'jsonb' })
    canvas_json: Record<string, any>;

    @Column({ type: 'jsonb', default: [] })
    exports: Array<{
        format: string;
        url: string;
        created_at: string;
    }>;

    @Column({
        type: 'varchar',
        length: 50,
        default: 'draft',
    })
    status: string; // 'draft', 'pending_approval', 'approved', 'published'

    @Column({ type: 'uuid' })
    created_by: string;

    @Column({ type: 'uuid', nullable: true })
    approved_by: string;

    @Column({ type: 'timestamptz', nullable: true })
    approved_at: Date;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;

    // Relations
    @ManyToOne(() => Tenant, (tenant) => tenant.designs, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'branch_id' })
    branch: Branch;

    @ManyToOne(() => DesignTemplate, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'template_id' })
    template: DesignTemplate;
}
