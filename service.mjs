import { type } from "arktype";
import { secretString } from "@prisma/composer/arktype";
import nextjs from "@prisma/composer/nextjs";
import { compute } from "@prisma/composer-prisma-cloud";
import { postgres } from "@prisma/composer-prisma-cloud/orm";
import orm from "./contract.mjs";

/** @type {import("@prisma/composer-prisma-cloud/orm").PostgresContract<import("./src/prisma/contract").Contract>} */
const contract = orm;

export default compute({
  name: "web",
  deps: { db: postgres(contract) },
  input: type({
    nextAuthSecret: secretString(),
  }),
  build: nextjs({ module: import.meta.url, appDir: "." }),
});
