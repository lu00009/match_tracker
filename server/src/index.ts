import express from "express";
import cors from "cors";
import { Request, Response } from "express";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.(); // In case compression middleware added later
  let counter = 1;
  const interval = setInterval(() => {
    res.write(`data: Count ${counter}\n\n`);
    counter++;
    if (counter > 5) {
      res.write("event: done\n");
      res.write("data: Stream complete\n\n");
      clearInterval(interval);
      res.end();
    }
  }, 1000);
  req.on("close", () => {
    clearInterval(interval);
  });
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
