import { Router } from "express";
import { validateRequest } from "zod-express-middleware";
import "express-async-errors";
import { z } from "zod";
import { prisma } from "../../prisma/db.setup";

const favoritesController = Router();

favoritesController.get(
  "/users/:userId/stores/:storeId/items/:itemId/favorite",
  async (req, res) => {
    const { userId, storeId, itemId } = req.params;

    console.log(
      "Received request with userId:",
      userId,
      "storeId:",
      storeId,
      "itemId:",
      itemId
    );

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

    console.log("Fetching favorites for itemId:", itemId);
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
