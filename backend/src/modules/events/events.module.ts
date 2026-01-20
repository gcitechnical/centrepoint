import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { DesignTemplate } from '../studio/entities/design-template.entity';
import { UserDesign } from '../studio/entities/user-design.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { FlyerGenerationListener } from './listeners/flyer-generation.listener';

@Module({
    imports: [
        TypeOrmModule.forFeature([Event, DesignTemplate, UserDesign, Tenant]),
    ],
    controllers: [EventsController],
    providers: [EventsService, FlyerGenerationListener],
    exports: [EventsService],
})
export class EventsModule { }
