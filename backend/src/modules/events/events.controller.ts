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
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserRole } from '../users/entities/user.entity';

@Controller('events')
@UseGuards(RolesGuard)
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Post()
    async create(
        @Body() createEventDto: CreateEventDto,
        @CurrentUser() user: User,
    ) {
        const event = await this.eventsService.create(createEventDto, user);
        return {
            message: 'Event created successfully',
            data: event,
        };
    }

    @Get()
    async findAll(
        @CurrentUser() user: User,
        @Query('tenant_id') tenantId?: string,
        @Query('branch_id') branchId?: string,
        @Query('start_date') startDate?: string,
        @Query('end_date') endDate?: string,
    ) {
        const events = await this.eventsService.findAll(
            user,
            tenantId,
            branchId,
            startDate,
            endDate,
        );
        return {
            message: 'Events retrieved successfully',
            data: events,
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @CurrentUser() user: User) {
        const event = await this.eventsService.findOne(id, user);
        return {
            message: 'Event retrieved successfully',
            data: event,
        };
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateEventDto: UpdateEventDto,
        @CurrentUser() user: User,
    ) {
        const event = await this.eventsService.update(id, updateEventDto, user);
        return {
            message: 'Event updated successfully',
            data: event,
        };
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.BRANCH_ADMIN)
    async remove(@Param('id') id: string, @CurrentUser() user: User) {
        await this.eventsService.remove(id, user);
        return {
            message: 'Event deleted successfully',
        };
    }

    @Post(':id/link-design/:designId')
    async linkDesign(
        @Param('id') id: string,
        @Param('designId') designId: string,
        @CurrentUser() user: User,
    ) {
        const event = await this.eventsService.linkDesign(id, designId, user);
        return {
            message: 'Design linked to event successfully',
            data: event,
        };
    }
}
