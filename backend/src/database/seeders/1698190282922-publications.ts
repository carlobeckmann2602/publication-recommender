import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Publication } from '../../modules/core/publication/entities/publication.entity';

export class Publications1698190282922 implements Seeder {
  track = false;

  public async run(dataSource: DataSource): Promise<any> {
    const repository = dataSource.getRepository(Publication);
    const publications: Publication[] = [];

    for (let i = 0; i < 100; i++) {
      const vektorData = new Array(5).fill('').map(() => {
        return {
          sentence: faker.lorem.sentence(),
          vector: new Array(500).fill('').map(() => faker.number.float({ min: 0, max: 1 })),
        };
      });
      const publication = new Publication('my Title', null, null, null, null, vektorData);
      publications.push(publication);
    }
    await repository.insert(publications);
  }

  private generateAuthors(): string[] {
    return new Array(Math.floor(Math.random() * 5)).fill('').map(() => faker.person.fullName());
  }
}
