import { User } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
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

export const createTokenForUser = (user: User) => {
  return jwt.sign(createUnsecureUserInformation(user), "super-secret");
};
