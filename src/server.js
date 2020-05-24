import * as sapper from "@sapper/server";
import compression from "compression";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import morgan from "morgan";
import sirv from "sirv";
dotenv.config();
const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";

express() // You can also use Express
  .use(
    morgan("dev"),
    session({
      secret: process.env.SESSION_SECRET || "i like turtles",
      resave: false,
      saveUninitialized: false,
    }),
    compression({ threshold: 0 }),
    sirv("static", { dev }),
    // load session for any page component to see
    sapper.middleware({
      session: (req, res) => ({
        tokens: {
          google: req.session.google_token,
        },
        username: req.session.username,
      }),
    })
  )
  .listen(PORT, (err) => {
    if (err) console.log("error", err);
  });
