import { Router } from "express";
import { validateRequest } from "zod-express-middleware";
import "express-async-errors";
import { z } from "zod";
import { prisma } from "../../prisma/db.setup";
import { intParseableString } from "../zod/intParsableString";
import { deleteFavoriteByItemId } from "./helpers";

const favoritesController = Router();

//get store favs
favoritesController.get("/stores/:storeId/favorites", async (req, res) => {
  const { storeId } = req.params;
  //get items associated with the store
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

  //get the favs from items
  const favoriteQueries = items.map((item) => {
    return prisma.favorite.findMany({
      where: {
        itemId: item.id,
      },
    });
  });

  const favortiesArray = await Promise.all(favoriteQueries);
  const allFavorites = favortiesArray.flat();

  res.status(200).json(allFavorites);
});

//get fav by id
favoritesController.get(
  "/items/:itemId/favorite",
  validateRequest({
    params: z.object({
      itemId: intParseableString,
    }),
  }),
  async (req, res) => {
    const { itemId } = req.params;

    const favorites = await prisma.favorite.findMany({
      where: {
        itemId: +itemId,
      },
    });

    console.log("Favorites found:", favorites);
    res.status(200).json(favorites);
  }
);

//create a new fav
favoritesController.post(
  `/items/:itemId/favorite`,
  validateRequest({
    params: z.object({
      itemId: intParseableString,
    }),
  }),
  async (req, res) => {
    const { itemId } = req.params;
    try {
      const newFav = await prisma.favorite.create({
        data: {
          itemId: +itemId,
        },
      });
      res.status(201).json(newFav);
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

//delete Fav
favoritesController.delete(
  "/favorite/:favoriteId",
  validateRequest({
    params: z.object({
      favoriteId: intParseableString,
    }),
  }),

  async (req, res) => {
    const { favoriteId } = req.params;
    // await deleteFavoriteByItemId(+favoriteId, res)

    try {
      const deleteResult = await prisma.favorite.deleteMany({
        where: {
          id: +favoriteId,
        },
      });

      if (deleteResult.count === 0) {
        return res.status(404).json({ error: "Favorite not found" });
      }

      res.status(200).json({ message: "Favorite deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Failed to delete favorite",
        details: (error as Error).message,
      });
    }
  }
);

export { favoritesController };
