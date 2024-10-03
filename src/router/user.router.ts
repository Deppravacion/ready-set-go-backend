import { Router } from "express";
import { validateRequest } from "zod-express-middleware";
import "express-async-errors";
import { z } from "zod";
import { prisma } from "../../prisma/db.setup";

const userController = Router();

userController.patch(
  "/users/:email",
  validateRequest({
    params: z.object({ email: z.string().email() }),
    body: z.object({ email: z.string().email() }),
  }),
  async (
    { body: { email: bodyEmail }, params: { email: paramsEmail } },
    res,
    next
  ) => {
    if (paramsEmail === bodyEmail) {
      return res.status(400).json({
        message:
          "Please change your email address to something different than your current email",
      });
    }
    const existingUser = await prisma.user
      .findFirstOrThrow({
        where: { email: paramsEmail },
      })
      .catch(() => null);

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return await prisma.user
      .update({
        where: {
          email: paramsEmail,
        },
        data: {
          email: bodyEmail,
        },
      })
      .then((user) => res.status(201).json(user))
      .catch((e) => {
        console.error(e);
        res.status(500).json({ message: "Username is taken" });
      })
      .finally(next);
  }
);

userController.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({});
    if (users.length === 0) {
      return res.status(404).json({ error: "No Users Found" });
    }
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

//add the zod to error and authmiddle ware to see if that helps
userController.get("/users/:userId", async (req, res) => {
  console.log(req.params);
  const { userId } = req.params;
  const user = await prisma.user.findUnique({
    where: {
      id: +userId,
    },
  });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

userController.get("/users/:userId/stores", async (req, res) => {
  console.log(req.params);
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

export { userController };
