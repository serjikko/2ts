import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import mongoose, { Document, Schema } from "mongoose";
import session from "express-session";
import basicAuth from "express-basic-auth";

const app = express();
app.use(bodyParser.json());
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  }),
);

mongoose.connect("mongodb://localhost:27017/leetcode_clone", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

interface Example {
  input: string;
  output: string;
}

interface TaskDocument extends Document {
  title: string;
  description: string;
  examples: Example[];
  difficulty: string;
  tags: string[];
  additionalMaterials: string[];
}

const taskSchema: Schema = new Schema({
  title: String,
  description: String,
  examples: [{ input: String, output: String }],
  difficulty: String,
  tags: [String],
  additionalMaterials: [String],
});

interface UserDocument extends Document {
  username: string;
  password: string;
  role: "user" | "admin" | "interviewer";
  rating: number;
}

const userSchema: Schema = new Schema({
  username: String,
  password: String,
  role: {
    type: String,
    enum: ["user", "admin", "interviewer"],
    default: "user",
  },
  rating: Number,
});

const Task = mongoose.model<TaskDocument>("Task", taskSchema);
const User = mongoose.model<UserDocument>("User", userSchema);

const users: { name: string; pwd: string }[] = [
  { name: "admin", pwd: "supersecret" },
];

app.use(
  basicAuth({
    users: { admin: "supersecret" },
    challenge: true,
    unauthorizedResponse: "Authentication required.",
  }),
);

app.post("/login", (req: Request, res: Response): void => {
  const { username, password }: { username: string; password: string } =
    req.body;

  if (users.some((x) => x.name === username && x.pwd === password)) {
    return res.status(200).send("Login successful");
  }

  res.status(401).send("Authentication required.");
});

app.post("/logout", (req: Request, res: Response): void => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Could not log out.");
    }
    res.status(200).send("Logout successful.");
  });
});

app.post("/tasks", (req: Request, res: Response): void => {
  const newTask: TaskDocument = new Task(req.body);
  newTask
    .save()
    .then((task) => res.status(201).json(task))
    .catch((err) => res.status(400).json({ error: err.message }));
});

app.get("/tasks", (req: Request, res: Response): void => {
  Task.find()
    .then((tasks) => res.status(200).json(tasks))
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.put("/tasks/:id", (req: Request, res: Response): void => {
  Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((task) => res.status(200).json(task))
    .catch((err) => res.status(400).json({ error: err.message }));
});

app.delete("/tasks/:id", (req: Request, res: Response): void => {
  Task.findByIdAndDelete(req.params.id)
    .then(() => res.status(204).send())
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.post("/tasks/:id/comments", (req: Request, res: Response): void => {
  // Логика добавления комментария
});

app.post("/tasks/:id/rate", (req: Request, res: Response): void => {
  // Логика оценки задачи
});

app.listen(3000, (): void => {
  console.log("Сервер запущен на порту 3000");
});
