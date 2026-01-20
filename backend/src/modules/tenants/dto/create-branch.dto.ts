import { IsNotEmpty, IsString, IsOptional, IsObject, IsUUID } from 'class-validator';

export class CreateBranchDto {
    @IsNotEmpty()
    @IsUUID()
    tenant_id: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    slug: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    timezone?: string;

    @IsOptional()
    @IsObject()
    settings?: Record<string, any>;
}
