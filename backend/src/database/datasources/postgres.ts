import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { Publication } from '../../modules/core/publication/entities/publication.entity';
import { Publications1698190282922 } from '../seeders/1698190282922-publications';

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: false,
  entities: [Publication],
  migrations: [`${__dirname}/../migrations/**/*{.ts,.js}`],
  subscribers: [],
  seeds: [Publications1698190282922],
  factories: [],
};

export default new DataSource(options);
