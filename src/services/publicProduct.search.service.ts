import { prisma } from "@/prisma/client";
import { SearchQueryType } from "@/schema/zod-schema";

export class ProductSearchService {
  // static async searchProducts(params: SearchQueryType) {
  //   const { search: q, page, limit } = params;

  //   const offset = (page - 1) * limit;

  //   const products = await prisma.$queryRaw`
  //   SELECT
  //     p.*,
  //     ts_rank(
  //       setweight(to_tsvector('english', p.name), 'A') ||
  //       setweight(to_tsvector('english', coalesce(p.description, '')), 'B'),
  //       plainto_tsquery('english', ${q})
  //     ) AS rank
  //   FROM "Product" p
  //   WHERE
  //     p."is_active" = true
  //     AND (
  //       setweight(to_tsvector('english', p.name), 'A') ||
  //       setweight(to_tsvector('english', coalesce(p.description, '')), 'B')
  //     )
  //     @@ plainto_tsquery('english', ${q})
  //   ORDER BY rank DESC
  //   LIMIT ${limit}
  //   OFFSET ${offset}
  // `;

  //   return products;
  // }

  static async searchProducts(params: SearchQueryType) {
    const { search: q, page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    const [products, totalResult] = await prisma.$transaction([
      prisma.$queryRaw`
      SELECT 
       p.id,
       p."productId",
       p.name,
       p.slug,
       p."min_price",
       p."max_price",
       p."stock_quantity",
       p."average_rating",
       p."review_count",
       p."is_active",
       p."created_at",
       p."updated_at",
        ts_rank(p.search_vector, plainto_tsquery('english', ${q})) AS rank
      FROM "Product" p
      WHERE 
        p."is_active" = true
        AND p.search_vector @@ plainto_tsquery('english', ${q})
      ORDER BY rank DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `,
      prisma.$queryRaw`
      SELECT COUNT(*)::int AS total
      FROM "Product" p
      WHERE 
        p."is_active" = true
        AND p.search_vector @@ plainto_tsquery('english', ${q})
    `,
    ]);

    console.log(totalResult, "totalResult");

    const total = (totalResult as any)[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      products,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  // auto complete making use of the search_vector column computation
  static async autocomplete(query: string) {
    if (!query?.trim()) return [];

    const q = query
      .trim()
      .split(/\s+/)
      .map((w) => `${w}:*`)
      .join(" & ");

    const results = await prisma.$queryRaw`
    SELECT 
      p."productId",
      p.name,
      p.slug,
      c.name AS "categoryName",
      ts_rank(p.search_vector, to_tsquery('english', ${q})) AS rank
    FROM "Product" p
    LEFT JOIN "ProductCategory" pc ON pc."productId" = p.id
    LEFT JOIN "Category" c ON c.id = pc."categoryId"
    WHERE 
      p."is_active" = true
      AND p.search_vector @@ to_tsquery('english', ${q})
    ORDER BY rank DESC
    LIMIT 10
  `;

    return results;
  }

  // static async autocomplete(query: string) {
  //   if (!query?.trim()) return [];

  //   const q = query
  //     .trim()
  //     .split(/\s+/)
  //     .map((w) => `${w}:*`)
  //     .join(" & ");

  //   const results = await prisma.$queryRaw`
  //   SELECT
  //     p."productId",
  //     p.name,
  //     p.slug,
  //     c.name AS "categoryName",
  //     ts_rank(
  //       setweight(to_tsvector('english', p.name), 'A') ||
  //       setweight(to_tsvector('english', coalesce(p.description, '')), 'B'),
  //       to_tsquery('english', ${q})
  //     ) AS rank
  //   FROM "Product" p
  //   LEFT JOIN "ProductCategory" pc ON pc."productId" = p.id
  //   LEFT JOIN "Category" c ON c.id = pc."categoryId"
  //   WHERE
  //     p."is_active" = true
  //     AND (
  //       setweight(to_tsvector('english', p.name), 'A') ||
  //       setweight(to_tsvector('english', coalesce(p.description, '')), 'B')
  //     )
  //     @@ to_tsquery('english', ${q})
  //   ORDER BY rank DESC
  //   LIMIT 10
  // `;

  //   return results;
  // }

  //   doesnt include any category joins to display the category name and products uuid
  //   static async autocomplete(query: string) {
  //     if (!query?.trim()) return [];

  //     const q = query.trim().replace(/\s+/g, " & ") + ":*";

  //     const results = await prisma.$queryRaw`
  //     SELECT
  //       p.name,
  //       p.slug,
  //       ts_rank(
  //         setweight(to_tsvector('english', p.name), 'A') ||
  //         setweight(to_tsvector('english', coalesce(p.slug, '')), 'B'),
  //         to_tsquery('english', ${q})
  //       ) AS rank
  //     FROM "Product" p
  //     WHERE
  //       p."is_active" = true
  //       AND (
  //         setweight(to_tsvector('english', p.name), 'A') ||
  //         setweight(to_tsvector('english', coalesce(p.slug, '')), 'B')
  //       )
  //       @@ to_tsquery('english', ${q})
  //     ORDER BY rank DESC
  //     LIMIT 10
  //   `;

  //     return results;
  //   }
}
