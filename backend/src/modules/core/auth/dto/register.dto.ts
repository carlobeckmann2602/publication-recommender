import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsDefined, IsEmail, IsNotEmpty, MinLength } from 'class-validator';

@InputType()
export class RegisterDto {
  @Field()
  @IsDefined()
  @IsEmail()
  @Transform((params) => params.value.toLowerCase())
  email: string;

  @Field()
  @IsDefined()
  @MinLength(8)
  password: string;

  @Field()
  @IsDefined()
  @IsNotEmpty()
  name: string;
}
