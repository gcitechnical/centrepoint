import { IsNotEmpty, IsString, IsOptional, IsInt, IsBoolean, IsObject, IsEnum, IsUUID } from 'class-validator';

export enum TemplateCategory {
    FLYER = 'flyer',
    BULLETIN = 'bulletin',
    SOCIAL_MEDIA = 'social_media',
    BANNER = 'banner',
    CERTIFICATE = 'certificate',
}

export class CreateTemplateDto {
    @IsOptional()
    @IsUUID()
    tenant_id?: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty()
    @IsEnum(TemplateCategory)
    category: TemplateCategory;

    @IsNotEmpty()
    @IsInt()
    width: number;

    @IsNotEmpty()
    @IsInt()
    height: number;

    @IsOptional()
    @IsString()
    unit?: string;

    @IsNotEmpty()
    @IsObject()
    canvas_json: Record<string, any>;

    @IsOptional()
    @IsString()
    thumbnail_url?: string;

    @IsOptional()
    @IsBoolean()
    is_master?: boolean;
}
