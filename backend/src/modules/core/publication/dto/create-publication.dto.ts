import { Type } from 'class-transformer';
import { IsArray, IsDate, IsDefined, IsIn, IsNotEmpty, IsOptional, IsString, IsUrl, Validate } from 'class-validator';
import { IsDescriptorDto } from '../validators/descriptor-dto.validator';
import { SourceVo } from '../vo/source.vo';
import { DescriptorDto } from './descriptor.dto';

export class CreatePublicationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  exId: string;

  @IsString()
  @IsIn(SourceVo.getAvailableValues())
  source: string;

  @IsOptional()
  @IsString()
  doi?: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  publisher?: string;

  @IsOptional()
  @IsString()
  abstract?: string;

  @IsArray()
  @IsString({ each: true })
  authors: string[] = [];

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date?: Date;

  @IsDefined()
  @Validate(IsDescriptorDto)
  @Type(() => DescriptorDto)
  descriptor: DescriptorDto;
}
