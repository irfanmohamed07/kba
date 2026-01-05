import express from "express";
import pool from "../Db/index.js";
import cron from "node-cron";

const app = express.Router();

app.get("/watchmanpanel", (req, res) => {
  if (req.session.isWatchmanAuthenticated) {
    res.render("watchman", { results: null });
  } else {
    res.redirect("/watchman");
  }
});

app.post("/search", (req, res) => {
  let gatePassId = req.body.gatePassId;

  const query = "SELECT * FROM gatepasses WHERE id = $1";
  pool.query(query, [gatePassId], (err, result) => {
    if (err) {
      console.error("Error executing query", err.stack);
      return res.status(500).send("Database query error");
    }

    if (result.rows.length > 0) {
      res.render("watchman", { results: result.rows });
    } else {
      res.render("watchman", {
        results: "No Gate Pass found with the provided ID.",
      });
    }
  });
});

app.post("/update-status", (req, res) => {
  const gatePassId = req.body.gatePassId;
  const newStatus = req.body.status;

  const checkExpiryQuery = `
      SELECT * FROM gatepasses 
      WHERE id = $1;
    `;

  pool.query(checkExpiryQuery, [gatePassId], (err, result) => {
    if (err) {
      console.error("Error checking gate pass status", err.stack);
      return res.status(500).send("Error checking gate pass status");
    }

    if (result.rows.length === 0) {
      return res.status(400).send("Gate pass does not exist");
    }

    const gatePass = result.rows[0];

    if (new Date(gatePass.time_in) < new Date()) {
      const updateExpiredQuery = `
          UPDATE gatepasses 
          SET status = 'Expired' 
          WHERE id = $1;
        `;

      pool.query(updateExpiredQuery, [gatePassId], (err, result) => {
        if (err) {
          console.error("Error updating expired gate pass", err.stack);
          return res.status(500).send("Error updating expired gate pass");
        }
        res.render("watchman", {
          results: "Gate pass expired due to time_in being in the past",
        });
      });
    } else {
      if (newStatus === "Reached") {
        const deleteQuery = `
            DELETE FROM gatepasses WHERE id = $1;
          `;

        pool.query(deleteQuery, [gatePassId], (err, result) => {
          if (err) {
            console.error("Error deleting gate pass", err.stack);
            return res.status(500).send("Error deleting gate pass");
          }
          res.redirect("/watchmanpanel");
        });
      } else {
        const updateQuery = `
            UPDATE gatepasses 
            SET status = $1 
            WHERE id = $2;
          `;

        pool.query(updateQuery, [newStatus, gatePassId], (err, result) => {
          if (err) {
            console.error("Error updating gate pass status", err.stack);
            return res.status(500).send("Error updating gate pass status");
          }
          res.redirect("/watchmanpanel");
        });
      }
    }
  });
});

export default app;
