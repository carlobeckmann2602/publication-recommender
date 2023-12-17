import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDoiAttribute1702784037709 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE publications ALTER COLUMN "doi" TYPE VARCHAR[]
            USING CASE WHEN "doi" IS NULL THEN ARRAY[]::VARCHAR[] 
            ELSE string_to_array(regexp_replace("doi", '\\s', '', 'g'), ',') END`,
    );

    await queryRunner.query(`ALTER TABLE publications ALTER COLUMN "doi" SET DEFAULT ARRAY[]::VARCHAR[]`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE publications ALTER COLUMN "doi" DROP DEFAULT;
    `);
    await queryRunner.query(`
        ALTER TABLE publications ALTER COLUMN "doi" TYPE VARCHAR 
        USING CASE WHEN cardinality("doi") = 0 THEN NULL ELSE "doi"[1] END
    `);
  }
}
