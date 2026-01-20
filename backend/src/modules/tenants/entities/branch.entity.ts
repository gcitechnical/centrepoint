import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity('branches')
export class Branch {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 100 })
    slug: string;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    city: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    country: string;

    @Column({ type: 'varchar', length: 50, default: 'Africa/Nairobi' })
    timezone: string;

    @Column({ type: 'jsonb', default: {} })
    settings: Record<string, any>;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;

    // Relations
    @ManyToOne(() => Tenant, (tenant) => tenant.branches, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @OneToMany('Ministry', 'branch')
    ministries: any[];
}
