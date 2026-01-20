import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    ManyToMany,
    OneToMany,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { Branch } from './branch.entity';

@Entity('ministries')
export class Ministry {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'uuid', nullable: true })
    branch_id: string;

    @Column({ type: 'uuid', nullable: true })
    parent_id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 100 })
    slug: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'uuid', nullable: true })
    leader_id: string;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;

    // Relations
    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @ManyToOne(() => Branch, (branch) => branch.ministries, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'branch_id' })
    branch: Branch;

    @ManyToMany('User', 'ministries')
    members: any[];

    @ManyToMany('Event', 'required_ministries')
    events: any[];

    @ManyToOne(() => Ministry, (ministry) => ministry.sub_ministries, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'parent_id' })
    parent: Ministry;

    @OneToMany(() => Ministry, (ministry) => ministry.parent)
    sub_ministries: Ministry[];
}
