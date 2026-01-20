import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsDateString, IsUUID, IsArray } from 'class-validator';

export class CreateEventDto {
    @IsNotEmpty()
    @IsUUID()
    tenant_id: string;

    @IsOptional()
    @IsUUID()
    branch_id?: string;

    @IsOptional()
    @IsUUID()
    ministry_id?: string;

    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    required_ministry_ids?: string[];
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty()
    @IsDateString()
    start_datetime: string;

    @IsOptional()
    @IsDateString()
    end_datetime?: string;

    @IsOptional()
    @IsBoolean()
    is_all_day?: boolean;

    @IsOptional()
    @IsString()
    recurrence_rule?: string;

    @IsOptional()
    @IsString()
    venue_name?: string;

    @IsOptional()
    @IsString()
    venue_address?: string;

    @IsOptional()
    @IsBoolean()
    is_online?: boolean;

    @IsOptional()
    @IsString()
    online_url?: string;

    @IsOptional()
    @IsBoolean()
    auto_generate_flyer?: boolean;

    @IsOptional()
    @IsUUID()
    flyer_template_id?: string;
}
