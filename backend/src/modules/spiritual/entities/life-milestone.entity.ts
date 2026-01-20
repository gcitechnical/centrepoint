import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';

export enum MilestoneType {
    BAPTISM = 'baptism',
    CONFIRMATION = 'confirmation',
    MARRIAGE = 'marriage',
    ORDINATION = 'ordination',
    BABY_DEDICATION = 'baby_dedication',
    SALVATION = 'salvation_date',
}

@Entity('life_milestones')
export class LifeMilestone {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'uuid' })
    user_id: string;

    @Column({
        type: 'enum',
        enum: MilestoneType,
    })
    type: MilestoneType;

    @Column({ type: 'date' })
    date: Date;

    @Column({ type: 'varchar', length: 255, nullable: true })
    location: string; // e.g., "Main Sanctuary", "River Jordan"

    @Column({ type: 'varchar', length: 255, nullable: true })
    officiated_by: string; // The Pastor/Priest name

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    certificate_url: string; // Link to the digital certificate

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;

    // Relations
    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @ManyToOne(() => User, (user) => user.milestones)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
