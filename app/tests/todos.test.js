const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../server");
const Todo = require("../models/Todo");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
  // clean database between tests
  await mongoose.connection.db.dropDatabase();
});

describe("Todos CRUD (HTTP)", () => {
  test("creates a todo via POST /", async () => {
    const res = await request(app)
      .post("/")
      .type("form")
      .send({ task: "Buy milk" });

    expect(res.status).toBe(302);

    const todo = await Todo.findOne({ task: "Buy milk" }).lean();
    expect(todo).toBeTruthy();
    expect(todo.task).toBe("Buy milk");
    expect(todo.completed).toBe(false);
  });

  test("edits a todo via POST /todo/edit", async () => {
    const created = await Todo.create({ task: "Old task" });

    const res = await request(app)
      .post("/todo/edit")
      .type("form")
      .send({ _key: created._id.toString(), task: "New task" });

    expect(res.status).toBe(302);

    const updated = await Todo.findById(created._id).lean();
    expect(updated.task).toBe("New task");
  });

  test("toggles a todo via POST /todo/toggle", async () => {
    const created = await Todo.create({ task: "Toggle me" });

    const res = await request(app)
      .post("/todo/toggle")
      .type("form")
      .send({ _key: created._id.toString() });

    expect(res.status).toBe(302);

    const toggled = await Todo.findById(created._id).lean();
    expect(toggled.completed).toBe(true);
  });

  test("destroys a todo via POST /todo/destroy", async () => {
    const created = await Todo.create({ task: "Delete me" });

    const res = await request(app)
      .post("/todo/destroy")
      .type("form")
      .send({ _key: created._id.toString() });

    expect(res.status).toBe(302);

    const found = await Todo.findById(created._id);
    expect(found).toBeNull();
  });
});
