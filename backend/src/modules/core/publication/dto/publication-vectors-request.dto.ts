import { IsNumber } from 'class-validator';

export class PublicationVectorsRequestDto {
  @IsNumber()
  chunk: number;

  @IsNumber()
  chunkSize: number = 100;
}
