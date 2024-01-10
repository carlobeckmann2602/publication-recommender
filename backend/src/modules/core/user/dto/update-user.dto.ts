import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength} from 'class-validator';

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
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}
