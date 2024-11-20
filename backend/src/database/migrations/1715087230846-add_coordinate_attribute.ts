import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1715087230846 implements MigrationInterface {
    name = 'Migrations1715087230846'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recommendation_publications" DROP CONSTRAINT "recommendation_publications_recommendation_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "recommendation_publications" DROP CONSTRAINT "recommendation_publications_publication_id_fkey"`);
        await queryRunner.query(`DROP INDEX "public"."recommendation_publications_recommendation_id_idx"`);
        await queryRunner.query(`DROP INDEX "public"."recommendation_publications_publication_id_idx"`);
        await queryRunner.query(`ALTER TABLE "publications" ADD "coordinate" double precision array DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "publications" ALTER COLUMN "doi" SET DEFAULT '{}'`);
        await queryRunner.query(`CREATE INDEX "IDX_c8ff0336d5ddd5b88374f3c1a7" ON "recommendation_publications" ("recommendation_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_e9c0824358461b26fde41ee2fd" ON "recommendation_publications" ("publication_id") `);
        await queryRunner.query(`ALTER TABLE "recommendation_publications" ADD CONSTRAINT "FK_c8ff0336d5ddd5b88374f3c1a7e" FOREIGN KEY ("recommendation_id") REFERENCES "recommendations"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "recommendation_publications" ADD CONSTRAINT "FK_e9c0824358461b26fde41ee2fda" FOREIGN KEY ("publication_id") REFERENCES "publications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recommendation_publications" DROP CONSTRAINT "FK_e9c0824358461b26fde41ee2fda"`);
        await queryRunner.query(`ALTER TABLE "recommendation_publications" DROP CONSTRAINT "FK_c8ff0336d5ddd5b88374f3c1a7e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e9c0824358461b26fde41ee2fd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c8ff0336d5ddd5b88374f3c1a7"`);
        await queryRunner.query(`ALTER TABLE "publications" ALTER COLUMN "doi" SET DEFAULT ARRAY[]`);
        await queryRunner.query(`ALTER TABLE "publications" DROP COLUMN "coordinate"`);
        await queryRunner.query(`CREATE INDEX "recommendation_publications_publication_id_idx" ON "recommendation_publications" ("publication_id") `);
        await queryRunner.query(`CREATE INDEX "recommendation_publications_recommendation_id_idx" ON "recommendation_publications" ("recommendation_id") `);
        await queryRunner.query(`ALTER TABLE "recommendation_publications" ADD CONSTRAINT "recommendation_publications_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "publications"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recommendation_publications" ADD CONSTRAINT "recommendation_publications_recommendation_id_fkey" FOREIGN KEY ("recommendation_id") REFERENCES "recommendations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
