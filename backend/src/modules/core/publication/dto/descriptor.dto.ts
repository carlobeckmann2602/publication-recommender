import { Field, InputType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { SentenceDto } from './sentence.dto';

@InputType()
export class DescriptorDto {
  @Field(() => [SentenceDto])
  @Expose()
  sentences: SentenceDto[];
}
