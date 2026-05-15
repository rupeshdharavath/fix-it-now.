import express from "express"
import "dotenv/config"
import { connectDb } from "./lib/db.js"
import cors from "cors";
import cron from "node-cron";
import authRoutes from  "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import workerRoutes from "./routes/worker.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import { update_completed_jobs } from "./controller/booking.controller.js";

const app = express()
const port = process.env.PORT;

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/worker",workerRoutes);
app.use("/api/booking",bookingRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/reviews",reviewRoutes);
app.use("/api/notifications", notificationRoutes);

connectDb()
    .then(()=>{
        // run update task once after DB connection is established
        update_completed_jobs();

        // schedule periodic updates only after DB is ready
        cron.schedule("0/30 * * * *", async () => {
          await update_completed_jobs();
        });

                app.listen(port);
    })
    .catch((err)=>{
         console.error("❌ Failed to start server:", err.message);
    });


