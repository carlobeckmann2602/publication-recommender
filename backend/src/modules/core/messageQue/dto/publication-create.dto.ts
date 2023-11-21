import { VectorData } from '../../publication/interfaces/vectorData.interface';

export class PublicationCreateDto {
  title: string;

  doi: string | null;

  url: string | null;

  authors: string[] | null;

  publicationDate: Date | null;

  vectorData: VectorData[];
}
