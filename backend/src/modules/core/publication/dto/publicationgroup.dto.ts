import { Field, InputType } from '@nestjs/graphql';
import { IsHexColor, IsOptional, IsString } from 'class-validator';

@InputType()
export class PublicationGroupDto {
  @Field()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string | null;

  @Field({ nullable: true })
  @IsHexColor()
  @IsOptional()
  color?: string | null;
}
