import { Router } from "express";
import { validateRequest } from "zod-express-middleware";
import "express-async-errors";
import { z } from "zod";
import { prisma } from "../../prisma/db.setup";
import { intParseableString } from "../zod/intParsableString";
import { Item } from "@prisma/client";

const itemsController = Router();

//gets all items for a store
itemsController.get(
  "/stores/:storeId/items",
  validateRequest({
    params: z.object({
      storeId: intParseableString,
    }),
  }),
  async (req, res) => {
    const { storeId } = req.params;

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
    console.log({ itemsRouter: "getting all of the items req" });
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
    const { storeId, itemId } = req.params;

    const item = await prisma.item.findUnique({
      where: {
        id: +itemId,
      },
    });

    res.status(200).json(item);
  }
);

//create item

itemsController.post(
  "/items",
  validateRequest({
    body: z.object({
      name: z.string(),
      image: z.string(),
      description: z.string(),
      quantity: z.string(),
      minQuantity: z.string(),
      storeId: z.string(),
    }),
  }),
  async (req, res) => {
    const { name, image, description, quantity, minQuantity, storeId } =
      req.body;

    const item: Item = await prisma.item
      .create({
        data: {
          name,
          image,
          description,
          quantity: +quantity,
          minQuantity: +minQuantity,
          storeId: +storeId,
        },
      })
      .catch((e) => e.message);
    if (!item) {
      return res.status(500).json({ message: "No Item Created" });
    }
    return res.json(item).json({ message: "Item Created" });
  }
);

itemsController.delete(
  "/items/:itemId",
  validateRequest({
    params: z.object({
      itemId: intParseableString,
    }),
  }),
  async (req, res) => {
    const { itemId } = req.params;

    const itemFav = await prisma.favorite.findFirst({
      where: {
        itemId: +itemId,
      },
    });

    if (itemFav != null) {
      try {
        await prisma.favorite.delete({
          where: {
            id: itemFav.id,
          },
        });
        console.log({ itemsRouter: "delete item req" });
        res.status(200).json({ message: "Favorite deleted successfully" });
      } catch (error) {
        console.error(error);
        res.status(500).json({
          error: "Failed to delete favorite",
          details: (error as Error).message,
        });
      }
    } else {
      // res.status(404).json({ error: "Favorite not found" });
      res.status(204).send();
    }

    await prisma.item.delete({
      where: {
        id: +itemId,
      },
    });

    res.status(200).send({ message: "the item has been deleted" });
  }
);
export { itemsController };
