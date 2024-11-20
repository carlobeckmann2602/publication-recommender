import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SuccessResponseDto {
  constructor(success: boolean) {
    this.success = success;
  }

  @Field()
  success: boolean;
}
