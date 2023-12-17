import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDoiAttribute1702784037709 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE publications ALTER COLUMN "doi" TYPE VARCHAR[] USING ARRAY["doi"];`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE publications ALTER COLUMN "doi" TYPE VARCHAR[] USING COALESCE("doi"[1],'');`);
  }
}
