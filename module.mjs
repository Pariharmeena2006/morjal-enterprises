import { module } from "@prisma/composer";
import { envSecret } from "@prisma/composer-prisma-cloud";
import { postgres } from "@prisma/composer-prisma-cloud/orm";
import orm from "./contract.mjs";
import web from "./service.mjs";

export default module("morjal-enterprises", ({ provision }) => {
  const db = provision(
    postgres({ name: "db", contract: orm, config: "./prisma.config.ts" }),
  );

  provision(web, {
    deps: { db },
    input: {
      nextAuthSecret: envSecret("NEXTAUTH_SECRET"), // Signs NextAuth's admin session JWTs.
    },
  });
});
