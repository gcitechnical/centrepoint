import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity('design_templates')
@Index(['tenant_id'], { where: 'tenant_id IS NOT NULL' })
export class DesignTemplate {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', nullable: true })
    tenant_id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'varchar', length: 100 })
    category: string; // 'flyer', 'bulletin', 'social_media', 'banner'

    @Column({ type: 'int' })
    width: number;

    @Column({ type: 'int' })
    height: number;

    @Column({ type: 'varchar', length: 10, default: 'px' })
    unit: string; // 'px', 'mm', 'in'

    @Column({ type: 'jsonb' })
    canvas_json: Record<string, any>;

    @Column({ type: 'text', nullable: true })
    thumbnail_url: string;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @Column({ type: 'boolean', default: false })
    is_master: boolean;

    @Column({ type: 'uuid' })
    created_by: string;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;

    // Relations
    @ManyToOne(() => Tenant, (tenant) => tenant.templates, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;
}
