import { createServer } from "node:http";
import next from "next";
import { initSocketServer } from "./server/index";

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT ?? "3000", 10);

const app = next({ dev });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  initSocketServer(httpServer);
  httpServer.on("error", (err: NodeJS.ErrnoException) => {
    console.error("HTTP server error:", err.message);
    process.exit(1);
  });
  httpServer.listen(port, () =>
    console.log(`> Ready on http://localhost:${port}`)
  );
});