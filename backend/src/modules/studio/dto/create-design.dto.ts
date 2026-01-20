import { IsNotEmpty, IsString, IsOptional, IsObject, IsEnum, IsUUID } from 'class-validator';

export enum DesignStatus {
    DRAFT = 'draft',
    PENDING_APPROVAL = 'pending_approval',
    APPROVED = 'approved',
    PUBLISHED = 'published',
}

export class CreateDesignDto {
    @IsNotEmpty()
    @IsUUID()
    tenant_id: string;

    @IsOptional()
    @IsUUID()
    branch_id?: string;

    @IsOptional()
    @IsUUID()
    template_id?: string;

    @IsOptional()
    @IsUUID()
    event_id?: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsObject()
    canvas_json: Record<string, any>;

    @IsOptional()
    @IsEnum(DesignStatus)
    status?: DesignStatus;
}
