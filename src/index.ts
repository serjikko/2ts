import express, { Express } from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import userRoutes from "./routes/users";
import taskRoutes from "./routes/tasks";

const app: Express = express();
const PORT: number = Number(process.env.PORT) || 3000;

// Подключение к MongoDB
mongoose.connect("mongodb://localhost:27017/task-manager", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
    console.log('Connection established with MongoDB');
})
.catch(error => console.error(error.message));

// Middleware
app.use(bodyParser.json());
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

// Запуск сервера
app.listen(PORT, (): void => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
