import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class PublicationChunkRequestDto {
  @Field(() => Int)
  chunk: number;

  @Field(() => Int, { nullable: true })
  chunkSize: number = 100;
}
