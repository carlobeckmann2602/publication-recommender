import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUser {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field()
  isActive: boolean;
}
