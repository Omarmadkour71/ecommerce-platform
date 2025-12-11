jest.mock("stripe");

const request = require("supertest");
const app = require("../app");
const { getToken } = require("./setup");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");

describe("Cart API", () => {
  test("should add item to cart", async () => {
    const testProduct = await Product.create({
      name: "test product",
      price: 100,
      category: "Testing",
      description: "this item is for testing only",
      stock: 3,
    });
    const res = await request(app)
      .post("/api/v1/cart/item")
      .set("Authorization", `Bearer ${getToken()}`)
      .send({
        product: testProduct._id,
        quantity: 3,
      })
      .expect(201);
    expect(res.body.data.cart.totalQuantity).toBe(3);
    expect(res.body.data.cart.totalPrice).toBe(300);
  });

  test("should delete item from cart", async () => {
    const testProduct = await Product.create({
      name: "test product",
      price: 100,
      category: "Testing",
      description: "this item is for testing only",
      stock: 3,
    });
    const token = getToken();
    const cartRes = await request(app)
      .post("/api/v1/cart/item")
      .set("Authorization", `Bearer ${token}`)
      .send({
        product: testProduct._id,
        quantity: 3,
      })
      .expect(201);

    const res = await request(app)
      .delete(
        `/api/v1/cart/${cartRes.body.data.cart._id}/item/${testProduct._id}`
      )
      .set("Authorization", `Bearer ${token}`)
      .send({
        quantity: 1,
      })
      .expect(200);
    expect(res.body.data.userCart.totalQuantity).toBe(2);
  });
});
