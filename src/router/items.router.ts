import { Router } from "express";
import { validateRequest } from "zod-express-middleware";
import "express-async-errors";
import { z } from "zod";
import { prisma } from "../../prisma/db.setup";
import { intParseableString } from "../zod/intParsableString";

const itemsController = Router();

//gets all items for a store
itemsController.get(
  "/stores/:storeId/items",
  // "/users/:userId/stores/:storeId/items",
  validateRequest({
    params: z.object({
      // userId: intParseableString,
      storeId: intParseableString,
    }),
  }),
  async (req, res) => {
    const { storeId } = req.params;
    // const { userId, storeId } = req.params;
    // const user = await prisma.user.findUnique({
    //   where: {
    //     id: +userId,
    //   },
    // });
    // if (!user) {
    //   return res.status(404).json({ error: "User not found" });
    // }

    const items = await prisma.item.findMany({
      where: {
        storeId: +storeId,
      },
    });
    if (items.length === 0) {
      return res
        .status(200)
        .json({ message: "No items found for this store", items: [] });
    }

    res.status(200).json(items);
  }
);

//get an item by id
itemsController.get(
  "/stores/:storeId/items/:itemId",
  validateRequest({
    params: z.object({
      storeId: intParseableString,
      itemId: intParseableString,
    }),
  }),
  async (req, res) => {
    // const { storeId } = req.params;
    const { storeId, itemId } = req.params;
    // const user = await prisma.user.findUnique({
    //   where: {
    //     id: +userId,
    //   },
    // });
    // if (!user) {
    //   return res.status(404).json({ error: "User not found" });
    // }

    const item = await prisma.item.findUnique({
      where: {
        id: +itemId,
      },
    });

    res.status(200).json(item);
  }
);

export { itemsController };
