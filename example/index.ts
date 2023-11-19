import { PrismaClient } from "@prisma/client";
import { withPgTrgm } from "../dist";

const prisma = new PrismaClient().$extends(withPgTrgm());

async function main() {
  const result = await prisma.post.similarity([
    { field: "title", text: "interpreter", type: "SIMILARITY", order: "DESC" },
    {
      field: "title",
      text: "interpreter",
      type: "WORD_SIMILARITY",
      threshold: 0.01,
      thresholdCompare: "GT",
    },
    {
      field: "title",
      text: "interpreter",
      type: "STRICT_WORD_SIMILARITY",
      threshold: 0.002,
      thresholdCompare: "GT",
    },
  ]);
  console.log(result);
}

main();
