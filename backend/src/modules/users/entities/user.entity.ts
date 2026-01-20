import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    ManyToMany,
    JoinTable,
    BeforeInsert,
    BeforeUpdate,
    OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Branch } from '../../tenants/entities/branch.entity';
import { Ministry } from '../../tenants/entities/ministry.entity';
import { Family } from './family.entity';
import { LifeMilestone } from '../../spiritual/entities/life-milestone.entity';

export enum UserRole {
    SUPER_ADMIN = 'super_admin',
    TENANT_ADMIN = 'tenant_admin',
    BRANCH_ADMIN = 'branch_admin',
    MINISTRY_LEADER = 'ministry_leader',
    STAFF = 'staff',
    MEMBER = 'member',
    USER = 'user',
}

export enum MemberType {
    MEMBER = 'member',
    VISITOR = 'visitor',
    ADHERENT = 'adherent',
    STAFF = 'staff',
}

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
    PENDING = 'pending',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', nullable: true })
    tenant_id: string;

    @Column({ type: 'uuid', nullable: true })
    branch_id: string;

    @Column({ type: 'uuid', nullable: true })
    family_id: string;

    @Column({
        type: 'enum',
        enum: MemberType,
        default: MemberType.MEMBER,
    })
    member_type: MemberType;

    @Column({ type: 'varchar', length: 100 })
    first_name: string;

    @Column({ type: 'varchar', length: 100 })
    last_name: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    gender: string;

    @Column({ type: 'date', nullable: true })
    date_of_birth: Date;

    @Column({ type: 'varchar', length: 255, nullable: true })
    profession: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    education: string;

    @Column({ type: 'varchar', array: true, default: [] })
    skills: string[];

    @Column({ type: 'varchar', length: 255, select: false })
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    })
    role: UserRole;

    @Column({
        type: 'enum',
        enum: UserStatus,
        default: UserStatus.PENDING,
    })
    status: UserStatus;

    @Column({ type: 'text', nullable: true })
    avatar_url: string;

    @Column({ type: 'jsonb', default: {} })
    preferences: Record<string, any>;

    @Column({ type: 'timestamptz', nullable: true })
    last_login_at: Date;

    @Column({ type: 'inet', nullable: true })
    last_login_ip: string;

    @Column({ type: 'timestamptz', nullable: true })
    email_verified_at: Date;

    @Column({ type: 'varchar', length: 255, nullable: true })
    reset_token: string;

    @Column({ type: 'timestamptz', nullable: true })
    reset_token_expires_at: Date;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;

    // Relations
    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @ManyToOne(() => Branch, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'branch_id' })
    branch: Branch;

    @ManyToOne(() => Family, (family) => family.members, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'family_id' })
    family: Family;

    @OneToMany(() => LifeMilestone, (milestone) => milestone.user)
    milestones: LifeMilestone[];

    @ManyToMany(() => Ministry, (ministry) => ministry.members)
    @JoinTable({
        name: 'user_ministries',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'ministry_id', referencedColumnName: 'id' }
    })
    ministries: Ministry[];

    // Hooks
    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        if (this.password && !this.password.startsWith('$2b$')) {
            this.password = await bcrypt.hash(this.password, 10);
        }
    }

    // Methods
    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }

    get fullName(): string {
        return `${this.first_name} ${this.last_name}`;
    }

    isSuperAdmin(): boolean {
        return this.role === UserRole.SUPER_ADMIN;
    }

    isTenantAdmin(): boolean {
        return this.role === UserRole.TENANT_ADMIN;
    }

    canManageTenant(tenantId: string): boolean {
        return (
            this.isSuperAdmin() ||
            (this.isTenantAdmin() && this.tenant_id === tenantId)
        );
    }
}
