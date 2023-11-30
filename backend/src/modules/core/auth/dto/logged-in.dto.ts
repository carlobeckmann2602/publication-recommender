import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';
import { JwtDto } from './jwt.dto';

@ObjectType()
export class LoggedIn {
  @Field(() => JwtDto)
  jwt: JwtDto;

  @Field(() => User)
  user: User;
}
