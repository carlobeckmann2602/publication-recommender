import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, ValidateNested } from 'class-validator';
import { SentenceDto } from './sentence.dto';

@InputType()
export class DescriptorDto {
  @Field(() => [SentenceDto])
  @ArrayMinSize(5)
  @ArrayMaxSize(6)
  @ValidateNested()
  @Type(() => SentenceDto)
  sentences: SentenceDto[];
}
