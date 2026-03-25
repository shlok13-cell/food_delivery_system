import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app";
import { logger } from "./lib/logger";
import { setIO } from "./socket";
import { getAssignments } from "./routes/delivery";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const httpServer = createServer(app);

const io = new Server(httpServer, {
  path: "/api/socket.io",
  cors: { origin: "*", methods: ["GET", "POST"] },
  transports: ["websocket", "polling"],
});

setIO(io);

const simProgress = new Map<number, number>();

io.on("connection", (socket) => {
  logger.debug({ id: socket.id }, "Socket connected");

  socket.on("join:track", (orderId: string | number) => {
    const room = `order:${orderId}`;
    socket.join(room);
    const a = getAssignments().find(x => x.order_id === Number(orderId));
    if (a && (a.status === "picked_up" || a.status === "en_route")) {
      const initial = a.status === "en_route" ? 0.35 : 0.08;
      const progress = simProgress.get(a.id) ?? initial;
      const lat = a.restaurant_lat + (a.customer_lat - a.restaurant_lat) * progress;
      const lng = a.restaurant_lng + (a.customer_lng - a.restaurant_lng) * progress;
      socket.emit("location:update", {
        lat, lng, progress, status: a.status,
        restaurant_name: a.restaurant_name,
        customer_name: a.customer_name,
        simulated: true,
      });
    } else if (a) {
      socket.emit("location:update", {
        lat: a.restaurant_lat, lng: a.restaurant_lng, progress: 0,
        status: a.status, restaurant_name: a.restaurant_name,
        customer_name: a.customer_name, simulated: true,
      });
    }
  });

  socket.on("join:delivery", (assignmentId: string | number) => {
    socket.join(`delivery:${assignmentId}`);
    logger.debug({ assignmentId }, "Delivery partner joined room");
  });

  socket.on("location:update", (data: { assignmentId: number; lat: number; lng: number }) => {
    const { assignmentId, lat, lng } = data;
    const a = getAssignments().find(x => x.id === assignmentId);
    if (!a) return;
    const totalLat = a.customer_lat - a.restaurant_lat;
    const totalLng = a.customer_lng - a.restaurant_lng;
    const dLat = lat - a.restaurant_lat;
    const dLng = lng - a.restaurant_lng;
    const dist = Math.sqrt(totalLat ** 2 + totalLng ** 2);
    const traveled = Math.sqrt(dLat ** 2 + dLng ** 2);
    const progress = dist > 0 ? Math.min(traveled / dist, 1) : 0;
    simProgress.set(assignmentId, progress);
    io.to(`order:${a.order_id}`).emit("location:update", {
      lat, lng, progress, status: a.status,
      restaurant_name: a.restaurant_name,
      customer_name: a.customer_name,
      simulated: false,
    });
  });

  socket.on("disconnect", () => {
    logger.debug({ id: socket.id }, "Socket disconnected");
  });
});

setInterval(() => {
  const assignments = getAssignments();
  for (const a of assignments) {
    if (a.status !== "picked_up" && a.status !== "en_route") continue;
    const initial = a.status === "en_route" ? 0.35 : 0.08;
    const current = simProgress.get(a.id) ?? initial;
    const next = Math.min(current + 0.008, 0.97);
    simProgress.set(a.id, next);
    const lat = a.restaurant_lat + (a.customer_lat - a.restaurant_lat) * next;
    const lng = a.restaurant_lng + (a.customer_lng - a.restaurant_lng) * next;
    io.to(`order:${a.order_id}`).emit("location:update", {
      lat, lng, progress: next, status: a.status,
      restaurant_name: a.restaurant_name,
      customer_name: a.customer_name,
      simulated: true,
    });
  }
}, 3000);

httpServer.listen(port, () => {
  logger.info({ port }, "Server listening");
});

httpServer.on("error", (err) => {
  logger.error({ err }, "Error listening on port");
  process.exit(1);
});
