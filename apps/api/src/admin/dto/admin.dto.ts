import {
  IsString,
  IsNumber,
  IsPositive,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMarketPriceDto {
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  cropName: string;

  @IsNumber()
  @IsPositive()
  minPrice: number;

  @IsNumber()
  @IsPositive()
  maxPrice: number;

  @IsNumber()
  @IsPositive()
  avgPrice: number;

  @IsString()
  @IsNotEmpty()
  unit: string;
}

export class UserListQueryDto {
  @IsOptional()
  @IsIn(['FARMER', 'BUYER', 'AGRONOMIST', 'ADMIN'])
  role?: string;

  // Name বা email এ search করে
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isBanned?: boolean;

  @IsOptional()
  @IsIn(['createdAt', 'name', 'email'])
  sortBy?: 'createdAt' | 'name' | 'email' = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 20;
}

export class MarketPriceQueryDto {
  @IsOptional()
  @IsString()
  categoryId?: string;

  // Crop নাম দিয়ে search করে
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['createdAt', 'date', 'avgPrice', 'cropName'])
  sortBy?: 'createdAt' | 'date' | 'avgPrice' | 'cropName' = 'date';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 20;
}
