import { encryptPassword } from "../src/auth-utils";
import { prisma } from "./db.setup";

const clearDb = async () => {
  // await prisma.dog.deleteMany();
  await prisma.favorite.deleteMany();
  console.log("deleted favorites");
  await prisma.item.deleteMany();
  console.log("deleted item");
  await prisma.store.deleteMany();
  console.log("deleted store");
  await prisma.user.deleteMany();
  console.log("deleted user");
};

const seed = async () => {
  console.log("Seeding the database...");
  await clearDb();

  //create tyson
  const tyson = await prisma.user.create({
    data: {
      email: "tyson@tyson.com",
      name: "player1-tyson",
      passwordHash: await encryptPassword("password"),
    },
  });

  // Create Jon
  const jon = await prisma.user.create({
    data: {
      email: "jon@jon.com",
      name: "comrade-jon",
      passwordHash: await encryptPassword("jonspassword"),
    },
  });
  // create peter
  const peter = await prisma.user.create({
    data: {
      email: "peter@peter.com",
      name: "coder-pete",
      passwordHash: await encryptPassword("peterspassword"),
    },
  });

  //create a store for tyson
  const garageFridge = await prisma.store.create({
    data: {
      name: "Garage-Fridge",
      user: {
        connect: { id: tyson.id },
      },
    },
  });
  const gameBox = await prisma.store.create({
    data: {
      name: "Drinking Games Storage",
      user: {
        connect: { id: tyson.id },
      },
    },
  });

  const poolStorage = await prisma.store.create({
    data: {
      name: "Pool-Storage",
      user: {
        connect: { id: peter.id },
      },
    },
  });

  //create item for garage-fridge
  const coldBeer = await prisma.item.create({
    data: {
      name: "Coors-Banquet",
      storeId: garageFridge.id,
      image: "default-image.jpg",
      description: "A refreshing beer",
      quantity: 30,
      minQuantity: 8,
    },
  });

  const sparklingWater = await prisma.item.create({
    data: {
      name: "Topo Chico",
      storeId: garageFridge.id,
      image: "default-image.jpg",
      description: "A refreshing mineral water",
      quantity: 16,
      minQuantity: 3,
    },
  });

  const orangeJuice = await prisma.item.create({
    data: {
      name: "Fresh Squeezed OJ",
      storeId: garageFridge.id,
      image: "default-image.jpg",
      description: "A refreshing pulpy juice",
      quantity: 2,
      minQuantity: 1,
    },
  });

  const dartsSet = await prisma.item.create({
    data: {
      name: "Red Dragon 25g tungston darts",
      storeId: gameBox.id,
      image: "default-image.jpg",
      description: "A quality dart set",
      quantity: 1,
      minQuantity: 0,
    },
  });

  const acid = await prisma.item.create({
    data: {
      name: "HCL Liquid Acid",
      storeId: poolStorage.id,
      image: "default-image.jpg",
      description: "A refreshing mineral water",
      quantity: 16,
      minQuantity: 3,
    },
  });

  const favoriteBeer = await prisma.favorite.create({
    data: {
      itemId: coldBeer.id,
    },
  });
  const favoriteWater = await prisma.favorite.create({
    data: {
      itemId: sparklingWater.id,
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
