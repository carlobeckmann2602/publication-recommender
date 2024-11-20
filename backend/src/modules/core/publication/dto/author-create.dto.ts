import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class AuthorCreateDto {
  @Field()
  name: string;
}
