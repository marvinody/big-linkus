import { db } from "./db";

async function seed() {
  try {
    await db.sync({ force: true });

    console.log("Successfully seeeded database!");
  } catch (err) {
    console.error(err);
  }
}

seed();
