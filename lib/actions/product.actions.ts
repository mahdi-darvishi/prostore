"use server";
import { prisma } from "@/db/prisma";

import { convertToPlainObject } from "../utils";
import { LATEST_PRODUCTS_LIMIT } from "../constants";

export async function getLAtestProducts() {
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: { createdAt: "desc" },
  });

  return convertToPlainObject(data);
}

//  Get single products by it's slug

export async function getProductBySlig(slug: string) {
  return await prisma.product.findFirst({ where: { slug: slug } });
}
