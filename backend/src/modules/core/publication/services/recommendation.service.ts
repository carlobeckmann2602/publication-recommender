import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Recommendation } from '../entities/recommendation.entity';

@Injectable()
export class RecommendationService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async all(user: User): Promise<Recommendation[]> {
    const userWithRecommendations = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['recommendations', 'recommendations.publications'],
    });

    return userWithRecommendations.recommendations;
  }
}
