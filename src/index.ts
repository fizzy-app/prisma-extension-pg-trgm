import { Prisma } from "@prisma/client/extension";
import { SimilarityResult, SimilarityNameCity } from "./similarity/types";
import similarity from "./similarity";
import install from "./install";
import { ExtensionArgs } from "./types";

export const withPgTrgm = (extArgs?: ExtensionArgs) => {
  return Prisma.defineExtension((prisma) => {
    // install database extension
    (async () => await install(prisma, extArgs))();

    return prisma.$extends({
      name: "prisma-extension-pg-trgm",
      client: {
        async $install() {
          return install(prisma, extArgs);
        },
      },
      model: {
        $allModels: {
          async similarity<T, A>(this: T, args: SimilarityNameCity): Promise<SimilarityResult<T, A>> {
            return similarity<T, A>(prisma, args, extArgs);
          },
        },
      },
    });
  });
};
