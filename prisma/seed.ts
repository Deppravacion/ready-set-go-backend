import { encryptPassword } from "../src/auth-utils";
import { prisma } from "./db.setup";

const clearDb = async () => {
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

  //Create Andrei
  const andrei = await prisma.user.create({
    data: {
      email: "andrei@andrei.com",
      name: "Andrei",
      passwordHash: await encryptPassword("andreispassword"),
    },
  });
  // create peter
  const peter = await prisma.user.create({
    data: {
      email: "peter@peter.com",
      name: "Pete",
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
      image:
        "https://ipcdn.freshop.com/resize?url=https://images.freshop.com/00087800000096/d9ad2644a5e2b80432bd418403ad2113_large.png&width=512&type=webp&quality=90",
      description: "A refreshing beer",
      quantity: 30,
      minQuantity: 8,
    },
  });

  const sparklingWater = await prisma.item.create({
    data: {
      name: "Topo Chico",
      storeId: garageFridge.id,
      image:
        "https://i5.walmartimages.com/seo/Topo-Chico-Sparkling-Mineral-Water-12-Fluid-Ounce-24-per-Case_a388976c-566f-444a-a8f5-bbf5ed71f7b8.38ee976e3e010adacc60b1c5cddd3afe.jpeg?odnHeight=640&odnWidth=640&odnBg=FFFFFF",
      description: "A refreshing mineral water",
      quantity: 16,
      minQuantity: 3,
    },
  });

  const orangeJuice = await prisma.item.create({
    data: {
      name: "Fresh Squeezed OJ",
      storeId: garageFridge.id,
      image: "https://images.heb.com/is/image/HEBGrocery/001828129-1",
      description: "A refreshing pulpy juice",
      quantity: 2,
      minQuantity: 1,
    },
  });

  const dartsSet = await prisma.item.create({
    data: {
      name: "Red Dragon 25g tungston darts",
      storeId: gameBox.id,
      image: "https://i.ebayimg.com/images/g/g5sAAOSwfV5mTIeP/s-l1200.jpg",
      description: "A quality dart set",
      quantity: 1,
      minQuantity: 0,
    },
  });

  const acid = await prisma.item.create({
    data: {
      name: "HCL Liquid Acid",
      storeId: poolStorage.id,
      image:
        "https://i8.amplience.net/i/lesl/14291_01/ACID-Magic-1-Gallon?$pdpExtraLarge$&fmt=auto",
      description: "A refreshing mineral water",
      quantity: 16,
      minQuantity: 3,
    },
  });

  const favoriteOj = await prisma.favorite.create({
    data: {
      itemId: orangeJuice.id,
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
