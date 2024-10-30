import { Router } from "express";
import { prisma } from "../../prisma/db.setup";
import "express-async-errors";
import { validateRequest } from "zod-express-middleware";
import { z } from "zod";
import { intParseableString as intParseableString } from "../zod/intParsableString";
import { Store } from "@prisma/client";
import { deleteItemsAndFavoritesByStoreId } from "./helpers";

const storeController = Router();

//get stores for user
storeController.get(
  "/users/:userId/stores",
  validateRequest({
    params: z.object({
      userId: intParseableString,
    }),
  }),
  async (req, res) => {
    const { userId } = req.params;

    const stores = await prisma.store.findMany({
      where: {
        userId: +userId,
      },
    });
    res.json(stores);
  }
);

// get a store by storeId
storeController.get(
  "/users/:userId/stores/:storeId",
  validateRequest({
    params: z.object({
      userId: z.string(),
      storeId: z.string(),
    }),
  }),
  async (req, res) => {
    const { userId, storeId } = req.params;
    const stores = await prisma.store.findMany({
      where: {
        userId: +userId,
        id: +storeId,
      },
    });
    res.json(stores);
  }
);

// create a store
storeController.post(
  "/stores",
  validateRequest({
    body: z.object({
      name: z.string(),
      userId: z.string(),
    }),
  }),
  async (req, res) => {
    const { name, userId } = req.body;
    console.log({ createStoreRouter: req.body });
    const store: Store = await prisma.store
      .create({
        data: {
          name,
          userId: +userId,
        },
      })
      .catch((e) => e.message);

    if (!store) {
      return res.status(500).json({ message: "store not created" });
    }
    return res.json(store);
  }
);

// upadate a store
storeController.patch(
  "/stores/:storeId",
  validateRequest({
    body: z
      .object({
        name: z.string(),
        userEmail: z.string().email(),
      })
      .partial(),
    params: z.object({
      storeId: intParseableString,
    }),
  }),
  async (req, res) => {
    const storeId = parseInt(req.params.storeId as string);

    const doesStoreExist = await prisma.store
      .findFirstOrThrow({
        where: {
          id: storeId,
        },
      })
      .then(() => true)
      .catch(() => false);

    if (!doesStoreExist) {
      return res.status(404).json({ message: "Store not found" });
    }

    return await prisma.store
      .update({
        where: {
          id: storeId,
        },
        data: {
          ...req.body,
        },
      })
      .then((store) => res.status(201).json({ ...store }))
      .catch(() => res.status(500).json({ message: "Store not updated" }));
  }
);

storeController.delete(
  "/stores/:storeId",
  validateRequest({
    params: z.object({
      storeId: intParseableString,
    }),
  }),
  async (req, res) => {
    const { storeId } = req.params;
    console.log({ storeId: req.params.storeId });

    try {
      await deleteItemsAndFavoritesByStoreId(+storeId, res);
      await prisma.store
        .delete({
          where: {
            id: parseInt(req.params.storeId),
          },
        })
        .then(() => res.status(201).json({ message: "Store deleted" }))
        .catch(() => res.status(500).json({ message: "Store not deleted" }));
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to delete store and its items",
        details: (error as Error).message,
      });
    }
  }
);

export { storeController };
