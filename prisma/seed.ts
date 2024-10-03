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

  // Create Jon
  const jon = await prisma.user.create({
    data: {
      email: "jon@jon.com",
      name: "jon",
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
      user: {
        connect: { id: jon.id },
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
  console.log("crated garage fridge: id", garageFridge.id);
  console.log("created beer, store Id: ", coldBeer.storeId);
  console.log("created beer, beer ID: ", coldBeer.id);
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

  const favoriteBeer = await prisma.favorite.create({
    data: {
      itemId: coldBeer.id,
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
