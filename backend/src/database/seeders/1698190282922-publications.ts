import { faker } from '@faker-js/faker';
import { createHash } from 'node:crypto';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { v4 as uuidv4 } from 'uuid';
import { DescriptorDto } from '../../modules/core/publication/dto/descriptor.dto';
import { SentenceDto } from '../../modules/core/publication/dto/sentence.dto';
import { Publication } from '../../modules/core/publication/entities/publication.entity';
import { SourceVo } from '../../modules/core/publication/vo/source.vo';

export class Publications1698190282922 implements Seeder {
  track = false;

  public async run(dataSource: DataSource): Promise<any> {
    const repository = dataSource.getRepository(Publication);
    const publications: Publication[] = [];

    for (let i = 0; i < 100; i++) {
      const descriptor = new DescriptorDto();
      descriptor.sentences = new Array(5).fill('').map(() => {
        const sentence = new SentenceDto();
        sentence.value = faker.lorem.sentence();
        sentence.vector = new Array(500).fill('').map(() => faker.number.float({ min: 0, max: 1 }));

        return sentence;
      });
      const publication = new Publication();
      publication.exId = createHash('md5').update(uuidv4()).digest('hex');
      publication.source = SourceVo.arxiv();
      publication.title = faker.lorem.sentence();
      publication.abstract = faker.lorem.sentences(3);
      publication.publisher = Math.floor(Math.random() * 2) === 1 ? faker.company.name() : null;
      publication.authors = this.generateAuthors();
      publication.date = Math.floor(Math.random() * 2) === 1 ? faker.date.past() : null;
      publication.doi = faker.commerce.isbn();
      publication.url = faker.internet.url();
      publication.descriptor = descriptor;
      publications.push(publication);
    }

    await repository.insert(publications);
  }

  private generateAuthors(): string[] {
    return new Array(Math.floor(Math.random() * 5)).fill('').map(() => faker.person.fullName());
  }
}
