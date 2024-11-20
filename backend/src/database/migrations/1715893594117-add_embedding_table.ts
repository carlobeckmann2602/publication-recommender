import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmbeddingTable1715893594117 implements MigrationInterface {
  name = 'AddEmbeddingTable1715893594117';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "embedding" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "text" character varying NOT NULL, "vector" double precision array NOT NULL, "publication_id" uuid NOT NULL, CONSTRAINT "PK_9457e810efc9c802fe5047347d6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "publications" DROP COLUMN "descriptor"`);
    await queryRunner.query(
      `ALTER TABLE "embedding" ADD CONSTRAINT "FK_0a44cb5b463d7bc57c2013c3b42" FOREIGN KEY ("publication_id") REFERENCES "publications"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "embedding" DROP CONSTRAINT "FK_0a44cb5b463d7bc57c2013c3b42"`);
    await queryRunner.query(`ALTER TABLE "publications" ADD "descriptor" jsonb NOT NULL`);
    await queryRunner.query(`DROP TABLE "embedding"`);
  }
}
