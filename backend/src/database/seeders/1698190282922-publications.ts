import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Publication } from '../../modules/core/publication/entities/publication.entity';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

export class Publications1698190282922 implements Seeder {
  track = false;

  public async run(dataSource: DataSource): Promise<any> {
    const repository = dataSource.getRepository(Publication);
    const publications: Publication[] = [];

    for (let i = 0; i < 100; i++) {
      const publication = new Publication(uuidv4(), faker.commerce.productName());
      publication.publisher = Math.floor(Math.random() * 2) === 1 ? faker.company.name() : null;
      publication.authors = this.generateAuthors();
      publication.date = Math.floor(Math.random() * 2) === 1 ? faker.date.past() : null;

      publications.push(publication);
    }

    await repository.insert(publications);
  }

  private generateAuthors(): string[] {
    return new Array(Math.floor(Math.random() * 5)).fill('').map(() => faker.person.fullName());
  }
}
