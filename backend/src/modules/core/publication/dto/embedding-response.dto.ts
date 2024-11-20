import { Field, Float, ObjectType } from '@nestjs/graphql';
import { Embedding } from '../entities/embedding.entity';

@ObjectType()
export class EmbeddingResponseDto {
  constructor(embedding: Embedding) {
    this.text = embedding.text;
    this.vector = JSON.parse(embedding.vector);
    this.id = embedding.id;
  }

  @Field()
  id: string;

  @Field()
  text: string;

  @Field(() => [Float])
  vector: number[];
}
