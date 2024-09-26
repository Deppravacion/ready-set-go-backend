import { encryptPassword } from "../src/auth-utils";
import { prisma } from "./db.setup";

const clearDb = async () => {
  // await prisma.dog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.store.deleteMany();
  await prisma.item.deleteMany();
  await prisma.favorite.deleteMany();
};

const seed = async () => {
  console.log("Seeding the database...");
  await clearDb();

  // Create Jon
  const jon = await prisma.user.create({
    data: {
      email: "jon@jon.com",
      passwordHash: await encryptPassword("jonspassword"),
    },
  });
  // create peter
  const peter = await prisma.user.create({
    data: {
      email: "peter@peter.com",
      passwordHash: await encryptPassword("peterspassword"),
    },
  });

  //create a store for jon
  const garageFridge = await prisma.store.create({
    data: {
      name: "Garage-Fridge",
      owner: {
        connect: { id: jon.id },
      },
    },
  });

  //create item for garage-fridge
  const coldBeer = await prisma.item.create({
    data: {
      name: "Coors- Banquet",
      ownerId: garageFridge.id,
    },
  });
};

seed()
  .then(() => {
    console.log("Seeding complete");
  })
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
