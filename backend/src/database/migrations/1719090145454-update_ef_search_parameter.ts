import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateEfSearchParameter1719090145454 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query('ALTER DATABASE pr SET hnsw.ef_search to 500');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query('ALTER DATABASE pr SET hnsw.ef_search to default');
  }
}
