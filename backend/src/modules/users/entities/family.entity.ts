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

@Entity('families')
export class Family {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'uuid', nullable: true })
    branch_id: string;

    @Column({ type: 'varchar', length: 255 })
    family_name: string; // e.g., "The Wandera Family"

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
    latitude: number;

    @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
    longitude: number;

    @Column({ type: 'uuid', nullable: true })
    head_of_family_id: string;

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

    @OneToMany(() => User, (user) => user.family)
    members: User[];
}
