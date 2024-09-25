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

//here i feel lost-ish
userController.get("/users/:userEmail/stores", async (req, res) => {
  console.log(req.params);
  const { userEmail } = req.params;
  const dogs = await prisma.store.findMany({
    where: {
      userEmail,
    },
  });
  res.json(dogs);
});

export { userController };
