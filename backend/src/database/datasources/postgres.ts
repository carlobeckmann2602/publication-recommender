import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { EnvironmentReader } from 'safe-env-vars';
import { Publications1698190282922 } from '../seeders/1698190282922-publications';
import { Publication } from '../../modules/core/publication/entities/publication.entity';
const env = new EnvironmentReader();

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: env.get('DB_HOST'),
  port: Number.parseInt(env.get('DB_PORT')),
  username: env.get('DB_USERNAME'),
  password: env.get('DB_PASSWORD'),
  database: env.get('DB_DATABASE'),
  synchronize: false,
  logging: false,
  entities: [Publication],
  migrations: [`${__dirname}/../migrations/**/*{.ts,.js}`],
  subscribers: [],
  seeds: [Publications1698190282922],
  factories: [],
};

export default new DataSource(options);
