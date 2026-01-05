import express from "express";
import pool from "../Db/index.js";
import bcrypt from "bcrypt";

const router = express.Router();

router.get("/watchman", (req, res) => {
  res.render("watchmanlogin");
});

router.post("/watchman", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Query to find the admin in the admin-specific table
    const checkResult = await pool.query(
      "SELECT * FROM watchman WHERE email = $1",
      [email]
    );

    if (checkResult.rows.length > 0) {
      const watchman = checkResult.rows[0];
      const storedPassword = watchman.password;

      // Compare password with stored password using bcrypt
      bcrypt.compare(password, storedPassword, (error, result) => {
        if (result) {
          // Set session data for the authenticated admin
          req.session.isWatchmanAuthenticated = true;

          req.session.watchman = {
            email: watchman.email,
            role: "watchman", // role for access control
          };

          return res.redirect("/watchmanpanel");
        } else {
          // Password mismatch
          res.render("watchmanlogin", {
            "error-message": "Incorrect password",
          });
        }
      });
    } else {
      // Email not found in admin table
      res.render("watchmanlogin", { "error-message": "Email not found" });
    }
  } catch (error) {
    // Catch database or other errors
    console.error(error);
    res.render("watchmanlogin", {
      "error-message": "Error occurred. Please try again",
    });
  }
});

export default router;
