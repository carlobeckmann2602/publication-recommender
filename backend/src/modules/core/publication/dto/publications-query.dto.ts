import { Field, InputType } from '@nestjs/graphql';

@InputType()
export default class PublicationsQueryDto {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  publisher?: string;
}
