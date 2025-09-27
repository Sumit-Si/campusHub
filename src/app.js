import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fs from "fs";
import path from "path";

const app = express();

const tempDir = path.join(process.cwd(), "public", "temp");

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true }); // "recursive" makes nested dirs if needed
}


// built in middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true,limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());


// custom routes
import healthCheckRouter from "./routes/healthcheck.routes.js";
import userRouter from "./routes/user.routes.js";
import adminRouter from "./routes/admin.routes.js"
import courseRouter from "./routes/course.routes.js"
import announcementRouter from "./routes/announcement.routes.js";
import resultRouter from "./routes/result.routes.js"
import enrollmentRouter from "./routes/enrollment.routes.js";
import attendanceRouter from "./routes/attendance.routes.js";
import notificationRouter from "./routes/notification.routes.js";


app.use("/api/v1/healthCheck",healthCheckRouter);
app.use("/api/v1/users",userRouter);
app.use("/api/v1/admin",adminRouter);
app.use("/api/v1/courses",courseRouter);
app.use("/api/v1/announcements",announcementRouter);
app.use("/api/v1/results",resultRouter);
app.use("/api/v1/enrollments", enrollmentRouter);
app.use("/api/v1/attendance", attendanceRouter);
app.use("/api/v1/notifications", notificationRouter);


export default app;
