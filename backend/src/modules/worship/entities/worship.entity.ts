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

@Entity('hymns')
export class Hymn {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'integer', nullable: true })
    number: number; // For traditional hymnbooks (e.g., Hymn 42)

    @Column({ type: 'varchar', length: 255 })
    title_english: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    title_swahili: string;

    @Column({ type: 'text' })
    lyrics_english: string;

    @Column({ type: 'text', nullable: true })
    lyrics_swahili: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    category: string; // e.g., "Praise", "Worship", "Thanksgiving"

    @Column({ type: 'varchar', length: 100, nullable: true })
    key: string; // e.g., "C Major"

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;

    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;
}

@Entity('sermon_notes')
export class SermonNote {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'uuid' })
    user_id: string;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    preacher: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'date', default: () => 'CURRENT_DATE' })
    date: Date;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;

    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @ManyToOne('User')
    @JoinColumn({ name: 'user_id' })
    user: any;
}
