import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDoiAttribute1704862398832 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM publications WHERE "doi" IS NULL`);
    await queryRunner.query(`ALTER TABLE publications ALTER COLUMN "doi" SET NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE publications ALTER COLUMN "doi" DROP NOT NULL`);
  }
}
