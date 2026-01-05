import express from "express";
import pool from "../Db/index.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads");

router.get("/rtadminpanel", async (req, res) => {
  if (req.session.isRtAdminAuthenticated) {
    const rtId = req.session.rtadmin.rtid; // Get RT ID from session data
    pool.query(
      "SELECT * FROM gatepasses WHERE rtid = $1 AND status = $2",
      [rtId, "pending"],
      (pendinggatepassesError, pendinggatepassesResult) => {
        if (pendinggatepassesError) {
          console.error(
            "Error fetching updated pending gatepasses: ",
            pendinggatepassesError
          );
          res.status(500).send("Internal Server Error");
          return;
        }
        pool.query(
          "SELECT * FROM gatepasses WHERE rtid = $1 AND status = $2",
          [rtId, "approved"],
          (approvedgatepassesError, approvedgatepassesResult) => {
            if (approvedgatepassesError) {
              console.error(
                "Error fetching updated pending gatepasses: ",
                approvedgatepassesError
              );
              res.status(500).send("Internal Server Error");
              return;
            }
            pool.query(
              "SELECT * FROM users WHERE rtid = $1 ",
              [rtId],
              (rtstudentsError, rtstudentsResult) => {
                if (rtstudentsError) {
                  console.error(
                    "Error fetching updated pending gatepasses: ",
                    rtstudentsError
                  );
                  res.status(500).send("Internal Server Error");
                  return;
                }
                res.render("rtadminpanel", {
                  pendinggatepasses: pendinggatepassesResult.rows,
                  approvedgatepasses: approvedgatepassesResult.rows,
                  rtstudents: rtstudentsResult.rows,
                });
              }
            );
          }
        );
      }
    );
  } else {
    // Redirect to login page if not authenticated
    res.redirect("/rtadmin");
  }
});

router.post("/approvegatepass/:id", async (req, res) => {
  const gatepassId = req.params.id; // Get the gatepass ID from the URL

  try {
    // Step 1: Fetch the RRN for the given gatepass ID from the gatepasses table
    const gatepassQuery = "SELECT rrn, pdf_url FROM gatepasses WHERE id = $1";
    const gatepassResult = await pool.query(gatepassQuery, [gatepassId]);

    if (gatepassResult.rows.length === 0) {
      return res.status(404).send("Gatepass not found.");
    }

    const { rrn, pdf_url } = gatepassResult.rows[0]; // Extract rrn and pdf_url

    // Step 2: Match the rrn with the user in the users table to retrieve the email
    const userQuery = "SELECT email,parent_email FROM users WHERE rrn = $1";
    const userResult = await pool.query(userQuery, [rrn]);

    if (userResult.rows.length === 0) {
      return res.status(404).send("User not found.");
    }

    const userEmail = userResult.rows[0].email; // Extract the email
    const parentEmail = userResult.rows[0].parent_email;

    // Step 3: Retrieve the PDF file from local uploads folder
    const fileName = pdf_url.split("/").pop(); // Extract file name from the URL
    const pdfFilePath = path.join(uploadsDir, fileName);

    // Read the PDF file from local storage
    const pdfBuffer = fs.readFileSync(pdfFilePath);

    // Step 4: Prepare email content and send the PDF
    const mailOptions = {
      from: process.env.NODEMAILER_EMAIL,
      to: [userEmail, parentEmail], // The user's email
      subject: "Your Gatepass PDF",
      text: "Dear user, your gate pass has been approved. Please find the attached gate pass.",
      attachments: [
        {
          filename: fileName,
          content: pdfBuffer, // Attach the PDF binary data from local file
        },
      ],
    };

    // Step 5: Send the email using Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_EMAIL, // Replace with your email
        pass: process.env.NODEMAILER_PASS, // Replace with your app password
      },
    });

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.error("Error occurred:", error);
        return res.status(500).send("Error sending email.");
      }
      const updateQuery = `UPDATE gatepasses SET status = 'approved' WHERE id = $1`; // Corrected query
      await pool.query(updateQuery, [gatepassId]);
      res.redirect("/rtadminpanel");
    });
  } catch (error) {
    console.error("Error processing the request:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/rejectgatepass/:id", async (req, res) => {
  const gatepassId = req.params.id;

  try {
    // Delete the gate pass from the database
    await pool.query("DELETE FROM gatepasses WHERE id = $1", [gatepassId]);

    res.redirect("/rtadminpanel");
  } catch (error) {
    console.error("Error rejecting gate pass:", error);
    res.status(500).send("Internal server error");
  }
});

router.post("/changertpassword", async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  // Check if the admin email is available in the session
  const rtadminEmail = req.session.rtadmin?.email; // Ensure session middleware is properly set up
  if (!rtadminEmail) {
    return res.send("Session expired. Please log in again.");
  }

  try {
    // Fetch the current hashed password for the admin using the email from session
    const result = await pool.query(
      "SELECT password FROM rt WHERE email = $1",
      [rtadminEmail]
    );
    if (result.rows.length === 0) {
      return res.send("Admin account not found");
    }

    const currentHashedPassword = result.rows[0].password;

    // Compare the old password with the stored hashed password
    const isMatch = await bcrypt.compare(oldPassword, currentHashedPassword);
    if (!isMatch) {
      return res.send("Old password is incorrect");
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10); // Default salt rounds = 10

    // Update the password in the database for the admin with the session's email
    await pool.query("UPDATE rt SET password = $1 WHERE email = $2", [
      hashedNewPassword,
      rtadminEmail,
    ]);

    // Redirect to admin dashboard or login page after successful password update
    res.redirect("/rtadminpanel");
  } catch (error) {
    console.error("Internal Server Error:", error);
    res.status(500).send("Internal server error");
  }
});

export default router;
