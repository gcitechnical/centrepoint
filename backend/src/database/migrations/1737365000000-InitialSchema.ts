import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1737365000000 implements MigrationInterface {
    name = 'InitialSchema1737365000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable UUID extension
        await queryRunner.query(
            `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,
        );

        // Create tenants table
        await queryRunner.query(`
      CREATE TABLE "tenants" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "slug" varchar(100) UNIQUE NOT NULL,
        "logo_url" text,
        "brand_config" jsonb DEFAULT '{"primary_color":"#1a365d","secondary_color":"#ed8936","fonts":{"heading":"Inter","body":"Open Sans"}}'::jsonb,
        "subscription_tier" varchar(50) DEFAULT 'free',
        "subscription_expires_at" timestamptz,
        "feature_flags" jsonb DEFAULT '{}'::jsonb,
        "created_at" timestamptz DEFAULT NOW(),
        "updated_at" timestamptz DEFAULT NOW()
      )
    `);

        // Create branches table
        await queryRunner.query(`
      CREATE TABLE "branches" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
        "name" varchar(255) NOT NULL,
        "slug" varchar(100) NOT NULL,
        "address" text,
        "city" varchar(100),
        "country" varchar(100),
        "timezone" varchar(50) DEFAULT 'Africa/Nairobi',
        "settings" jsonb DEFAULT '{}'::jsonb,
        "created_at" timestamptz DEFAULT NOW(),
        "updated_at" timestamptz DEFAULT NOW(),
        UNIQUE("tenant_id", "slug")
      )
    `);

        // Create ministries table
        await queryRunner.query(`
      CREATE TABLE "ministries" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
        "branch_id" uuid REFERENCES "branches"("id") ON DELETE CASCADE,
        "name" varchar(255) NOT NULL,
        "slug" varchar(100) NOT NULL,
        "description" text,
        "leader_id" uuid,
        "created_at" timestamptz DEFAULT NOW(),
        "updated_at" timestamptz DEFAULT NOW()
      )
    `);

        // Create design_templates table
        await queryRunner.query(`
      CREATE TABLE "design_templates" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid REFERENCES "tenants"("id") ON DELETE CASCADE,
        "name" varchar(255) NOT NULL,
        "description" text,
        "category" varchar(100) NOT NULL,
        "width" int NOT NULL,
        "height" int NOT NULL,
        "unit" varchar(10) DEFAULT 'px',
        "canvas_json" jsonb NOT NULL,
        "thumbnail_url" text,
        "is_active" boolean DEFAULT true,
        "is_master" boolean DEFAULT false,
        "created_by" uuid NOT NULL,
        "created_at" timestamptz DEFAULT NOW(),
        "updated_at" timestamptz DEFAULT NOW()
      )
    `);

        await queryRunner.query(`
      CREATE INDEX "idx_templates_tenant" ON "design_templates"("tenant_id") 
      WHERE "tenant_id" IS NOT NULL
    `);

        await queryRunner.query(`
      CREATE INDEX "idx_templates_global" ON "design_templates"("id") 
      WHERE "tenant_id" IS NULL
    `);

        // Create user_designs table
        await queryRunner.query(`
      CREATE TABLE "user_designs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
        "branch_id" uuid REFERENCES "branches"("id") ON DELETE CASCADE,
        "template_id" uuid REFERENCES "design_templates"("id") ON DELETE SET NULL,
        "event_id" uuid,
        "name" varchar(255) NOT NULL,
        "canvas_json" jsonb NOT NULL,
        "exports" jsonb DEFAULT '[]'::jsonb,
        "status" varchar(50) DEFAULT 'draft',
        "created_by" uuid NOT NULL,
        "approved_by" uuid,
        "approved_at" timestamptz,
        "created_at" timestamptz DEFAULT NOW(),
        "updated_at" timestamptz DEFAULT NOW()
      )
    `);

        // Create events table
        await queryRunner.query(`
      CREATE TABLE "events" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
        "branch_id" uuid REFERENCES "branches"("id") ON DELETE CASCADE,
        "ministry_id" uuid REFERENCES "ministries"("id") ON DELETE CASCADE,
        "title" varchar(255) NOT NULL,
        "description" text,
        "start_datetime" timestamptz NOT NULL,
        "end_datetime" timestamptz,
        "is_all_day" boolean DEFAULT false,
        "recurrence_rule" text,
        "venue_name" varchar(255),
        "venue_address" text,
        "is_online" boolean DEFAULT false,
        "online_url" text,
        "auto_generate_flyer" boolean DEFAULT true,
        "flyer_template_id" uuid,
        "generated_design_id" uuid,
        "created_by" uuid NOT NULL,
        "created_at" timestamptz DEFAULT NOW(),
        "updated_at" timestamptz DEFAULT NOW()
      )
    `);

        // Create indexes for performance
        await queryRunner.query(`
      CREATE INDEX "idx_branches_tenant" ON "branches"("tenant_id")
    `);

        await queryRunner.query(`
      CREATE INDEX "idx_ministries_tenant" ON "ministries"("tenant_id")
    `);

        await queryRunner.query(`
      CREATE INDEX "idx_ministries_branch" ON "ministries"("branch_id")
    `);

        await queryRunner.query(`
      CREATE INDEX "idx_user_designs_tenant" ON "user_designs"("tenant_id")
    `);

        await queryRunner.query(`
      CREATE INDEX "idx_events_tenant" ON "events"("tenant_id")
    `);

        await queryRunner.query(`
      CREATE INDEX "idx_events_start_date" ON "events"("start_datetime")
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "events" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "user_designs" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "design_templates" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "ministries" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "branches" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "tenants" CASCADE`);
        await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
    }
}
