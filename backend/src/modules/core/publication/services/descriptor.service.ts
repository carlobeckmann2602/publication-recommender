import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PublicationVectorsRequestDto } from '../dto/publication-vectors-request.dto';
import { PublicationVectorsDto } from '../dto/publication-vectors.dto';
import { PublicationChunkDto } from '../dto/publikation-chunk.dto';
import { Publication } from '../entities/publication.entity';

@Injectable()
export class DescriptorService {
  constructor(
    @InjectRepository(Publication)
    private publicationRepository: Repository<Publication>,
  ) {}

  async getVectorsChunk(dto: PublicationVectorsRequestDto): Promise<PublicationChunkDto> {
    const chunk = new PublicationChunkDto();

    const results = await this.publicationRepository.find({
      order: { id: 'ASC' },
      skip: dto.chunk * dto.chunkSize,
      take: dto.chunkSize,
    });
    chunk.chunk = dto.chunk;
    chunk.data = results.map((result) => {
      const publicationVectors = new PublicationVectorsDto();
      publicationVectors.id = result.id;
      publicationVectors.vectors = result.descriptor.sentences.map((sentence) => sentence.vector);

      return publicationVectors;
    });

    return chunk;
  }
}
