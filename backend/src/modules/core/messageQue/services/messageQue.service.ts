import { Dependencies, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publication } from '../../publication/entities/publication.entity';
import { PublicationCreateDto } from '../dto/publication-create.dto';
import { SendAnnoyDataDto } from '../dto/send-annoy-data.dto';

@Injectable()
@Dependencies()
export class MessageQueService {
  constructor(@InjectRepository(Publication) private publicationRepository: Repository<Publication>) {}

  async getAnnoyData(index: number) {
    const rangePerRequest = 100;

    const results = await this.publicationRepository.find({
      order: { id: 'ASC' },
      skip: index * rangePerRequest,
      take: rangePerRequest,
    });

    const mappedResults = results.map((result) => {
      return { id: result.id, vectors: result.vectorData.map((singleVectorData) => singleVectorData.vector) };
    });

    const publicationCount = await this.publicationRepository.count();
    const moreData = publicationCount > (index + 1) * rangePerRequest;

    return new SendAnnoyDataDto(mappedResults, moreData);
  }

  async savePublication(publicationCreateDto: PublicationCreateDto) {
    await this.publicationRepository.save(publicationCreateDto);
  }
}
