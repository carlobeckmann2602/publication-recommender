import { faker } from '@faker-js/faker';
import { DataSource, In } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Publication } from '../../modules/core/publication/entities/publication.entity';
import { Recommendation } from '../../modules/core/publication/entities/recommendation.entity';

export class Recommendations1702762625063 implements Seeder {
  track = false;

  public async run(dataSource: DataSource): Promise<any> {
    const maxPublications = 5;
    const maxUsers = 5;
    const recommendationRepository = dataSource.getRepository<Recommendation>(Recommendation);
    const publicationRepository = dataSource.getRepository<Publication>(Publication);
    const map: Map<string, string[]> = new Map();

    const combinations = await dataSource.query<
      {
        user_id;
        publication_id;
      }[]
    >(`select users.id as user_id, publications.id as publication_id from users cross join publications
        where concat(users.id, publications.id) not in (select concat(recommendations.user_id, recommendation_publications.publication_id) 
        from recommendations join recommendation_publications on recommendations.id = recommendation_publications.recommendation_id) limit 10000`);

    for (const combination of combinations) {
      if (map.size < maxUsers && !map.has(combination['user_id'])) {
        map.set(combination['user_id'], []);
      }
      const publications = map.get(combination['user_id']);
      if (publications && publications.length < maxPublications) {
        publications.push(combination['publication_id']);
        map.set(combination['user_id'], publications);
      }
      if (this.meetsConditions(maxPublications, maxUsers, map)) {
        break;
      }
    }

    const recommendations: Recommendation[] = [];
    for (const [userId, publicationIds] of map.entries()) {
      const recommendation = new Recommendation();
      recommendation.userId = userId;
      recommendation.publications = await publicationRepository.find({
        where: { id: In(publicationIds) },
      });
      recommendation.createdAt = faker.date.past();
      recommendation.updatedAt = faker.date.past();
      recommendations.push(recommendation);
    }

    await recommendationRepository.save(recommendations);
  }

  private meetsConditions(maxPublications: number, maxUsers: number, map: Map<string, string[]>): boolean {
    if (map.size === maxUsers) {
      for (const [, publications] of map.entries()) {
        if (publications.length < maxPublications) {
          return false;
        }
      }

      return true;
    }

    return false;
  }
}
