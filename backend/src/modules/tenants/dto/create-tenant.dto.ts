import { IsNotEmpty, IsString, IsOptional, IsObject, IsEnum, IsDateString } from 'class-validator';

export class CreateTenantDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    slug: string;

    @IsOptional()
    @IsString()
    logo_url?: string;

    @IsOptional()
    @IsObject()
    brand_config?: {
        primary_color: string;
        secondary_color: string;
        fonts: {
            heading: string;
            body: string;
        };
    };

    @IsOptional()
    @IsString()
    subscription_tier?: string;

    @IsOptional()
    @IsDateString()
    subscription_expires_at?: string;

    @IsOptional()
    @IsObject()
    feature_flags?: Record<string, boolean>;
}
