import { PrismaClient } from "@prisma/client";
import { Response } from "express";

const prisma = new PrismaClient();

export async function deleteFavoriteByItemId(itemId: number, res: Response) {
  const favorite = await prisma.favorite.findFirst({
    where: {
      itemId: itemId,
    },
  });

  if (favorite != null) {
    try {
      await prisma.favorite.delete({
        where: {
          id: favorite.id,
        },
      });
      res.status(200).json({ message: "Favorite deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Failed to delete favorite",
        details: (error as Error).message,
      });
    }
  } else {
    res.status(404).json({ error: "Favorite not found" });
  }
}

export async function deleteItemsAndFavoritesByStoreId(
  storeId: number,
  res: Response
) {
  const items = await prisma.item.findMany({
    where: {
      storeId: storeId,
    },
  });

  if (items.length > 0) {
    try {
      for (const item of items) {
        await prisma.favorite.deleteMany({
          where: {
            itemId: item.id,
          },
        });

        await prisma.item.delete({
          where: {
            id: item.id,
          },
        });
      }
      return {
        message: "Items and their favorites deleted successfully",
      };
    } catch (error) {
      console.error(error);
      return {
        message: "Failed to delete items and their favorites",
        details: (error as Error).message,
      };
    }
  } else {
    return { success: false, message: "No items found for the store" };
  }
}
