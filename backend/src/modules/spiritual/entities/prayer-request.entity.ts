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

@Entity('prayer_requests')
export class PrayerRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'uuid' })
    user_id: string;

    @Column({ type: 'text' })
    request: string;

    @Column({ type: 'boolean', default: false })
    is_anonymous: boolean;

    @Column({ type: 'boolean', default: false })
    is_answered: boolean;

    @Column({ type: 'text', nullable: true })
    testimony: string;

    @Column({ type: 'integer', default: 0 })
    prayer_count: number; // Increment when someone clicks "I prayed for this"

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
}
