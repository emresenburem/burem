import {
  type User,
  type InsertUser,
  type Product,
  type ProductImage,
  type ProductWithImages,
  type InsertProduct,
  type InventoryProductUpsert,
  users,
  products,
  productImages,
} from "@shared/schema";
import { db } from "./db";
import { and, asc, eq, inArray, isNotNull, isNull, or } from "drizzle-orm";
import { planInventoryImageSync } from "./inventory-image-sync";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProducts(): Promise<ProductWithImages[]>;
  getAllProducts(): Promise<ProductWithImages[]>;
  getProductsByBrand(brand: string): Promise<ProductWithImages[]>;
  getProduct(id: string): Promise<ProductWithImages | undefined>;
  getInventoryProductBySourceDeviceId(sourceInventoryDeviceId: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  upsertInventoryProduct(
    input: InventoryProductUpsert,
  ): Promise<{ product: Product; action: "created" | "updated" }>;
  deleteInventoryProductBySourceDeviceId(sourceInventoryDeviceId: string): Promise<boolean>;
  syncInventoryProductImages(
    sourceInventoryDeviceId: string,
    images: Array<{
      attachmentId: string;
      imageUrl: string;
      cloudinaryPublicId: string;
      isPrimary: boolean;
      sortOrder: number;
    }>,
  ): Promise<{
    productId: string;
    primaryImageUrl: string | null;
    uploaded: number;
    updated: number;
    removed: number;
    removedPublicIds: string[];
  }>;
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
    return this.withImages(
      await db
        .select()
        .from(products)
        .where(or(eq(products.isPublished, true), isNull(products.isPublished))),
    );
  }

  async getAllProducts(): Promise<ProductWithImages[]> {
    return this.withImages(await db.select().from(products));
  }

  async getProductsByBrand(brand: string): Promise<ProductWithImages[]> {
    return this.withImages(
      await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.brand, brand),
            or(eq(products.isPublished, true), isNull(products.isPublished)),
          ),
        ),
    );
  }

  async getProduct(id: string): Promise<ProductWithImages | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product ? (await this.withImages([product]))[0] : undefined;
  }

  async getInventoryProductBySourceDeviceId(
    sourceInventoryDeviceId: string,
  ): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.sourceInventoryDeviceId, sourceInventoryDeviceId),
          isNotNull(products.sourceInventoryDeviceId),
        ),
      )
      .limit(1);
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return updated;
  }

  async upsertInventoryProduct(
    input: InventoryProductUpsert,
  ): Promise<{ product: Product; action: "created" | "updated" }> {
    const { sourceInventoryDeviceId, ...productFields } = input;

    return db.transaction(async (tx) => {
      const [created] = await tx
        .insert(products)
        .values({ ...productFields, sourceInventoryDeviceId })
        .onConflictDoNothing({ target: products.sourceInventoryDeviceId })
        .returning();

      if (created) return { product: created, action: "created" };

      const [updated] = await tx
        .update(products)
        .set(productFields)
        .where(eq(products.sourceInventoryDeviceId, sourceInventoryDeviceId))
        .returning();

      if (!updated) {
        throw new Error("Inventory product upsert could not find the conflicted row");
      }

      return { product: updated, action: "updated" };
    });
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }

  async deleteInventoryProductBySourceDeviceId(
    sourceInventoryDeviceId: string,
  ): Promise<boolean> {
    return db.transaction(async (tx) => {
      const [product] = await tx
        .select({ id: products.id })
        .from(products)
        .where(
          and(
            eq(products.sourceInventoryDeviceId, sourceInventoryDeviceId),
            isNotNull(products.sourceInventoryDeviceId),
          ),
        )
        .for("update")
        .limit(1);

      if (!product) return false;

      await tx.delete(productImages).where(eq(productImages.productId, product.id));
      const deleted = await tx
        .delete(products)
        .where(
          and(
            eq(products.id, product.id),
            eq(products.sourceInventoryDeviceId, sourceInventoryDeviceId),
            isNotNull(products.sourceInventoryDeviceId),
          ),
        )
        .returning({ id: products.id });

      return deleted.length === 1;
    });
  }

  async syncInventoryProductImages(
    sourceInventoryDeviceId: string,
    images: Array<{
      attachmentId: string;
      imageUrl: string;
      cloudinaryPublicId: string;
      isPrimary: boolean;
      sortOrder: number;
    }>,
  ) {
    return db.transaction(async (tx) => {
      const [product] = await tx
        .select({ id: products.id })
        .from(products)
        .where(
          and(
            eq(products.sourceInventoryDeviceId, sourceInventoryDeviceId),
            isNotNull(products.sourceInventoryDeviceId),
          ),
        )
        .for("update");
      if (!product) throw new Error("Inventory product not found");

      const currentImages = await tx
        .select()
        .from(productImages)
        .where(eq(productImages.productId, product.id))
        .orderBy(asc(productImages.sortOrder), asc(productImages.createdAt))
        .for("update");
      const plan = planInventoryImageSync(sourceInventoryDeviceId, currentImages, images);
      const {
        synchronizedImages,
        manualImages,
        orderedImages,
        primarySyncedImage,
        primaryManualImage,
        primaryImageUrl,
        removedImages,
      } = plan;
      if (manualImages.length + images.length > 8) {
        throw new Error("Inventory product image limit exceeded");
      }

      const existingByPublicId = new Map(
        synchronizedImages
          .filter((image) => image.cloudinaryPublicId)
          .map((image) => [image.cloudinaryPublicId as string, image]),
      );

      await tx
        .update(productImages)
        .set({ isPrimary: false })
        .where(eq(productImages.productId, product.id));

      let uploaded = 0;
      let updated = 0;
      for (const image of orderedImages) {
        const isPrimary = image.attachmentId === primarySyncedImage?.attachmentId;
        const existing = existingByPublicId.get(image.cloudinaryPublicId);
        if (existing) {
          await tx.update(productImages).set({
            imageUrl: image.imageUrl,
            cloudinaryPublicId: image.cloudinaryPublicId,
            sortOrder: image.sortOrder,
            isPrimary,
          }).where(eq(productImages.id, existing.id));
          updated += 1;
        } else {
          await tx.insert(productImages).values({
            productId: product.id,
            imageUrl: image.imageUrl,
            cloudinaryPublicId: image.cloudinaryPublicId,
            sortOrder: image.sortOrder,
            isPrimary,
          });
          uploaded += 1;
        }
      }

      if (primaryManualImage) {
        await tx.update(productImages).set({ isPrimary: true })
          .where(eq(productImages.id, primaryManualImage.id));
      }

      const manualSortStart = orderedImages.reduce((max, image) => Math.max(max, image.sortOrder), -1) + 1;
      for (let index = 0; index < manualImages.length; index += 1) {
        await tx.update(productImages).set({ sortOrder: manualSortStart + index })
          .where(eq(productImages.id, manualImages[index].id));
      }
      if (removedImages.length) {
        await tx.delete(productImages).where(inArray(productImages.id, removedImages.map((image) => image.id)));
      }
      await tx.update(products).set({ imageUrl: primaryImageUrl }).where(eq(products.id, product.id));

      return {
        productId: product.id,
        primaryImageUrl,
        uploaded,
        updated,
        removed: removedImages.length,
        removedPublicIds: removedImages.map((image) => image.cloudinaryPublicId)
          .filter((publicId): publicId is string => Boolean(publicId)),
      };
    });
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
