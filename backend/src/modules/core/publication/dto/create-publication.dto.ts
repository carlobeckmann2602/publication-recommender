import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { SourceVo } from '../vo/source.vo';
import { DescriptorDto } from './descriptor.dto';

@InputType()
export class CreatePublicationDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  exId: string;

  @Field(() => SourceVo)
  @IsEnum(SourceVo)
  source: SourceVo;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  doi?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  url?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  publisher?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  abstract?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  authors?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  date?: Date;

  @Field(() => DescriptorDto)
  @ValidateNested()
  @Type(() => DescriptorDto)
  descriptor: DescriptorDto;
}
