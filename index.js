import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import homeRoute from "./Routes/homeRoute.js";
import gatepassRoute from "./Routes/gatepassRoute.js";
import maintenanceRoute from "./Routes/maintenanceRoute.js";
import housekeepingRoute from "./Routes/housekeepingRoute.js";
import electricalworkRoute from "./Routes/electricalworkRoute.js";
import carpentryworkRoute from "./Routes/carpentryworkRoute.js";
import medicalRoute from "./Routes/medicalRoute.js";
import aboutusRoute from "./Routes/aboutusRoute.js";
import userforgotpasswordRoute from "./Routes/userforgetpasswordRoute.js";
import loginRoute from "./Routes/loginRoute.js";
import managementadminloginRoute from "./Routes/managementadminloginRoute.js";
import managementadminpanelRoute from "./Routes/managementadminpanelRoute.js";
import managementadminforgotpasswordRoute from "./Routes/managementforgotpasswordRoute.js";
import maintenanceadmminloginRoute from "./Routes/maintenanceadminloginRoute.js";
import maintenanceadminpanelRoute from "./Routes/maintenanceadminpanelRoute.js";
import maintenanceforgotpasswordRoute from "./Routes/maintenanceforgotpasswordRoute.js";
import rtadminloginRoute from "./Routes/rtadminloginRoute.js";
import rtadminpanelRoute from "./Routes/rtadminpanelRoute.js";
import rtforgotpasswordRoute from "./Routes/rtforgotpasswordRoute.js";
import {
  checkAuthenticated,
  checkManagementAdminAuthenticated,
  checkMaintenanceAdminAuthenticated,
  checkRtAdminAuthenticated,
  checkWatchmanAuthenticated,
} from "./middleware/authmiddleware.js";
import watchmanRoute from "./Routes/watchmanRoute.js";
import watchmanloginRoute from "./Routes/watchmanloginRoute.js";
import smartMaintenanceRoute from "./Routes/smartMaintenanceRoute.js";
import chatbotRoute from "./Routes/chatbotRoute.js";
import messRoute from "./Routes/messRoute.js";

const app = express();
const port = 8000;

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, secure: false },
  })
);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/uploads", express.static("uploads")); // Serve uploaded PDFs
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // Enable JSON body parsing for API routes

// Global middleware to set user for all templates
app.use((req, res, next) => {
  res.locals.user = req.session.user ||
    req.session.managementadmin ||
    req.session.maintenanceadmin ||
    req.session.rtadmin ||
    req.session.watchman ||
    null;
  next();
});

app.use("/", loginRoute);
app.use("/", userforgotpasswordRoute);
app.use("/", managementadminloginRoute);
app.use("/", maintenanceadmminloginRoute);
app.use("/", rtadminloginRoute);
app.use("/", watchmanloginRoute);
app.use("/", checkMaintenanceAdminAuthenticated, maintenanceadminpanelRoute);
app.use("/", checkManagementAdminAuthenticated, managementadminpanelRoute);
app.use("/", checkRtAdminAuthenticated, rtadminpanelRoute);
app.use("/", checkWatchmanAuthenticated, watchmanRoute);
app.use("/", managementadminforgotpasswordRoute);
app.use("/", maintenanceforgotpasswordRoute);
app.use("/", rtforgotpasswordRoute);


app.use("/", chatbotRoute); // Chatbot API
app.use("/", messRoute); // Mess Prediction API

app.use("/", checkAuthenticated, homeRoute);
app.use("/", checkAuthenticated, gatepassRoute);
app.use("/", checkAuthenticated, maintenanceRoute);
app.use("/", checkAuthenticated, housekeepingRoute);
app.use("/", checkAuthenticated, electricalworkRoute);
app.use("/", checkAuthenticated, carpentryworkRoute);
app.use("/", checkAuthenticated, medicalRoute);
app.use("/", checkAuthenticated, aboutusRoute);
app.use("/", checkAuthenticated, smartMaintenanceRoute); // AI-powered maintenance


app.use((req, res, next) => {
  res.render("404");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
