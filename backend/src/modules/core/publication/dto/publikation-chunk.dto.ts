import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PublicationChunkDto {
  @Field(() => Int)
  chunk: number;

  @Field(() => [PublicationChunkDataDto])
  data: PublicationChunkDataDto[];
}

@ObjectType()
class PublicationChunkDataDto {
  @Field()
  id: string;
  @Field(() => [[Float]])
  vectors: number[][];
}
