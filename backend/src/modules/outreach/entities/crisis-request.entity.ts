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
import { User } from '../../users/entities/user.entity';

export enum CrisisStatus {
    REPORTED = 'reported',
    ASSESSED = 'assessed',
    MOBILIZING = 'mobilizing',
    RESOLVED = 'resolved',
}

export enum CrisisCategory {
    MEDICAL = 'medical',
    BEREAVEMENT = 'bereavement',
    FINANCIAL = 'financial',
    LEGAL = 'legal',
    OTHER = 'other',
}

@Entity('crisis_requests')
export class CrisisRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'uuid' })
    reported_by_id: string;

    @Column({ type: 'uuid', nullable: true })
    affected_user_id: string; // If reporting for someone else

    @Column({
        type: 'enum',
        enum: CrisisCategory,
    })
    category: CrisisCategory;

    @Column({ type: 'text' })
    description: string;

    @Column({
        type: 'enum',
        enum: CrisisStatus,
        default: CrisisStatus.REPORTED,
    })
    status: CrisisStatus;

    @Column({ type: 'jsonb', nullable: true })
    assessment_notes: any; // "Automated Needs Assessment" Pillar

    @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
    financial_need_amount: number;

    @Column({ type: 'uuid', nullable: true })
    linked_fundraising_project_id: string; // Link to Harambee Module

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;

    // Relations
    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'reported_by_id' })
    reporter: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'affected_user_id' })
    affected_member: User;

    @ManyToMany('User')
    @JoinTable({
        name: 'crisis_assignments',
        joinColumn: { name: 'crisis_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' }
    })
    assigned_members: any[];
}
