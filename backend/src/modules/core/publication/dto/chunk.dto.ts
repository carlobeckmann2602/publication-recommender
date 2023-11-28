import { Type } from '@nestjs/common';
import { Field, ObjectType } from '@nestjs/graphql';

export function createChunkDto<T>(input: Type<T>) {
  @ObjectType({ isAbstract: true })
  class ChunkDto<T> {
    @Field((type) => input)
    data: T[];

    @Field()
    chunk: number;
  }
  return ChunkDto<T>;
}
