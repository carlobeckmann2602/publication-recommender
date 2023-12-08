import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PublicationVectorsDto {
  @Field()
  id: string;

  @Field(() => [[Float]], { nullable: true })
  vectors: number[][];
}
