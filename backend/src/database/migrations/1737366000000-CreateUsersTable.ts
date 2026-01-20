import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1737366000000 implements MigrationInterface {
    name = 'CreateUsersTable1737366000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create user role enum
        await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM (
        'super_admin',
        'tenant_admin',
        'branch_admin',
        'ministry_leader',
        'user'
      )
    `);

        // Create user status enum
        await queryRunner.query(`
      CREATE TYPE "user_status_enum" AS ENUM (
        'active',
        'inactive',
        'suspended',
        'pending'
      )
    `);

        // Create users table
        await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid REFERENCES "tenants"("id") ON DELETE CASCADE,
        "branch_id" uuid REFERENCES "branches"("id") ON DELETE SET NULL,
        "first_name" varchar(100) NOT NULL,
        "last_name" varchar(100) NOT NULL,
        "email" varchar(255) UNIQUE NOT NULL,
        "phone" varchar(20),
        "password" varchar(255) NOT NULL,
        "role" "user_role_enum" DEFAULT 'user',
        "status" "user_status_enum" DEFAULT 'pending',
        "avatar_url" text,
        "preferences" jsonb DEFAULT '{}'::jsonb,
        "last_login_at" timestamptz,
        "last_login_ip" inet,
        "email_verified_at" timestamptz,
        "reset_token" varchar(255),
        "reset_token_expires_at" timestamptz,
        "created_at" timestamptz DEFAULT NOW(),
        "updated_at" timestamptz DEFAULT NOW()
      )
    `);

        // Create indexes
        await queryRunner.query(`
      CREATE INDEX "idx_users_tenant" ON "users"("tenant_id")
    `);

        await queryRunner.query(`
      CREATE INDEX "idx_users_email" ON "users"("email")
    `);

        await queryRunner.query(`
      CREATE INDEX "idx_users_role" ON "users"("role")
    `);

        await queryRunner.query(`
      CREATE INDEX "idx_users_status" ON "users"("status")
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);
        await queryRunner.query(`DROP TYPE IF EXISTS "user_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum"`);
    }
}
