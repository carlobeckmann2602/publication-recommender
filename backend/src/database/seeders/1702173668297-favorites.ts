import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Favorite } from '../../modules/core/publication/entities/favorite.entity';

export class Favorites1702173668297 implements Seeder {
  track = false;

  public async run(dataSource: DataSource): Promise<any> {
    const favoriteRepository = dataSource.getRepository<Favorite>(Favorite);
    const combinations = await dataSource.query<
      {
        user_id;
        publication_id;
      }[]
    >(`select users.id as user_id, publications.id as publication_id from users cross join publications
                                                where concat(users.id, publications.id) not in (select concat(user_id, publication_id) from favorites) ORDER BY random() limit 10000`);
    const favorites: Favorite[] = [];

    for (const combination of combinations) {
      if (favorites.length >= 300) {
        break;
      }
      const favorite = new Favorite();
      favorite.userId = combination['user_id'];
      favorite.publicationId = combination['publication_id'];
      favorites.push(favorite);
    }
    await favoriteRepository.save(favorites);
  }
}
