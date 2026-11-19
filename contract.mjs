import { dataContract } from "@prisma/composer-prisma-cloud/orm";
import contractJson from "./src/prisma/contract.json" with { type: "json" };

/** @type {import("@prisma/composer-prisma-cloud/orm").PostgresContract<import("./src/prisma/contract").Contract>} */
const orm = dataContract(contractJson);

export default orm;
