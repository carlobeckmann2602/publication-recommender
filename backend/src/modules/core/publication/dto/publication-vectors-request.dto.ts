import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class PublicationVectorsRequestDto {
  @Field((type) => Int)
  chunk: number;

  @Field((type) => Int, { nullable: true })
  chunkSize: number = 100;
}
