import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class JwtDto {
  @Field()
  public accessToken: string;
  @Field()
  public refreshToken: string;

  constructor(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}
