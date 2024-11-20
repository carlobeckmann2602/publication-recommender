import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { RecommendationCreateDto } from '../dto/recommendation-create.dto';
import { Embedding } from '../entities/embedding.entity';
import { Publication } from '../entities/publication.entity';
import { Recommendation } from '../entities/recommendation.entity';
import { NoFavoritesForRecommendationException } from '../exceptions/no-favorites-for-recommendation.exception';
import { RecommendationException } from '../exceptions/recommendation.exception';
import { PublicationService } from './publication.service';

@Injectable()
export class RecommendationService {
  constructor(
    private configService: ConfigService,
    private publicationService: PublicationService,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Recommendation)
    private recommendationRepository: Repository<Recommendation>,

    @InjectRepository(Publication)
    private publicationRepository: Repository<Publication>,

    @InjectRepository(Embedding)
    private embeddingRepository: Repository<Embedding>,
  ) {}

  private readonly logger = new Logger(RecommendationService.name);

  async all(user: User): Promise<Recommendation[]> {
    const userWithRecommendations = await this.userRepository.findOne({
      where: { id: user.id },
      relations: { recommendations: { publications: { embeddings: true } } },
      order: { recommendations: { createdAt: 'DESC' } },
    });
    return userWithRecommendations.recommendations;
  }

  async generateRecommendationsForAllUser(): Promise<void> {
    const users = await this.userRepository.find({
      relations: { favorites: true, recommendations: { publications: true } },
    });
    const usersWithFavorites = users.filter((user) => user.favorites.length !== 0);

    for (const user of usersWithFavorites) {
      await this.createRecommendationforUserFromFavorites(user);
    }
  }

  async createNewRecommendation(dto: RecommendationCreateDto | null, user: User | null): Promise<Recommendation> {
    if (!dto && !user) {
      throw new RecommendationException("can't create recommendation when dto is null and user is null");
    } else if (!dto && user) {
      return await this.createRecommendationforUserFromFavorites(user);
    } else if (dto && user) {
      return this.createRecommendationforUser(dto, user);
    } else if (dto && !user) {
      return await this.createRecommendationForGuest(dto);
    }
  }

  async createRecommendationforUserFromFavorites(user: User) {
    const userWithFavorites = await this.userRepository.findOne({
      where: { id: user.id },
      relations: {
        favorites: { publication: { embeddings: true } },
      },
    });
    if (userWithFavorites.favorites.length === 0) {
      throw new NoFavoritesForRecommendationException();
    }

    const vectorsFromFavorites = userWithFavorites.favorites
      .map((favorite) => favorite.publication)
      .map((publication) => publication.embeddings)
      .flat()
      .map((embedding) => JSON.parse(embedding.vector));
    const vector = await this.getVectorAfterPCAFromAiBackend(vectorsFromFavorites);

    const idsOfFavorites = userWithFavorites.favorites.map((favorite) => favorite.publicationId);

    const nearestNeighbors = await this.publicationService.getPublicationsForVectors([vector], 10, idsOfFavorites);
    const publications = nearestNeighbors.map((nearestNeighbor) => nearestNeighbor.publication);

    return await this.recommendationRepository.save({
      userId: user.id,
      publications,
    });
  }

  async createRecommendationforUser(dto: RecommendationCreateDto, user: User) {
    const embeddings = await this.embeddingRepository.find({
      where: { publicationId: In(dto.group) },
    });
    const vectorsFromFavorites = embeddings.map((embedding) => JSON.parse(embedding.vector));

    const vector = await this.getVectorAfterPCAFromAiBackend(vectorsFromFavorites);

    const recommendation = await this.publicationService.getPublicationsForVectors([vector], dto.amount, dto.exlude);

    const publications = recommendation.map((recommendation) => recommendation.publication);
    return await this.recommendationRepository.save({
      user,
      publications,
    });
  }

  async createRecommendationForGuest(dto: RecommendationCreateDto) {
    const publications = await this.publicationRepository.find({
      where: { id: In(dto.group) },
      relations: { embeddings: true },
    });
    const vectors = publications
      .map((publication) => publication.embeddings)
      .flat()
      .map((embedding) => JSON.parse(embedding.vector));

    const vector = await this.getVectorAfterPCAFromAiBackend(vectors);
    const nearestNeighbors = await this.publicationService.getPublicationsForVectors([vector], dto.amount, dto.exlude);
    const recommendedPublications = nearestNeighbors.map((nearestNeighbor) => nearestNeighbor.publication);
    const recommendation = new Recommendation();
    recommendation.publications = recommendedPublications;
    recommendation.createdAt = new Date();

    return recommendation;
  }

  async getVectorAfterPCAFromAiBackend(vectors: number[][]): Promise<number[]> {
    const url = `${this.configService.get('PROJECT_AI_BACKEND_URL')}/pca/`;
    const body = JSON.stringify(vectors);
    const headers = { 'Content-Type': 'application/json' };
    const result = await (await fetch(url, { method: 'POST', body, headers })).json();
    return result;
  }
}
