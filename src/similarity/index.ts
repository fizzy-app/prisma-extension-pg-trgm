import { ExtensionArgs } from "../types";
import {
  SimilarityNameCity,
  SimilarityResult,
} from "./types";

async function similarity<T, A>(
  prisma: any,
  {
    name,
    city
  }: SimilarityNameCity,
  extArgs: ExtensionArgs | undefined
): Promise<SimilarityResult<T, A>> {
  try {
    /*
      Trouver les places qui ont un nom et une adresse similaire à la recherche
      - Recherche sur le nom de la place
      - Recherche sur l'adresse de la place
      - Trier par nombre de reviews
      - Recherche par adresse puis par nom
      - Limiter à 20 résultats

      AddressComponent DisplayName Places 
    */

    const query = `
    SELECT
      p.*,
      similarity(ac."longText", '${city.text}') AS col_address_similarity_score,
      similarity(d.text, '${name.text}') AS col_name_similarity_score
    FROM
      "Place" p
    LEFT JOIN
      "DisplayName" d ON d.id = p."displayNameId"
    LEFT JOIN
      "AddressComponent" ac ON ac."placeId" = p.id
    WHERE
      similarity(d.text, '${name.text}') > ${name.threshold}
      AND
      p.id IN (
        SELECT 
          p2.id
        FROM
          "Place" p2
        LEFT JOIN
          "AddressComponent" ac2 ON ac2."placeId" = p2."id"
        WHERE
          similarity(ac."longText", '${city.text}') > ${city.threshold}
      )
    GROUP BY
      p.id, d.text, ac."longText"
    ORDER BY
      col_name_similarity_score DESC,
      col_address_similarity_score DESC,
      p."userRatingCount" DESC
    LIMIT 10;
    `

    extArgs?.logQueries && console.log("[LOGG](prisma-extension-pg-trgm.query)", query);

    const result = await prisma.$queryRawUnsafe(query);
    return result as SimilarityResult<T, A>;
  } catch (e) {
    throw e;
  }
}

export default similarity