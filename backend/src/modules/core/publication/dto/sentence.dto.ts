import { Expose } from 'class-transformer';

export class SentenceDto {
  @Expose()
  value: string;

  @Expose()
  vector: number[];
}
