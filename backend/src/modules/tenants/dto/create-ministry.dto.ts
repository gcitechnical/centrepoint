import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateMinistryDto {
    @IsNotEmpty()
    @IsUUID()
    tenant_id: string;

    @IsOptional()
    @IsUUID()
    branch_id?: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    slug: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsUUID()
    leader_id?: string;
}
