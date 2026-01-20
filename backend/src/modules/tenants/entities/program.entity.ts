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
import { Ministry } from '../../tenants/entities/ministry.entity';
import { User } from '../../users/entities/user.entity';

@Entity('ministry_programs')
export class MinistryProgram {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'uuid' })
    ministry_id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string; // e.g., "Daughters of Zion", "Young Professionals Track"

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'date', nullable: true })
    start_date: Date;

    @Column({ type: 'date', nullable: true })
    end_date: Date;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;

    // Relations
    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @ManyToOne(() => Ministry)
    @JoinColumn({ name: 'ministry_id' })
    ministry: Ministry;

    @OneToMany(() => ProgramMember, (pm) => pm.program)
    members: ProgramMember[];
}

@Entity('program_members')
export class ProgramMember {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    program_id: string;

    @Column({ type: 'uuid' })
    user_id: string;

    @Column({ type: 'date', default: () => 'CURRENT_DATE' })
    joined_at: Date;

    @Column({ type: 'varchar', nullable: true })
    role: string; // e.g., "Student", "Facilitator"

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @ManyToOne(() => MinistryProgram, (p) => p.members, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'program_id' })
    program: MinistryProgram;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
