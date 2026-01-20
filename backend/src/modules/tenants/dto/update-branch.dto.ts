import { PartialType } from '@nestjs/mapped-types';
import { CreateBranchDto } from './create-branch.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateBranchDto extends PartialType(CreateBranchDto) {
    @IsOptional()
    @IsUUID()
    tenant_id?: string;
}
