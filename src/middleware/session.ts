import session from "express-session";

export const sessionMiddleware = session({
  secret: "secret-key",
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 10 * 60 * 1000 },
});
