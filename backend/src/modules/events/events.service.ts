import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { Ministry } from '../tenants/entities/ministry.entity';

@Injectable()
export class EventsService {
    constructor(
        @InjectRepository(Event)
        private eventRepository: Repository<Event>,
        @InjectRepository(Ministry)
        private ministryRepository: Repository<Ministry>,
        private eventEmitter: EventEmitter2,
    ) { }

    async create(createEventDto: CreateEventDto, user: User): Promise<Event> {
        let required_ministries: Ministry[] = [];

        if (createEventDto.required_ministry_ids?.length) {
            required_ministries = await this.ministryRepository.find({
                where: { id: In(createEventDto.required_ministry_ids) }
            });
        }

        const event = this.eventRepository.create({
            ...createEventDto,
            required_ministries,
            created_by: user.id,
            auto_generate_flyer: createEventDto.auto_generate_flyer ?? true,
        });

        const savedEvent = await this.eventRepository.save(event);

        // Emit event for flyer generation
        if (savedEvent.auto_generate_flyer) {
            this.eventEmitter.emit('event.created', {
                event: savedEvent,
                user,
            });
        }

        return savedEvent;
    }

    async findAll(
        user: User,
        tenantId?: string,
        branchId?: string,
        startDate?: string,
        endDate?: string,
    ): Promise<Event[]> {
        const query = this.eventRepository.createQueryBuilder('event')
            .leftJoinAndSelect('event.tenant', 'tenant')
            .leftJoinAndSelect('event.branch', 'branch')
            .leftJoinAndSelect('event.ministry', 'ministry')
            .leftJoinAndSelect('event.required_ministries', 'required_ministries')
            .orderBy('event.start_datetime', 'ASC');

        // Filter by tenant
        if (tenantId) {
            query.where('event.tenant_id = :tenantId', { tenantId });
        } else if (user.role !== UserRole.SUPER_ADMIN && user.tenant_id) {
            query.where('event.tenant_id = :tenantId', { tenantId: user.tenant_id });
        }

        // Filter by branch
        if (branchId) {
            query.andWhere('event.branch_id = :branchId', { branchId });
        } else if (user.role === UserRole.BRANCH_ADMIN && user.branch_id) {
            query.andWhere('event.branch_id = :branchId', { branchId: user.branch_id });
        }

        // Filter by date range
        if (startDate && endDate) {
            query.andWhere('event.start_datetime BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        }

        return await query.getMany();
    }

    async findOne(id: string, user: User): Promise<Event> {
        const event = await this.eventRepository.findOne({
            where: { id },
            relations: ['tenant', 'branch', 'ministry'],
        });

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        // Check access
        if (user.role !== UserRole.SUPER_ADMIN) {
            if (event.tenant_id !== user.tenant_id) {
                throw new ForbiddenException('You do not have access to this event');
            }

            if (user.role === UserRole.BRANCH_ADMIN && event.branch_id !== user.branch_id) {
                throw new ForbiddenException('You do not have access to this event');
            }
        }

        return event;
    }

    async update(id: string, updateEventDto: UpdateEventDto, user: User): Promise<Event> {
        const event = await this.findOne(id, user);

        // Check permissions
        if (user.role === UserRole.USER && event.created_by !== user.id) {
            throw new ForbiddenException('You can only update your own events');
        }

        Object.assign(event, updateEventDto);
        return await this.eventRepository.save(event);
    }

    async remove(id: string, user: User): Promise<void> {
        const event = await this.findOne(id, user);

        // Check permissions
        if (
            user.role !== UserRole.SUPER_ADMIN &&
            user.role !== UserRole.TENANT_ADMIN &&
            user.role !== UserRole.BRANCH_ADMIN
        ) {
            if (event.created_by !== user.id) {
                throw new ForbiddenException('Insufficient permissions to delete this event');
            }
        }

        await this.eventRepository.remove(event);
    }

    async linkDesign(eventId: string, designId: string, user: User): Promise<Event> {
        const event = await this.findOne(eventId, user);
        event.generated_design_id = designId;
        return await this.eventRepository.save(event);
    }
}
