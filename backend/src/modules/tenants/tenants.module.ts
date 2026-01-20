import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { Branch } from './entities/branch.entity';
import { Ministry } from './entities/ministry.entity';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { BranchesService } from './branches.service';
import { BranchesController } from './branches.controller';
import { MinistriesService } from './ministries.service';
import { MinistriesController } from './ministries.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Tenant, Branch, Ministry])],
    controllers: [TenantsController, BranchesController, MinistriesController],
    providers: [TenantsService, BranchesService, MinistriesService],
    exports: [TenantsService, BranchesService, MinistriesService],
})
export class TenantsModule { }
