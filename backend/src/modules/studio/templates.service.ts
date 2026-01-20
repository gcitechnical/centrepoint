import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DesignTemplate } from './entities/design-template.entity';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class TemplatesService {
    constructor(
        @InjectRepository(DesignTemplate)
        private templateRepository: Repository<DesignTemplate>,
    ) { }

    async create(createTemplateDto: CreateTemplateDto, user: User): Promise<DesignTemplate> {
        // Process canvas JSON to add locking metadata if not present
        const processedCanvas = this.processCanvasForLocking(createTemplateDto.canvas_json);

        const template = this.templateRepository.create({
            ...createTemplateDto,
            canvas_json: processedCanvas,
            created_by: user.id,
            tenant_id: createTemplateDto.tenant_id || (null as any),
        });

        return await this.templateRepository.save(template);
    }

    async findAll(user: User, category?: string): Promise<DesignTemplate[]> {
        const query = this.templateRepository.createQueryBuilder('template')
            .where('template.is_active = :isActive', { isActive: true })
            .orderBy('template.created_at', 'DESC');

        // Filter by category
        if (category) {
            query.andWhere('template.category = :category', { category });
        }

        // Super admins see all templates
        if (user.role === UserRole.SUPER_ADMIN) {
            return await query.getMany();
        }

        // Others see global templates + their tenant's templates
        query.andWhere(
            '(template.tenant_id IS NULL OR template.tenant_id = :tenantId)',
            { tenantId: user.tenant_id },
        );

        return await query.getMany();
    }

    async findOne(id: string, user: User): Promise<DesignTemplate> {
        const template = await this.templateRepository.findOne({
            where: { id },
            relations: ['tenant'],
        });

        if (!template) {
            throw new NotFoundException('Template not found');
        }

        // Check access
        if (user.role !== UserRole.SUPER_ADMIN) {
            if (template.tenant_id && template.tenant_id !== user.tenant_id) {
                throw new ForbiddenException('You do not have access to this template');
            }
        }

        return template;
    }

    async update(id: string, updateTemplateDto: UpdateTemplateDto, user: User): Promise<DesignTemplate> {
        const template = await this.findOne(id, user);

        // Only super admins and tenant admins can update templates
        if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.TENANT_ADMIN) {
            throw new ForbiddenException('Insufficient permissions to update templates');
        }

        // Tenant admins can only update their own tenant's templates
        if (user.role === UserRole.TENANT_ADMIN && template.tenant_id !== user.tenant_id) {
            throw new ForbiddenException('You can only update your own tenant templates');
        }

        // Process canvas if updated
        if (updateTemplateDto.canvas_json) {
            updateTemplateDto.canvas_json = this.processCanvasForLocking(updateTemplateDto.canvas_json);
        }

        Object.assign(template, updateTemplateDto);
        return await this.templateRepository.save(template);
    }

    async remove(id: string, user: User): Promise<void> {
        const template = await this.findOne(id, user);

        // Only super admins and tenant admins can delete
        if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.TENANT_ADMIN) {
            throw new ForbiddenException('Insufficient permissions to delete templates');
        }

        // Soft delete by setting is_active to false
        template.is_active = false;
        await this.templateRepository.save(template);
    }

    /**
     * Process canvas JSON to ensure locking metadata is present
     * Adds _cp_* properties to objects if not already set
     */
    private processCanvasForLocking(canvasJson: any): any {
        if (!canvasJson.objects || !Array.isArray(canvasJson.objects)) {
            return canvasJson;
        }

        const processedObjects = canvasJson.objects.map((obj: any) => {
            // If object doesn't have _cp_zone, default to 'safe' (editable)
            if (!obj._cp_zone) {
                obj._cp_zone = 'safe';
                obj._cp_locked = false;
            }

            // If marked as protected, ensure all lock properties are set
            if (obj._cp_zone === 'protected' || obj._cp_locked === true) {
                obj._cp_locked = true;
                obj._cp_zone = 'protected';
                obj.selectable = false;
                obj.evented = false;
                obj.hasControls = false;
                obj.lockMovementX = true;
                obj.lockMovementY = true;
                obj.lockScalingX = true;
                obj.lockScalingY = true;
                obj.lockRotation = true;
            }

            return obj;
        });

        return {
            ...canvasJson,
            objects: processedObjects,
        };
    }

    /**
     * Inject data into template variables
     * Replaces {{variable}} with actual values
     */
    async injectData(templateId: string, data: Record<string, any>): Promise<any> {
        const template = await this.templateRepository.findOne({ where: { id: templateId } });

        if (!template) {
            throw new NotFoundException('Template not found');
        }

        let canvasString = JSON.stringify(template.canvas_json);

        // Replace all {{key}} with data[key]
        for (const [key, value] of Object.entries(data)) {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            canvasString = canvasString.replace(regex, String(value));
        }

        return JSON.parse(canvasString);
    }
}
