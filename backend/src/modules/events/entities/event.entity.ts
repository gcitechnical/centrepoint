import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    ManyToMany,
    JoinTable,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Branch } from '../../tenants/entities/branch.entity';
import { Ministry } from '../../tenants/entities/ministry.entity';

@Entity('events')
export class Event {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'uuid', nullable: true })
    branch_id: string;

    @Column({ type: 'uuid', nullable: true })
    ministry_id: string; // Keep for legacy/single-primary ministry context

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'timestamptz' })
    start_datetime: Date;

    @Column({ type: 'timestamptz', nullable: true })
    end_datetime: Date;

    @Column({ type: 'boolean', default: false })
    is_all_day: boolean;

    @Column({ type: 'text', nullable: true })
    recurrence_rule: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    venue_name: string;

    @Column({ type: 'text', nullable: true })
    venue_address: string;

    @Column({ type: 'boolean', default: false })
    is_online: boolean;

    @Column({ type: 'text', nullable: true })
    online_url: string;

    @Column({ type: 'boolean', default: true })
    auto_generate_flyer: boolean;

    @Column({ type: 'uuid', nullable: true })
    flyer_template_id: string;

    @Column({ type: 'uuid', nullable: true })
    generated_design_id: string;

    @Column({ type: 'uuid' })
    created_by: string;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;

    // Relations
    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'branch_id' })
    branch: Branch;

    @ManyToOne(() => Ministry, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ministry_id' })
    ministry: Ministry;

    @ManyToMany(() => Ministry, (ministry) => ministry.events)
    @JoinTable({
        name: 'event_required_ministries',
        joinColumn: { name: 'event_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'ministry_id', referencedColumnName: 'id' }
    })
    required_ministries: Ministry[];
}
