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
import { Branch } from '../../tenants/entities/branch.entity';
import { User } from '../../users/entities/user.entity';

@Entity('growth_centres')
export class GrowthCentre {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'uuid', nullable: true })
    branch_id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string; // e.g., "Syokimau Growth Centre", "Karen Home Fellowship"

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
    latitude: number; // For GIS Mapping Pillar

    @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
    longitude: number;

    @Column({ type: 'uuid', nullable: true })
    leader_id: string; // The Shepherd/Leader

    @Column({ type: 'uuid', nullable: true })
    host_id: string; // The home owner/host

    @Column({ type: 'varchar', length: 100, default: 'Wednesday' })
    meeting_day: string;

    @Column({ type: 'varchar', length: 100, default: '18:00' })
    meeting_time: string;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;

    // Relations
    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @ManyToOne(() => Branch)
    @JoinColumn({ name: 'branch_id' })
    branch: Branch;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'leader_id' })
    leader: User;

    @OneToMany(() => GrowthCentreAttendance, (a) => a.growth_centre)
    attendance_records: GrowthCentreAttendance[];
}

@Entity('growth_centre_attendance')
export class GrowthCentreAttendance {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    growth_centre_id: string;

    @Column({ type: 'uuid' })
    user_id: string;

    @Column({ type: 'date' })
    date: Date;

    @Column({ type: 'boolean', default: true })
    is_present: boolean;

    @Column({ type: 'text', nullable: true })
    prayer_requests: string; // Link to Prayer Request Network Pillar

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @ManyToOne(() => GrowthCentre, (gc) => gc.attendance_records, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'growth_centre_id' })
    growth_centre: GrowthCentre;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
