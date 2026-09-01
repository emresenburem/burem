import {
  type User,
  type InsertUser,
  type Product,
  type ProductImage,
  type ProductWithImages,
  type InsertProduct,
  users,
  products,
  productImages,
} from "@shared/schema";
import { db } from "./db";
import { and, asc, eq, inArray } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProducts(): Promise<ProductWithImages[]>;
  getProductsByBrand(brand: string): Promise<ProductWithImages[]>;
  getProduct(id: string): Promise<ProductWithImages | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  getProductImages(productId: string): Promise<ProductImage[]>;
  createProductImage(
    productId: string,
    image: { imageUrl: string; cloudinaryPublicId?: string | null; isPrimary?: boolean },
  ): Promise<ProductImage>;
  setPrimaryProductImage(productId: string, imageId: string): Promise<ProductImage | undefined>;
  reorderProductImages(productId: string, imageIds: string[]): Promise<ProductImage[]>;
  deleteProductImage(productId: string, imageId: string): Promise<ProductImage | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  private async withImages(rows: Product[]): Promise<ProductWithImages[]> {
    if (rows.length === 0) return [];

    const images = await db
      .select()
      .from(productImages)
      .where(inArray(productImages.productId, rows.map((product) => product.id)))
      .orderBy(asc(productImages.sortOrder), asc(productImages.createdAt));

    const imagesByProduct = new Map<string, ProductImage[]>();
    for (const image of images) {
      const current = imagesByProduct.get(image.productId) ?? [];
      current.push(image);
      imagesByProduct.set(image.productId, current);
    }

    return rows.map((product) => ({
      ...product,
      images: imagesByProduct.get(product.id) ?? [],
    }));
  }

  async getProducts(): Promise<ProductWithImages[]> {
    return this.withImages(await db.select().from(products));
  }

  async getProductsByBrand(brand: string): Promise<ProductWithImages[]> {
    return this.withImages(await db.select().from(products).where(eq(products.brand, brand)));
  }

  async getProduct(id: string): Promise<ProductWithImages | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product ? (await this.withImages([product]))[0] : undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }

  async getProductImages(productId: string): Promise<ProductImage[]> {
    return db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productId))
      .orderBy(asc(productImages.sortOrder), asc(productImages.createdAt));
  }

  async createProductImage(
    productId: string,
    image: { imageUrl: string; cloudinaryPublicId?: string | null; isPrimary?: boolean },
  ): Promise<ProductImage> {
    return db.transaction(async (tx) => {
      const [product] = await tx
        .select({ imageUrl: products.imageUrl })
        .from(products)
        .where(eq(products.id, productId));
      if (!product) throw new Error("Product not found");

      const currentImages = await tx
        .select()
        .from(productImages)
        .where(eq(productImages.productId, productId))
        .orderBy(asc(productImages.sortOrder), asc(productImages.createdAt));

      if (currentImages.length >= 8) {
        throw new Error("Bir üründe en fazla 8 görsel olabilir");
      }

      const hasPrimary = currentImages.some((current) => current.isPrimary);
      const makePrimary =
        image.isPrimary === true ||
        (!hasPrimary && !product.imageUrl && currentImages.length === 0);

      if (makePrimary) {
        await tx
          .update(productImages)
          .set({ isPrimary: false })
          .where(eq(productImages.productId, productId));
      }

      const [created] = await tx
        .insert(productImages)
        .values({
          productId,
          imageUrl: image.imageUrl,
          cloudinaryPublicId: image.cloudinaryPublicId ?? null,
          sortOrder: currentImages.length,
          isPrimary: makePrimary,
        })
        .returning();

      if (makePrimary) {
        await tx
          .update(products)
          .set({ imageUrl: image.imageUrl })
          .where(eq(products.id, productId));
      }

      return created;
    });
  }

  async setPrimaryProductImage(productId: string, imageId: string): Promise<ProductImage | undefined> {
    return db.transaction(async (tx) => {
      const [image] = await tx
        .select()
        .from(productImages)
        .where(and(eq(productImages.id, imageId), eq(productImages.productId, productId)));
      if (!image) return undefined;

      await tx
        .update(productImages)
        .set({ isPrimary: false })
        .where(eq(productImages.productId, productId));
      const [primary] = await tx
        .update(productImages)
        .set({ isPrimary: true })
        .where(and(eq(productImages.id, imageId), eq(productImages.productId, productId)))
        .returning();
      await tx
        .update(products)
        .set({ imageUrl: image.imageUrl })
        .where(eq(products.id, productId));

      return primary;
    });
  }

  async reorderProductImages(productId: string, imageIds: string[]): Promise<ProductImage[]> {
    return db.transaction(async (tx) => {
      const currentImages = await tx
        .select()
        .from(productImages)
        .where(eq(productImages.productId, productId));

      const currentIds = new Set(currentImages.map((image) => image.id));
      if (
        imageIds.length !== currentImages.length ||
        imageIds.some((imageId) => !currentIds.has(imageId))
      ) {
        throw new Error("Görsel sıralaması bu ürüne ait olmayan kayıt içeriyor");
      }

      for (let sortOrder = 0; sortOrder < imageIds.length; sortOrder += 1) {
        const imageId = imageIds[sortOrder];
        await tx
          .update(productImages)
          .set({ sortOrder })
          .where(and(eq(productImages.id, imageId), eq(productImages.productId, productId)));
      }

      return tx
        .select()
        .from(productImages)
        .where(eq(productImages.productId, productId))
        .orderBy(asc(productImages.sortOrder), asc(productImages.createdAt));
    });
  }

  async deleteProductImage(productId: string, imageId: string): Promise<ProductImage | undefined> {
    return db.transaction(async (tx) => {
      const [image] = await tx
        .select()
        .from(productImages)
        .where(and(eq(productImages.id, imageId), eq(productImages.productId, productId)));
      if (!image) return undefined;

      await tx
        .delete(productImages)
        .where(and(eq(productImages.id, imageId), eq(productImages.productId, productId)));

      if (image.isPrimary) {
        const [nextPrimary] = await tx
          .select()
          .from(productImages)
          .where(eq(productImages.productId, productId))
          .orderBy(asc(productImages.sortOrder), asc(productImages.createdAt))
          .limit(1);

        if (nextPrimary) {
          await tx
            .update(productImages)
            .set({ isPrimary: true })
            .where(and(eq(productImages.id, nextPrimary.id), eq(productImages.productId, productId)));
        }

        await tx
          .update(products)
          .set({ imageUrl: nextPrimary?.imageUrl ?? null })
          .where(eq(products.id, productId));
      }

      return image;
    });
  }
}

export const storage = new DatabaseStorage();
