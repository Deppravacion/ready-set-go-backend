import { Router } from "express";
import { validateRequest } from "zod-express-middleware";
import "express-async-errors";
import { z } from "zod";
import { prisma } from "../../prisma/db.setup";
import { intParseableString } from "../zod/intParsableString";

const favoritesController = Router();

//get store favs
favoritesController.get(
  "/users/:userId/stores/:storeId/favorites",
  async (req, res) => {
    const { userId, storeId } = req.params;
    // console.log(userId, storeId);
    console.log({ userId: userId });
    console.log({ storeId: storeId });

    //grab a user
    const user = await prisma.user.findUnique({
      where: {
        id: +userId,
      },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

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
  }
);

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
  // "/items/:itemId/favorite",
  validateRequest({
    params: z.object({
      favoriteId: intParseableString,
    }),
  }),
  async (req, res) => {
    const { favoriteId } = req.params;

    try {
      // await prisma.favorite.deleteMany({
      //   where: {
      //     itemId: +itemId,
      //   },
      // });
      // res.status(200).json({ message: "Favorite deleted successfully" });
      console.log(`Attempting to delete favorite with itemId: ${favoriteId}`);

      const deleteResult = await prisma.favorite.deleteMany({
        where: {
          id: +favoriteId,
        },
      });

      console.log(`Delete result: ${JSON.stringify(deleteResult)}`);

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
