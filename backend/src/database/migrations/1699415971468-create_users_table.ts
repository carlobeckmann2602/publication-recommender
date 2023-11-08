import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1699415971468 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
       id UUID PRIMARY KEY,
       email varchar NOT NULL UNIQUE,
       password varchar NOT NULL,
       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table users`);
  }
}
