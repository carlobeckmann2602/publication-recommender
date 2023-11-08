import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsDefined, IsEmail } from 'class-validator';

@InputType()
export class LoginDto {
  @Field()
  @IsDefined({
    message: 'Email is required',
  })
  @IsEmail()
  @Transform((params) => params.value.toLowerCase())
  email: string;

  @Field()
  @IsDefined({
    message: 'Password is required',
  })
  password: string;
}
