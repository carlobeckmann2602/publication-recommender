import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PublicationChunkDto {
  @Field((type) => Int)
  chunk: number;

  @Field((type) => [PublicationChunkDataDto])
  data: PublicationChunkDataDto[];
}

@ObjectType()
class PublicationChunkDataDto {
  @Field()
  id: string;
  @Field((type) => [[Float]])
  vectors: number[][];
}
