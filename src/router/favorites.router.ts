import { Router } from "express";
import { validateRequest } from "zod-express-middleware";
import "express-async-errors";
import { z } from "zod";
import { prisma } from "../../prisma/db.setup";

const favoritesController = Router();

favoritesController.get(
  "/users/:userId/stores/:storeId/favorites",
  async (req, res) => {
    const { userId, storeId } = req.params;
    console.log(userId, storeId);

    const user = await prisma.user.findUnique({
      where: {
        id: +userId,
      },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const items = await prisma.item.findMany({
      where: {
        storeId: +storeId,
      },
    });

    if (items.length === 0) {
      return res
        .status(404)
        .json({ error: "Item not found in the specified store" });
    }
    console.log({ items: items });

    const favoriteQueries = items.map((item) => {
      prisma.favorite.findMany({
        where: {
          itemId: item.id,
        },
      });
    });

    const favortiesArray = await Promise.all(favoriteQueries);
    // const allFavorites = favortiesArray.flat();

    // res.status(200).json(allFavorites);
    res.status(200).json(favortiesArray);
  }
);

//get fav by id
favoritesController.get(
  "/users/:userId/stores/:storeId/items/:itemId/favorite",
  async (req, res) => {
    const { userId, storeId, itemId } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        id: +userId,
      },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const item = await prisma.item.findFirst({
      where: {
        id: +itemId,
        storeId: +storeId,
      },
    });

    if (!item) {
      return res
        .status(404)
        .json({ error: "Item not found in the specified store" });
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        itemId: +itemId,
      },
    });

    console.log("Favorites found:", favorites);

    res.status(200).json(favorites);
  }
);

export { favoritesController };
