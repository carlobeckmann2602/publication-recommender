import { Type } from 'class-transformer';
import { IsArray, IsDefined, IsNotEmpty, IsOptional, IsString, Validate } from 'class-validator';
import { IsDescriptorDto } from '../validators/descriptor-dto.validator';
import { DescriptorDto } from './descriptor.dto';

export class CreatePublicationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  exId: string;

  @IsOptional()
  @IsString()
  doi?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  publisher?: string;

  @IsArray()
  @IsString({ each: true })
  authors: string[] = [];

  @IsOptional()
  @Type(() => Date)
  date?: Date;

  @IsDefined()
  @Validate(IsDescriptorDto)
  descriptor: DescriptorDto;
}
