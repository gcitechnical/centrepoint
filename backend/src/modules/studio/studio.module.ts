import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DesignTemplate } from './entities/design-template.entity';
import { UserDesign } from './entities/user-design.entity';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';
import { DesignsService } from './designs.service';
import { DesignsController } from './designs.controller';

@Module({
    imports: [TypeOrmModule.forFeature([DesignTemplate, UserDesign])],
    controllers: [TemplatesController, DesignsController],
    providers: [TemplatesService, DesignsService],
    exports: [TemplatesService, DesignsService],
})
export class StudioModule { }
