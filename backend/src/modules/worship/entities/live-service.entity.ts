import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity('live_services')
export class LiveService {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'boolean', default: false })
    is_live: boolean;

    @Column({ type: 'varchar', length: 500, nullable: true })
    stream_url: string; // YouTube/Facebook link

    @Column({ type: 'varchar', length: 255, nullable: true })
    current_sermon_title: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    current_preacher: string;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;

    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;
}
