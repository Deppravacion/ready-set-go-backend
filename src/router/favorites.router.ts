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

//create a new fav
favoritesController.post(
  `/users/:userId/stores/:storeId/items/:itemId/favorite`,
  async (req, res) => {
    const { storeId, itemId } = req.params;
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
//definitely need to set middleware to handle checking for USER, STORE, ITEM etc.
favoritesController.delete(
  "/users/:userId/stores/:storeId/items/:itemId/favorite/delete",
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
    await prisma.favorite.deleteMany({
      where: {
        itemId: +itemId,
      },
    });
    // const favorites = await prisma.favorite.findMany({
    //   where: {
    //     id: +itemId,
    //   },
    // });

    res.status(200).json({ message: "Favorite deleted successfully" });
  }
);

export { favoritesController };
