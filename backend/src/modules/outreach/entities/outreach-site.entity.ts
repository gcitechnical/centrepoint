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

export enum SiteType {
    MISSION_CHURCH = 'mission_church',
    AGRICULTURE_PROJECT = 'agriculture_project',
    WATER_PROJECT = 'water_project',
    SCHOOL_SUPPORT = 'school_support',
    MEDICAL_OUTPOST = 'medical_outpost',
}

@Entity('outreach_sites')
export class OutreachSite {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({
        type: 'enum',
        enum: SiteType,
    })
    type: SiteType;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 8 })
    latitude: number;

    @Column({ type: 'decimal', precision: 11, scale: 8 })
    longitude: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    lead_person: string;

    @Column({ type: 'jsonb', nullable: true })
    impact_metrics: {
        beneficiaries: number;
        status: string;
        last_visit_date: string;
    };

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;

    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;
}
