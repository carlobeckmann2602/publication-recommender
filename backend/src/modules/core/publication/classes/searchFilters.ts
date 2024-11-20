import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsArray, IsOptional } from 'class-validator';

@InputType()
@ObjectType()
export class SearchFilters {
  constructor(title?: string, author?: string, years?: string[], doi?: string) {
    this.title = title;
    this.author = author;
    this.years = years;
    this.doi = doi;
  }

  @Field(() => String, { nullable: true })
  @IsOptional()
  title?: string;
  @Field(() => String, { nullable: true })
  @IsOptional()
  author?: string;
  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  years?: string[];
  @Field(() => String, { nullable: true })
  @IsOptional()
  doi?: string;
}
