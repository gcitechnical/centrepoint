import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserRole } from '../users/entities/user.entity';

@Controller('studio/templates')
@UseGuards(RolesGuard)
export class TemplatesController {
    constructor(private readonly templatesService: TemplatesService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
    async create(
        @Body() createTemplateDto: CreateTemplateDto,
        @CurrentUser() user: User,
    ) {
        const template = await this.templatesService.create(createTemplateDto, user);
        return {
            message: 'Template created successfully',
            data: template,
        };
    }

    @Get()
    async findAll(
        @CurrentUser() user: User,
        @Query('category') category?: string,
    ) {
        const templates = await this.templatesService.findAll(user, category);
        return {
            message: 'Templates retrieved successfully',
            data: templates,
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @CurrentUser() user: User) {
        const template = await this.templatesService.findOne(id, user);
        return {
            message: 'Template retrieved successfully',
            data: template,
        };
    }

    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
    async update(
        @Param('id') id: string,
        @Body() updateTemplateDto: UpdateTemplateDto,
        @CurrentUser() user: User,
    ) {
        const template = await this.templatesService.update(id, updateTemplateDto, user);
        return {
            message: 'Template updated successfully',
            data: template,
        };
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
    async remove(@Param('id') id: string, @CurrentUser() user: User) {
        await this.templatesService.remove(id, user);
        return {
            message: 'Template deleted successfully',
        };
    }

    @Post(':id/inject')
    async injectData(
        @Param('id') id: string,
        @Body() data: Record<string, any>,
    ) {
        const injectedCanvas = await this.templatesService.injectData(id, data);
        return {
            message: 'Data injected successfully',
            data: injectedCanvas,
        };
    }
}
