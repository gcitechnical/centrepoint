import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
// import { Branch } from './branch.entity'; // Removed to break circular dependency
// import { DesignTemplate } from './design-template.entity'; // Removed to break circular dependency
// import { UserDesign } from './user-design.entity'; // Removed to break circular dependency

@Entity('tenants')
export class Tenant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    slug: string;

    @Column({ type: 'text', nullable: true })
    logo_url: string;

    @Column({
        type: 'jsonb',
        default: {
            primary_color: '#1a365d',
            secondary_color: '#ed8936',
            fonts: { heading: 'Inter', body: 'Open Sans' },
        },
    })
    brand_config: {
        primary_color: string;
        secondary_color: string;
        fonts: {
            heading: string;
            body: string;
        };
    };

    @Column({ type: 'varchar', length: 50, default: 'free' })
    subscription_tier: string;

    @Column({ type: 'timestamptz', nullable: true })
    subscription_expires_at: Date;

    @Column({ type: 'jsonb', default: {} })
    feature_flags: Record<string, boolean>;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;

    // Relations
    @OneToMany('Branch', 'tenant')
    branches: any[];

    @OneToMany('DesignTemplate', 'tenant')
    templates: any[];

    @OneToMany('UserDesign', 'tenant')
    designs: any[];
}
