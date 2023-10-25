import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import DataSource from '../../database/datasources/postgres';

@Module({
  imports: [TypeOrmModule.forRoot(DataSource.options)],
})
export class DatabaseModule {}
