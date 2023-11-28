import { ObjectType } from '@nestjs/graphql';
import { createChunkDto } from './chunk.dto';
import { PublicationVectorsDto } from './publication-vectors.dto';

@ObjectType()
export class PublicationChunkDto extends createChunkDto(PublicationVectorsDto) {}
