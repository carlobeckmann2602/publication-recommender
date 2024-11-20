import { Field, Float, ObjectType } from '@nestjs/graphql';
import { Publication } from '../entities/publication.entity';
import { SourceVo } from '../vo/source.vo';
import { EmbeddingResponseDto } from './embedding-response.dto';

@ObjectType()
export class PublicationResponseDto {
  constructor(publication: Publication) {
    this.id = publication.id;
    this.title = publication.title;
    this.exId = publication.exId;
    this.source = publication.source;
    this.doi = publication.doi;
    this.url = publication.url;
    this.authors = publication.authors ? publication.authors.map((author) => author.name) : null;
    this.publicationDate = publication.date;
    this.abstract = publication.abstract;
    this.coordinate = publication.coordinate;
    this.embeddings = publication.embeddings.map((embedding) => new EmbeddingResponseDto(embedding));
  }

  @Field()
  id: string;

  @Field()
  title: string;

  @Field(() => [String])
  doi: string[];

  @Field()
  exId: string;

  @Field(() => SourceVo)
  source: SourceVo;

  @Field({ nullable: true })
  url: string | null;

  @Field(() => [String], { nullable: true })
  authors: string[] | null;

  @Field({ nullable: true })
  publicationDate: Date | null;

  @Field()
  isFavorite: boolean = false;

  @Field({ nullable: true })
  abstract: string | null;

  @Field(() => [Float], { nullable: true })
  coordinate: number[] | null;

  @Field(() => [EmbeddingResponseDto])
  embeddings: EmbeddingResponseDto[];
}
