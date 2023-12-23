import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class JwtDto {
  @Field()
  public accessToken: string;
  @Field()
  public refreshToken: string;
  @Field(() => Int)
  public expiresIn: number;

  constructor(accessToken: string, refreshToken: string, expiresIn: number) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresIn = expiresIn;
  }
}
