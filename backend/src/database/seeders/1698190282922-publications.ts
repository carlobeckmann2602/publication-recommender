import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { v4 as uuidv4 } from 'uuid';
import { Author } from '../../modules/core/publication/entities/author.entity';
import { Embedding } from '../../modules/core/publication/entities/embedding.entity';
import { Publication } from '../../modules/core/publication/entities/publication.entity';
import { SourceVo } from '../../modules/core/publication/vo/source.vo';

export class Publications1698190282922 implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const repository = dataSource.getRepository(Publication);

    let publications: Publication[] = [];

    for (let i = 0; i < 100; i++) {
      const embeddings = Array.from({ length: 5 }, () => {
        const text = faker.lorem.sentence();
        const vectorAsString = JSON.stringify(
          Array.from({ length: 768 }, () => faker.number.float({ min: 0, max: 1 })),
        );

        return new Embedding(text, vectorAsString);
      });
      const publication = new Publication();
      publication.exId = uuidv4();
      publication.source = SourceVo.ARXIV;
      publication.title = faker.lorem.sentence();
      publication.abstract = faker.lorem.sentences(3);
      publication.publisher = Math.floor(Math.random() * 2) === 1 ? faker.company.name() : null;
      publication.authors = this.generateAuthors();
      publication.date = Math.floor(Math.random() * 2) === 1 ? faker.date.past() : null;

      if (Math.random() > 0.5) {
        const length = Math.floor(Math.random() * 3);
        publication.doi = Array.from({ length: length }, () => faker.commerce.isbn());
      }

      publication.url = faker.internet.url();
      publication.embeddings = embeddings;
      publications.push(publication);

      if (publications.length === 50) {
        console.time(`added 50 publications in`);
        await repository.save(publications);
        console.timeEnd(`added 50 publications in`);
        console.log(`total amount added: ${i + 1}`);
        publications = [];
      }
    }
  }

  private generateAuthors(): Author[] {
    const length = Math.floor(Math.random() * 5);
    return Array.from({ length: length }, () => faker.person.fullName()).map((name) => new Author(name));
  }
}
