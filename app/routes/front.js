const express = require("express");
const Todo = require("./../models/Todo");

const router = express.Router();

// Home page route
router.get("/", async (req, res) => {
  const todos = await Todo.find();
  res.render("todos", {
    tasks: Object.keys(todos).length > 0 ? todos : {},
  });
});

// Health endpoint for probes and CI smoke tests
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// POST - Submit Task
router.post("/", (req, res) => {
  const newTask = new Todo({
    task: req.body.task,
  });

  newTask
    .save()
    .then(() => res.redirect("/"))
    .catch((err) => console.log(err));
});

// POST - Destroy todo item
router.post("/todo/destroy", async (req, res) => {
  const taskKey = req.body._key;
  await Todo.findOneAndRemove({ _id: taskKey });
  res.redirect("/");
});

// POST - Edit todo item
router.post("/todo/edit", async (req, res) => {
  const taskKey = req.body._key;
  const newTask = req.body.task;
  await Todo.findByIdAndUpdate(taskKey, { task: newTask });
  res.redirect("/");
});

// POST - Toggle completion status
router.post("/todo/toggle", async (req, res) => {
  const taskKey = req.body._key;
  const todo = await Todo.findById(taskKey);
  if (todo) {
    todo.completed = !todo.completed;
    await todo.save();
  }
  res.redirect("/");
});

module.exports = router;
