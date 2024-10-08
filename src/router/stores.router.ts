import { NextFunction, Request, Response, Router } from "express";
import { prisma } from "../../prisma/db.setup";
import "express-async-errors";
import { validateRequest } from "zod-express-middleware";
import { z } from "zod";
import { intParseableString as intParseableString } from "../zod/intParsableString";
import { authMiddleware, getDataFromAuthToken } from "../auth-utils";
import { Store } from "@prisma/client";

const storeController = Router();
// TODO  refactor from { dog } -> { store }

//get stores for user
storeController.get("/users/:userId/stores", async (req, res) => {
  const { userId } = req.params;
  const user = await prisma.user.findUnique({
    where: {
      id: +userId,
    },
  });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const stores = await prisma.store.findMany({
    where: {
      userId: user.id,
    },
  });
  res.json(stores);
});

// get a store by storeId
storeController.get("/users/:userId/stores/:storeId", async (req, res) => {
  const { userId, storeId } = req.params;
  const user = await prisma.user.findUnique({
    where: {
      id: +userId,
    },
  });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const stores = await prisma.store.findMany({
    where: {
      userId: user.id,
      id: +storeId,
    },
  });
  res.json(stores);
});

// TODO
// Needs ______?
storeController.post(
  "/stores",

  validateRequest({
    body: z.object({
      name: z.string(),
      userId: z.string(),
    }),
  }),
  authMiddleware,
  async (req, res) => {
    const { name, userId } = req.body;
    const store: Store = await prisma.store
      .create({
        data: {
          name,
          userId: parseInt(userId),
        },
      })
      .catch((e) => e.message);

    if (!store) {
      return res.status(500).json({ message: "store not created" });
    }
    return res.json(store);
  }
);

// TODO
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
  async (req, res, next) => {
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

// // TODO
// // Needs _____?
storeController.delete(
  "/stores/:storeId",
  validateRequest({
    params: z.object({
      storeId: intParseableString,
    }),
  }),
  async (req, res) => {
    console.log({ storeId: req.params.storeId });
    await prisma.store
      .delete({
        where: {
          id: parseInt(req.params.storeId),
        },
      })
      .then(() => res.status(201).json({ message: "Store deleted" }))
      .catch(() => res.status(500).json({ message: "Store not deleted" }));
  }
);

export { storeController };