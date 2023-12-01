import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PublicationVectorsDto {
  @Field()
  id: string;

  @Field((type) => [[Float]], { nullable: true })
  vectors: number[][];
}
