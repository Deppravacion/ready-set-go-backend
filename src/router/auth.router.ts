import { Router } from "express";
import { validateRequest } from "zod-express-middleware";
import "express-async-errors";
import { z } from "zod";
import { prisma } from "../../prisma/db.setup";
import bcrypt from "bcrypt";
import {
  createTokenForUser,
  createUnsecureUserInformation,
  encryptPassword,
} from "../auth-utils";

const authController = Router();

authController.post(
  "/auth/login",
  validateRequest({
    body: z.object({
      email: z.string().email(),
      password: z.string(),
    }),
  }),
  async ({ body: { email: bodyEmail, password: bodyPassword } }, res) => {
    const user = await prisma.user.findFirst({
      where: {
        email: bodyEmail,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      bodyPassword,
      user.passwordHash
    );
    if (!isPasswordCorrect)
      return res.status(401).json({ message: "invalid credentials" });

    const userInformation = createUnsecureUserInformation(user);
    const token = createTokenForUser(user);
    return res.status(200).json({ token, userInformation });
  }
);
//working here on signup logics
// authController.post(
//   "/signup",
//   validateRequest({
//     body: z.object({
//       name: z.string(),
//       email: z.string().email(),
//       password: z.string(),
//       confirmPassword: z.string(),
//     }),
//   }),
//   async (req, res) => {
//     const { name, email, password, confirmPassword } = req.body;
//     try {
//       const doesUserExist = await prisma.user.findUnique({
//         where: {
//           email,
//         },
//       });
//       if (doesUserExist) {
//         return res.status(400).json({ message: "User already exists" });
//       }
//       const passwordHash = encryptPassword(password);

//       const user = await prisma.user.create({
//         data: {
//           name,
//           email,
//           passwordHash: (await passwordHash).toString(),
//         },
//       });
//       console.log({ user: user });
//       return res.status(200).json({ user });
//     } catch (error) {}
//   }
// );

export { authController };
