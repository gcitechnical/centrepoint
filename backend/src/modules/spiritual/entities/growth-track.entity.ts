import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';

@Entity('growth_tracks')
export class GrowthTrack {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string; // e.g., "Step 1: Membership", "Step 2: Spiritual Discovery"

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'integer', default: 1 })
    order: number; // For the visual roadmap sequence

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;

    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @OneToMany(() => GrowthTrackCompletion, (c) => c.track)
    completions: GrowthTrackCompletion[];
}

@Entity('growth_track_completions')
export class GrowthTrackCompletion {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    track_id: string;

    @Column({ type: 'uuid' })
    user_id: string;

    @Column({ type: 'date', default: () => 'CURRENT_DATE' })
    completion_date: Date;

    @Column({ type: 'varchar', length: 255, nullable: true })
    certified_by: string; // The Pastor/Lead name

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @ManyToOne(() => GrowthTrack, (gt) => gt.completions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'track_id' })
    track: GrowthTrack;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
