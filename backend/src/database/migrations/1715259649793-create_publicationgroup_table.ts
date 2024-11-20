import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1715259649793 implements MigrationInterface {
    name = 'Migrations1715259649793'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "publicationgroup" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "color" character varying, "user_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8d838977c28638070e0ce05dd53" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "publicationgroups_user_id_idx" ON "publicationgroup" ("user_id") `);
        await queryRunner.query(`CREATE TABLE "publicationgroup_publications" ("publicationgroup_id" uuid NOT NULL, "publication_id" uuid NOT NULL, CONSTRAINT "PK_ca06c0848b836d20d29fa1085e1" PRIMARY KEY ("publicationgroup_id", "publication_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0c3fa881dc0ff9a55c73833c76" ON "publicationgroup_publications" ("publicationgroup_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_eff9b599811e2d527ea6416381" ON "publicationgroup_publications" ("publication_id") `);
        await queryRunner.query(`ALTER TABLE "publicationgroup" ADD CONSTRAINT "FK_c59578370aceb2cb670b413baa3" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "publicationgroup_publications" ADD CONSTRAINT "FK_0c3fa881dc0ff9a55c73833c762" FOREIGN KEY ("publicationgroup_id") REFERENCES "publicationgroup"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "publicationgroup_publications" ADD CONSTRAINT "FK_eff9b599811e2d527ea64163811" FOREIGN KEY ("publication_id") REFERENCES "publications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "publicationgroup_publications" DROP CONSTRAINT "FK_eff9b599811e2d527ea64163811"`);
        await queryRunner.query(`ALTER TABLE "publicationgroup_publications" DROP CONSTRAINT "FK_0c3fa881dc0ff9a55c73833c762"`);
        await queryRunner.query(`ALTER TABLE "publicationgroup" DROP CONSTRAINT "FK_c59578370aceb2cb670b413baa3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_eff9b599811e2d527ea6416381"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0c3fa881dc0ff9a55c73833c76"`);
        await queryRunner.query(`DROP TABLE "publicationgroup_publications"`);
        await queryRunner.query(`DROP INDEX "public"."publicationgroups_user_id_idx"`);
        await queryRunner.query(`DROP TABLE "publicationgroup"`);
    }

}
