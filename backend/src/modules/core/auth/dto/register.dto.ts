import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsDefined, IsEmail, MinLength } from 'class-validator';

@InputType()
export class RegisterDto {
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
  @MinLength(8)
  password: string;
}
