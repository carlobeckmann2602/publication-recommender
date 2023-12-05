import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsArray, IsOptional, IsString, IsUrl } from 'class-validator';
import { SourceVo } from '../vo/source.vo';
import { DescriptorDto } from './descriptor.dto';

registerEnumType(SourceVo, { name: 'PublicationSource' });

@InputType()
export class CreatePublicationDto {
  @Field()
  title: string;

  @Field()
  exId: string;

  @Field(() => SourceVo)
  source: SourceVo;

  @Field({ nullable: true })
  doi?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  url?: string;

  @Field({ nullable: true })
  publisher?: string;

  @Field({ nullable: true })
  abstract?: string;

  @Field((of) => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  authors: string[] = [];

  @Field({ nullable: true })
  date?: Date;

  @Field((type) => DescriptorDto)
  descriptor: DescriptorDto;
}
