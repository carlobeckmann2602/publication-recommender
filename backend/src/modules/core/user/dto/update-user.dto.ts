import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsDefined, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, ValidateIf, isString } from 'class-validator';

@InputType()
export class UpdateUserDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  @Transform((params) => params.value.toLowerCase().trim())
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @Field({ nullable: true })
  @ValidateIf((o) => isString(o.password))
  @IsDefined()
  @IsString()
  oldPassword?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}
