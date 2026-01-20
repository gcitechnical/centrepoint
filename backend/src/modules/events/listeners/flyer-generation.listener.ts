import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../entities/event.entity';
import { DesignTemplate } from '../../studio/entities/design-template.entity';
import { UserDesign } from '../../studio/entities/user-design.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';

interface EventCreatedPayload {
    event: Event;
    user: User;
}

@Injectable()
export class FlyerGenerationListener {
    private readonly logger = new Logger(FlyerGenerationListener.name);

    constructor(
        @InjectRepository(Event)
        private eventRepository: Repository<Event>,
        @InjectRepository(DesignTemplate)
        private templateRepository: Repository<DesignTemplate>,
        @InjectRepository(UserDesign)
        private designRepository: Repository<UserDesign>,
        @InjectRepository(Tenant)
        private tenantRepository: Repository<Tenant>,
    ) { }

    @OnEvent('event.created')
    async handleEventCreated(payload: EventCreatedPayload) {
        const { event, user } = payload;

        this.logger.log(`Event created: ${event.title} (${event.id})`);

        try {
            // 1. Select appropriate template
            const template = await this.selectTemplate(event);

            if (!template) {
                this.logger.warn(`No template found for event ${event.id}`);
                return;
            }

            // 2. Get tenant for branding
            const tenant = await this.tenantRepository.findOne({
                where: { id: event.tenant_id },
            });

            if (!tenant) {
                this.logger.error(`Tenant not found for event ${event.id}`);
                return;
            }

            // 3. Inject event data into template
            const processedCanvas = this.injectEventData(
                template.canvas_json,
                event,
                tenant,
            );

            // 4. Create user design
            const design = this.designRepository.create({
                tenant_id: event.tenant_id,
                branch_id: event.branch_id,
                template_id: template.id,
                event_id: event.id,
                name: `Flyer: ${event.title}`,
                canvas_json: processedCanvas,
                status: 'draft',
                created_by: user.id,
            });

            const savedDesign = await this.designRepository.save(design);

            // 5. Link design to event
            event.generated_design_id = savedDesign.id;
            await this.eventRepository.save(event);

            this.logger.log(
                `Flyer generated for event ${event.id}: Design ${savedDesign.id}`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to generate flyer for event ${event.id}:`,
                error,
            );
        }
    }

    private async selectTemplate(event: Event): Promise<DesignTemplate | null> {
        // Priority: 1. Event's specified template, 2. Tenant's flyer template, 3. Global flyer template

        if (event.flyer_template_id) {
            return await this.templateRepository.findOne({
                where: { id: event.flyer_template_id },
            });
        }

        // Try tenant-specific flyer template
        const tenantTemplate = await this.templateRepository.findOne({
            where: {
                tenant_id: event.tenant_id,
                category: 'event',
                is_active: true,
            },
            order: { created_at: 'DESC' },
        });

        if (tenantTemplate) {
            return tenantTemplate;
        }

        // Fallback to global flyer template
        return await this.templateRepository.findOne({
            where: {
                tenant_id: null as any,
                category: 'event',
                is_active: true,
            },
            order: { created_at: 'DESC' },
        });
    }

    private injectEventData(
        canvasJson: any,
        event: Event,
        tenant: Tenant,
    ): any {
        let jsonString = JSON.stringify(canvasJson);

        // Event data
        const eventData = {
            'event.title': event.title,
            'event.description': event.description || '',
            'event.date': this.formatDate(event.start_datetime),
            'event.time': this.formatTime(event.start_datetime),
            'event.formatted_date': this.formatFullDate(event.start_datetime),
            'event.venue': event.venue_name || '',
            'event.venue_address': event.venue_address || '',
            'event.online_url': event.online_url || '',
        };

        // Tenant branding
        const tenantData = {
            'tenant.name': tenant.name,
            'tenant.logo_url': tenant.logo_url || '',
            'tenant.brand_config.primary_color':
                tenant.brand_config?.primary_color || '#1a365d',
            'tenant.brand_config.secondary_color':
                tenant.brand_config?.secondary_color || '#ed8936',
            'tenant.brand_config.fonts.heading':
                tenant.brand_config?.fonts?.heading || 'Inter',
            'tenant.brand_config.fonts.body':
                tenant.brand_config?.fonts?.body || 'Open Sans',
        };

        // Replace all variables
        const allData = { ...eventData, ...tenantData };
        for (const [key, value] of Object.entries(allData)) {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            jsonString = jsonString.replace(regex, String(value));
        }

        return JSON.parse(jsonString);
    }

    private formatDate(datetime: Date): string {
        return new Date(datetime).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }

    private formatTime(datetime: Date): string {
        return new Date(datetime).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    }

    private formatFullDate(datetime: Date): string {
        return new Date(datetime).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    }
}
