import 'dotenv/config';
import { ColumnType, DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { Publications1698190282922 } from '../seeders/1698190282922-publications';
import { Users1702173590422 } from '../seeders/1702173590422-users';
import { Favorites1702173668297 } from '../seeders/1702173668297-favorites';
import { Recommendations1702762625063 } from '../seeders/1702762625063-recommendations';

export const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: false,
  entities: [`${__dirname}/../../modules/core/**/*.entity{.ts,.js}`],
  migrations: [`${__dirname}/../migrations/**/*{.ts,.js}`],
  subscribers: [],
  seeds: [Publications1698190282922, Users1702173590422, Favorites1702173668297, Recommendations1702762625063],
  factories: [],
};
export const dataSource = new DataSource(options);
dataSource.driver.supportedDataTypes.push('vector' as ColumnType);
dataSource.driver.withLengthColumnTypes.push('vector' as ColumnType);
