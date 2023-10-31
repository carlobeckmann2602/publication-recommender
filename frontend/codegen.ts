import type { CodegenConfig } from "@graphql-codegen/cli";
import dotenv from "dotenv";

dotenv.config({ path: "./.env.developement" });

const config: CodegenConfig = {
  overwrite: true,
  schema: process.env.BACKEND_GRAPHQL_ENDPOINT,
  documents: ["graphql/**/*.{gql, graphql}"],
  generates: {
    "graphql/types.generated.ts": { plugins: ["typescript"] },
    "graphql/": {
      preset: "near-operation-file",
      presetConfig: {
        extension: ".generated.ts",
        baseTypesPath: "types.generated.ts",
      },
      plugins: ["typescript-operations", "typed-document-node"],
    },
  },
};

export default config;
