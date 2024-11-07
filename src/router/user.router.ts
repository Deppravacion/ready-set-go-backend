import { Router } from "express";
import { validateRequest } from "zod-express-middleware";
import "express-async-errors";
import { z } from "zod";
import { prisma } from "../../prisma/db.setup";
import { encryptPassword } from "../auth-utils";
import { intParseableString } from "../utils/intParsableString";

const userController = Router();

//create user
userController.post(
  "/users/signup",
  validateRequest({
    body: z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string(),
      confirmPassword: z.string(),
    }),
  }),
  async (req, res) => {
    const { name, email, password } = req.body;
    try {
      const doesUserExist = await prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (doesUserExist) {
        return res.status(400).json({ message: "User already exists" });
      }
      const passwordHash = encryptPassword(password);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: (await passwordHash).toString(),
        },
      });
      console.log({ userDataFromUserRouterCreateUser: user });
      return res.status(200).json({ user });
    } catch (error) {
      console.error(error);
      throw new Error(res.status.toString());
    }
  }
);

//Update user
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

//all users
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
//user by id
userController.get(
  "/users/:userId",
  validateRequest({
    params: z.object({ userId: z.string() }),
  }),
  async (req, res) => {
    console.log({ userById: req.params });
    const { userId } = req.params;
    const user = await prisma.user.findUnique({
      where: {
        id: +userId,
      },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found with that ID" });
    }

    res.json(user);
  }
);

//get user by Email
userController.get(
  "/users/user/:email",
  validateRequest({
    params: z.object({
      email: z.string().email(),
    }),
  }),
  async (req, res) => {
    const { email } = req.params;
    console.log({ emailParamsGetUserByEmail: email });
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      return res.status(404).json({ error: "No user found with that email" });
    }
    res.json(user);
  }
);

//get user stores
userController.get(
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

export { userController };
