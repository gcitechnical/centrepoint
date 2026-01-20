import { DataSource } from 'typeorm';
import { DesignTemplate } from '../../modules/studio/entities/design-template.entity';
import { User } from '../../modules/users/entities/user.entity';
import { Tenant } from '../../modules/tenants/entities/tenant.entity';
import dataSource from '../data-source';

async function seedTemplates() {
    console.log('🎨 Seeding design templates...\n');
    await dataSource.initialize();

    const templateRepo = dataSource.getRepository(DesignTemplate);
    const tenantRepo = dataSource.getRepository(Tenant);
    const userRepo = dataSource.getRepository(User);

    // Find GCI tenant
    const gci = await tenantRepo.findOne({ where: { slug: 'gci' } });
    if (!gci) {
        console.error('GCI tenant not found. Run main seed first.');
        process.exit(1);
    }

    // Find Admin User (created_by)
    const admin = await userRepo.findOne({ where: { email: 'admin@gci.org' } });
    if (!admin) {
        console.error('Admin user not found.');
        process.exit(1);
    }

    // Default Canvas JSON (A simple flyer)
    const flyerJson = {
        version: "5.3.0",
        objects: [
            {
                type: "rect",
                left: 0,
                top: 0,
                width: 800,
                height: 1000,
                fill: "#1a365d", // GCI Primary Color
                selectable: false,
                _cp_locked: true,
                _cp_role: "background"
            },
            {
                type: "text",
                left: 400,
                top: 100,
                originX: "center",
                text: "SUNDAY SERVICE",
                fill: "#ffffff",
                fontFamily: "Inter",
                fontSize: 60,
                fontWeight: "bold",
                _cp_locked: true // Header locked
            },
            {
                type: "text",
                left: 400,
                top: 300,
                originX: "center",
                text: "{{event.title}}", // Variable to inject
                fill: "#ed8936", // Secondary color
                fontFamily: "Inter",
                fontSize: 80,
                fontWeight: "bold",
                editable: true,
                _cp_role: "title",
                _cp_data_binding: "event.title"
            },
            {
                type: "text",
                left: 400,
                top: 500,
                originX: "center",
                text: "{{event.date}} @ {{event.time}}",
                fill: "#ffffff",
                fontFamily: "Open Sans",
                fontSize: 40,
                _cp_data_binding: "event.start_datetime"
            },
            {
                type: "text",
                left: 400,
                top: 600,
                originX: "center",
                text: "{{event.venue}}",
                fill: "#cccccc",
                fontFamily: "Open Sans",
                fontSize: 30,
                _cp_data_binding: "event.venue_name"
            }
        ]
    };

    const template = templateRepo.create({
        name: 'GCI Sunday Service Default',
        category: 'event', // Changed enum to string
        canvas_json: flyerJson,
        thumbnail_url: 'https://placehold.co/400x500/1a365d/ffffff?text=Sunday+Service',
        // is_global: false, // Removed
        tenant_id: gci.id,
        is_active: true,
        width: 800,
        height: 1000,
        created_by: admin.id
    });

    await templateRepo.save(template);
    console.log(`   ✓ Created template: ${template.name}`);

    await dataSource.destroy();
    console.log('\n✨ Template seed completed!');
}

seedTemplates();
