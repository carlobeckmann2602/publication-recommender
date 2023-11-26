import { Expose, Type } from 'class-transformer';
import { SentenceDto } from './sentence.dto';

export class DescriptorDto {
  @Expose()
  @Type(() => SentenceDto)
  sentences: SentenceDto[];
}
