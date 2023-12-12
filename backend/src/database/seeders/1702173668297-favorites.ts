import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Favorite } from '../../modules/core/publication/entities/favorite.entity';
import { Publication } from '../../modules/core/publication/entities/publication.entity';
import { User } from '../../modules/core/user/entities/user.entity';

export class Favorites1702173668297 implements Seeder {
  track = false;

  public async run(dataSource: DataSource): Promise<any> {
    const favoriteRepository = dataSource.getRepository(Favorite);
    const userRepository = dataSource.getRepository(User);
    const publicationRepository = dataSource.getRepository(Publication);

    const favorites: Favorite[] = [];
    for (let i = 0; i < 300; i++) {
      const userCount = await userRepository.count();
      const randomOffsetFavorite = Math.floor(Math.random() * userCount);
      const randomUser = (await userRepository.find({ take: 1, skip: randomOffsetFavorite }))[0];

      const publicationCount = await publicationRepository.count();
      const randomOffsetPublication = Math.floor(Math.random() * publicationCount);
      const randomPublication = (await publicationRepository.find({ take: 1, skip: randomOffsetPublication }))[0];

      const combinationAlreadyInArray = !!favorites.find(
        (f) => f.publication_id === randomPublication.id && f.user_id === randomUser.id,
      );
      const combinationAlreadyInDatabase = !!(await favoriteRepository.findOne({
        where: { publication_id: randomPublication.id, user_id: randomUser.id },
      }));

      if (combinationAlreadyInArray || combinationAlreadyInDatabase) {
        i--;
        break;
      }

      const favorite = new Favorite();
      favorite.user = randomUser;
      favorite.publication = randomPublication;
      favorites.push(favorite);
    }
    await favoriteRepository.save(favorites);
  }
}
