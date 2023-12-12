import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../modules/core/user/entities/user.entity';

export class Users1702173590422 implements Seeder {
  track = false;

  public async run(dataSource: DataSource): Promise<any> {
    const repository = dataSource.getRepository(User);
    const users: User[] = [];
    for (let i = 0; i < 50; i++) {
      const user = new User(uuidv4(), faker.internet.email(), faker.lorem.word(10), faker.person.firstName());
      users.push(user);
    }
    await repository.save(users);
  }
}
