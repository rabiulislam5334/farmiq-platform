

import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateFarmDto {
  @IsString()
  name: string;

  @IsString()
  location: string;

  @IsNumber()
  @Min(0)
  area: number;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;
}

export class UpdateFarmDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  area?: number;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;
}