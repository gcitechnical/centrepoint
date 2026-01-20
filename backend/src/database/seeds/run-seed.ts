import { DataSource } from 'typeorm';
import { Tenant } from '../../modules/tenants/entities/tenant.entity';
import { Branch } from '../../modules/tenants/entities/branch.entity';
import { Ministry } from '../../modules/tenants/entities/ministry.entity';
import { User, UserRole, UserStatus } from '../../modules/users/entities/user.entity';
import dataSource from '../data-source';

async function runSeed() {
    console.log('🌱 Starting database seed...\n');

    try {
        // Initialize data source
        await dataSource.initialize();
        console.log('✅ Database connection established\n');

        const tenantRepo = dataSource.getRepository(Tenant);
        const branchRepo = dataSource.getRepository(Branch);
        const ministryRepo = dataSource.getRepository(Ministry);
        const userRepo = dataSource.getRepository(User);

        // 1. Create Gospel Centres International (GCI) Tenant
        console.log('📍 Creating tenant: Gospel Centres International...');
        const gciTenant = tenantRepo.create({
            name: 'Gospel Centres International',
            slug: 'gci',
            logo_url: 'https://placehold.co/200x200/1a365d/ffffff?text=GCI',
            brand_config: {
                primary_color: '#1a365d',
                secondary_color: '#ed8936',
                fonts: {
                    heading: 'Inter',
                    body: 'Open Sans',
                },
            },
            subscription_tier: 'enterprise',
            subscription_expires_at: new Date('2027-12-31'),
            feature_flags: {
                studio: true,
                finance: true,
                people: true,
                events: true,
            },
        });
        await tenantRepo.save(gciTenant);
        console.log(`   ✓ Tenant created: ${gciTenant.name} (${gciTenant.id})\n`);

        // 2. Create Branches
        console.log('🏢 Creating branches...');
        const branches = [
            {
                name: 'Nairobi Headquarters',
                slug: 'nairobi-hq',
                city: 'Nairobi',
                country: 'Kenya',
                address: '123 Uhuru Highway, Nairobi',
                timezone: 'Africa/Nairobi',
            },
            {
                name: 'Mombasa Branch',
                slug: 'mombasa',
                city: 'Mombasa',
                country: 'Kenya',
                address: '456 Moi Avenue, Mombasa',
                timezone: 'Africa/Nairobi',
            },
            {
                name: 'Kisumu Branch',
                slug: 'kisumu',
                city: 'Kisumu',
                country: 'Kenya',
                address: '789 Oginga Odinga Street, Kisumu',
                timezone: 'Africa/Nairobi',
            },
        ];

        const createdBranches: Branch[] = [];
        for (const branchData of branches) {
            const branch = branchRepo.create({
                ...branchData,
                tenant_id: gciTenant.id,
            });
            await branchRepo.save(branch);
            createdBranches.push(branch);
            console.log(`   ✓ Branch created: ${branch.name}`);
        }
        console.log('');

        // 3. Create Ministries
        console.log('⛪ Creating ministries...');
        const ministries = [
            { name: 'Youth Ministry', slug: 'youth', description: 'Ministry for young people' },
            { name: 'Media Ministry', slug: 'media', description: 'Audio/Visual and content creation' },
            { name: 'Worship Ministry', slug: 'worship', description: 'Music and worship team' },
            { name: 'Children Ministry', slug: 'children', description: 'Sunday school and kids programs' },
            { name: 'Outreach Ministry', slug: 'outreach', description: 'Community outreach and evangelism' },
        ];

        for (const branch of createdBranches) {
            for (const ministryData of ministries) {
                const ministry = ministryRepo.create({
                    ...ministryData,
                    tenant_id: gciTenant.id,
                    branch_id: branch.id,
                });
                await ministryRepo.save(ministry);
            }
            console.log(`   ✓ Created ${ministries.length} ministries for ${branch.name}`);
        }
        console.log('');

        // 4. Create Users
        console.log('👥 Creating users...');

        // Super Admin
        const superAdmin = userRepo.create({
            first_name: 'Super',
            last_name: 'Admin',
            email: 'admin@churchcentrepoint.com',
            password: 'Admin@123',
            role: UserRole.SUPER_ADMIN,
            status: UserStatus.ACTIVE,
            email_verified_at: new Date(),
        });
        await userRepo.save(superAdmin);
        console.log(`   ✓ Super Admin: ${superAdmin.email}`);

        // GCI Tenant Admin
        const gciAdmin = userRepo.create({
            first_name: 'John',
            last_name: 'Doe',
            email: 'admin@gci.org',
            password: 'GCI@Admin123',
            role: UserRole.TENANT_ADMIN,
            status: UserStatus.ACTIVE,
            tenant_id: gciTenant.id,
            email_verified_at: new Date(),
        });
        await userRepo.save(gciAdmin);
        console.log(`   ✓ GCI Admin: ${gciAdmin.email}`);

        // Branch Admins
        for (const branch of createdBranches) {
            const branchAdmin = userRepo.create({
                first_name: branch.city,
                last_name: 'Admin',
                email: `admin@${branch.slug}.gci.org`,
                password: 'Branch@123',
                role: UserRole.BRANCH_ADMIN,
                status: UserStatus.ACTIVE,
                tenant_id: gciTenant.id,
                branch_id: branch.id,
                email_verified_at: new Date(),
            });
            await userRepo.save(branchAdmin);
            console.log(`   ✓ Branch Admin (${branch.name}): ${branchAdmin.email}`);
        }

        // Regular Users
        const regularUsers = [
            {
                first_name: 'Jane',
                last_name: 'Smith',
                email: 'jane.smith@gci.org',
                branch_id: createdBranches[0].id,
            },
            {
                first_name: 'Peter',
                last_name: 'Omondi',
                email: 'peter.omondi@gci.org',
                branch_id: createdBranches[1].id,
            },
        ];

        for (const userData of regularUsers) {
            const user = userRepo.create({
                ...userData,
                password: 'User@123',
                role: UserRole.USER,
                status: UserStatus.ACTIVE,
                tenant_id: gciTenant.id,
                email_verified_at: new Date(),
            });
            await userRepo.save(user);
            console.log(`   ✓ User: ${user.email}`);
        }

        console.log('\n✨ Seed completed successfully!\n');
        console.log('📝 Test Credentials:');
        console.log('   Super Admin: admin@churchcentrepoint.com / Admin@123');
        console.log('   GCI Admin: admin@gci.org / GCI@Admin123');
        console.log('   Nairobi Branch Admin: admin@nairobi-hq.gci.org / Branch@123');
        console.log('   Regular User: jane.smith@gci.org / User@123\n');

        await dataSource.destroy();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        await dataSource.destroy();
        process.exit(1);
    }
}

runSeed();
