import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { Favorite } from '../../modules/core/publication/entities/favorite.entity';
import { Publication } from '../../modules/core/publication/entities/publication.entity';
import { Recommendation } from '../../modules/core/publication/entities/recommendation.entity';
import { User } from '../../modules/core/user/entities/user.entity';
import { Publications1698190282922 } from '../seeders/1698190282922-publications';
import { Users1702173590422 } from '../seeders/1702173590422-users';
import { Favorites1702173668297 } from '../seeders/1702173668297-favorites';
import { Recommendations1702762625063 } from '../seeders/1702762625063-recommendations';

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: false,
  entities: [User, Publication, Favorite, Recommendation],
  migrations: [`${__dirname}/../migrations/**/*{.ts,.js}`],
  subscribers: [],
  seeds: [Publications1698190282922, Users1702173590422, Favorites1702173668297, Recommendations1702762625063],
  factories: [],
};

export default new DataSource(options);
