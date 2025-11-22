const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Product = require("../models/productModel");

// .env file configuration
dotenv.config({ path: "./config.env" });

// Database connection
const db = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(db)
  .then(() => {
    console.log("connected to the DataBase");
  })
  .catch((err) => {
    console.log(`Error while connecting the database: ${err}`);
  });

// image placeholers
function sampleImage() {
  const id = faker.number.int({ min: 10, max: 1000 });
  return `https://picsum.photos/seed/${id}/800/600`;
}

// creating product
function makeProduct(i) {
  const name = faker.commerce.productName();
  const price = Number(faker.commerce.price(10, 500, 2));
  const discount =
    Math.random() < 0.3
      ? Number((Math.random() * (price * 0.3)).toFixed(2))
      : 0;
  const images = [sampleImage(), sampleImage(), sampleImage()];
  return {
    name,
    slug: faker.helpers.slugify(name).toLowerCase(),
    description:
      faker.commerce.productDescription() + " " + faker.lorem.sentences(2),
    price,
    priceDiscount: discount,
    category: faker.commerce.department(),
    imageCover: images[0],
    images,
    stock: faker.number.int({ min: 0, max: 200 }),
    ratingsAverage: Number((Math.random() * 2 + 3).toFixed(1)), // 3.0 - 5.0
    ratingsQuantity: faker.number.int({ min: 0, max: 2000 }),
    available: Math.random() > 0.05,
  };
}

// importing data
async function importData() {
  try {
    // wipe collections (CAUTION in prod)
    await User.deleteMany();
    await Product.deleteMany();

    // create users
    const users = [];
    const passwordPlain = "test1234";
    const hashed = await bcrypt.hash(passwordPlain, 12);

    // 2 admins
    users.push({
      name: "Admin One",
      email: "admin1@example.com",
      role: "admin",
      password: hashed,
    });
    users.push({
      name: "Admin Two",
      email: "admin2@example.com",
      role: "admin",
      password: hashed,
      phoneNumber: "+01012966068",
    });

    // 15 regular users
    const egyptPrefixes = ["010", "011", "012", "015"];
    function makePhoneNumber() {
      return (
        "+2" +
        egyptPrefixes[Math.floor(Math.random() * egyptPrefixes.length)] +
        faker.number.int({ min: 10000000, max: 99999999 }).toString()
      );
    }
    for (let i = 0; i < 15; i++) {
      users.push({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        role: "user",
        password: hashed,
        phoneNumber: makePhoneNumber(),
      });
    }

    const createdUsers = await User.create(users, {
      validateBeforeSave: false,
    });
    console.log(`Created ${createdUsers.length} users`);

    // create products
    const products = [];
    const PRODUCT_COUNT = 50;
    for (let i = 0; i < PRODUCT_COUNT; i++) products.push(makeProduct(i));
    const createdProducts = await Product.create(products);
    console.log(`Created ${createdProducts.length} products`);

    console.log("Seed data imported!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

// Deleting data
async function deleteData() {
  try {
    await User.deleteMany();
    await Product.deleteMany();
    console.log("Data deleted");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

// Running the script
const arg = process.argv[2];
if (arg === "--import") importData();
if (arg === "--delete") deleteData();
