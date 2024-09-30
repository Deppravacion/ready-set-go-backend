import { User } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";

// Extend the Request interface to include the user property
declare module "express-serve-static-core" {
  interface Request {
    user?: User;
  }
}
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../prisma/db.setup";

const saltRounds = 11;

export const encryptPassword = (password: string) => {
  return bcrypt.hash(password, saltRounds);
};

export const createUnsecureUserInformation = (user: User) => ({
  email: user.email,
});

// export const createTokenForUser = (user: User) => {
//   return jwt.sign(createUnsecureUserInformation(user), "super-secret");
// };

export const createTokenForUser = (user: User) => {
  return jwt.sign(
    createUnsecureUserInformation(user),
    "super-secret" //replaced using the env
    // process.env.JWT_SECRET
  );
};

const jwtInfoSchema = z.object({
  email: z.string().email(),
  // id: z.number(),
  iat: z.number(),
});

export const getDataFromAuthToken = (token: string) => {
  if (!token) return null;
  try {
    return jwtInfoSchema.parse(jwt.verify(token, "super-secret"));
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // ! JWT handing stuff below commented out for user type
  const [, token] = req.headers.authorization?.split?.(" ") || [];
  // console.log({ token: token });
  const myJwtData = getDataFromAuthToken(token);
  if (!myJwtData) {
    return res.status(401).json({ message: "Invalid Token" });
  }
  // const { userEmail } = req.body;
  const { email } = myJwtData;
  const userFromJwt = await prisma.user.findFirst({
    where: {
      email,
    },
  });
  console.log({ myJwtData: myJwtData });
  if (!userFromJwt) {
    return res.status(401).json({ message: "User not found" });
  }
  req.user = userFromJwt;
  console.log();
  next();
  // !JWT jandling stuff above
};
