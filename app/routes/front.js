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
  let newTask = req.body.task;

  // Basic validation and sanitization for the updated task
  if (typeof newTask !== "string") {
    return res.status(400).send("Invalid task input.");
  }

  newTask = newTask.trim();

  // Adjust these constraints if they differ from the model's validation
  const MAX_TASK_LENGTH = 200;
  const TASK_PATTERN = /^[\w\s.,!?'"-]*$/u;

  if (!newTask || newTask.length === 0) {
    return res.status(400).send("Task cannot be empty.");
  }

  if (newTask.length > MAX_TASK_LENGTH) {
    return res.status(400).send("Task is too long.");
  }

  if (!TASK_PATTERN.test(newTask)) {
    return res
      .status(400)
      .send("Task contains invalid characters.");
  }

  try {
    await Todo.findByIdAndUpdate(taskKey, { task: newTask });
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to update task.");
  }
});

// POST - Toggle completion status
router.post("/todo/toggle", async (req, res) => {
  try {
    const taskKey = req.body._key;
    const todo = await Todo.findById(taskKey);

    if (!todo) {
      return res.status(404).send("Todo not found");
    }

    todo.completed = !todo.completed;
    await todo.save();
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while toggling the todo item");
  }
});

module.exports = router;
