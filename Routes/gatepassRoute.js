import express from "express";
import axios from "axios";
import pool from "../Db/index.js";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
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

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

router.get("/gatepass", async (req, res) => {
  try {
    const rtResult = await pool.query("SELECT name FROM rt");
    const rtNames = rtResult.rows;

    // Fetch current user's gatepasses
    let myPasses = [];
    if (req.session.user && req.session.user.rrn) {
      const passResult = await pool.query(
        "SELECT * FROM gatepasses WHERE rrn = $1 ORDER BY id DESC",
        [req.session.user.rrn]
      );
      myPasses = passResult.rows;
    }

    res.render("gatepass", {
      rtNames,
      myPasses,
      user: req.session.user
    });
  } catch (error) {
    console.error("Error fetching gatepass page data:", error);
    res.render("gatepass", {
      message: "Error fetching data",
      user: req.session.user,
      rtNames: [],
      myPasses: []
    });
  }
});

router.get("/mypasses", async (req, res) => {
  try {
    let myPasses = [];
    if (req.session.user && req.session.user.rrn) {
      const passResult = await pool.query(
        "SELECT * FROM gatepasses WHERE rrn = $1 ORDER BY id DESC",
        [req.session.user.rrn]
      );
      myPasses = passResult.rows;
    }
    res.render("mypasses", {
      myPasses,
      user: req.session.user
    });
  } catch (error) {
    console.error("Error fetching My Passes:", error);
    res.render("mypasses", {
      message: "Error fetching data",
      user: req.session.user,
      myPasses: []
    });
  }
});

router.post("/gatepass", async (req, res) => {
  const {
    name,
    rrn,
    degree,
    block_room,
    time_out,
    time_in,
    reason,
    student_contact,
    parent_contact,
    rt_name,
  } = req.body;

  // Fetch the rt_id based on rrn from the users table
  let rt_id;
  try {
    const rtResult = await pool.query("SELECT rtid FROM users WHERE rrn = $1", [
      rrn,
    ]);

    if (rtResult.rows.length === 0) {
      return res.status(400).send("No RT found for the given RRN.");
    }

    rt_id = rtResult.rows[0].rtid; // Fetch the rt_id from the result

    // Fetch RT names from the database
    const result = await pool.query("SELECT name FROM rt");
    const rtNames = result.rows;

    // Insert the gatepass details into the database and fetch the id (assuming this table has a Gatepass id)
    const insertQuery = `
            INSERT INTO gatepasses (name, rrn, degree, block_room, time_out, time_in, reason, student_contact, parent_contact,rt_name, rtid)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING rtid,id
        `;
    const values = [
      name,
      rrn,
      degree,
      block_room,
      time_out,
      time_in,
      reason,
      student_contact,
      parent_contact,
      rt_name,
      rt_id,
    ];
    const insertResult = await pool.query(insertQuery, values);
    const gatepassId = insertResult.rows[0].id; // Assuming "id" is the generated Gatepass ID

    if (!gatepassId) {
      console.error("Gatepass ID was not returned properly.");
      return res.status(500).send("Failed to generate Gatepass ID.");
    }

    // Generate JSON data for QR Code
    let qrData = JSON.stringify(gatepassId);

    qrData = gatepassId.toString();
    // Generate QR Code as a Data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrData);

    // Setup PDF document
    const doc = new PDFDocument();
    const pdfFileName = `Gatepass_${rrn}_${Date.now()}.pdf`;
    const pdfFilePath = path.join(uploadsDir, pdfFileName);

    // Create write stream to save PDF locally
    const writeStream = fs.createWriteStream(pdfFilePath);

    // Pipe PDF document to the write stream
    doc.pipe(writeStream);

    // Set up the page with margin and border
    const margin = 50;
    const pageWidth = doc.page.width - 2 * margin;
    const pageHeight = doc.page.height - 2 * margin;
    doc.rect(margin, margin, pageWidth, pageHeight).stroke(); // Draw border around page

    // Add "Gate Pass Slip" title at the top
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("Gate Pass Slip", { align: "center", underline: true })
      .moveDown(6);
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("Kilakarai Buhari Aalim Mens Hostel", {
        align: "center",
        underline: true,
      })
      .moveDown(1);

    // Fetch image buffer from the external URL
    const imageUrl =
      "https://crescent.mastersofterp.in/Images/DEFAULT_BG/default_logo1.png";
    const response = await axios({
      method: "get",
      url: imageUrl,
      responseType: "arraybuffer",
    });
    const imageBuffer = Buffer.from(response.data);

    // Calculate logo dimensions
    const logoWidth = pageWidth * 0.8;
    const logoHeight = logoWidth / 4;

    // Position the logo below the title
    let yPosition = margin + 50; // Space before the logo
    doc.image(imageBuffer, margin + (pageWidth - logoWidth) / 2, yPosition, {
      width: logoWidth,
      height: logoHeight,
    });

    // Create gap after the logo
    const gapAfterLogo = logoHeight;
    yPosition += logoHeight + gapAfterLogo;

    // Define positions for the labels and values
    const labelX = margin + 30; // X position for labels
    const valueX = margin + 150; // X position for values (start after 150px)
    let lineHeight = 30; // Increase this value to control vertical space between rows

    // Populate the content fields in the PDF
    const fields = [
      { label: "Gatepass Id:", value: gatepassId }, // Display the gatepass ID from database
      { label: "Name:", value: name },
      { label: "RRN:", value: rrn },
      { label: "Degree:", value: degree },
      { label: "Block & Room:", value: block_room },
      { label: "Time Out:", value: time_out },
      { label: "Time In:", value: time_in || "Not specified" },
      { label: "Reason:", value: reason },
      { label: "Student Contact:", value: student_contact },
      { label: "Parent Contact:", value: parent_contact },
      { label: "RT Name:", value: rt_name },
      {
        label: "Date of Issue:",
        value: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
      },
    ];

    // Loop over fields and add them to the document
    fields.forEach((field) => {
      // Increase label width to 180 for wider label
      const labelWidth = 180;
      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .text(field.label, labelX, yPosition, { width: labelWidth });

      // Increase field width by increasing margin or field spacing
      const fieldWidth = 500; // Increase this to give more space for the value
      doc
        .font("Helvetica")
        .fontSize(14)
        .text(field.value, valueX, yPosition, { width: fieldWidth });

      // Increase spacing between rows for better vertical positioning
      yPosition += lineHeight; // Adjust this to control vertical spacing
    });

    // Generate QR Code
    // Embed QR Code into PDF
    const qrImageBuffer = Buffer.from(qrCodeDataUrl.split(",")[1], "base64");
    const qrX = doc.page.width - margin - 180; // Right corner
    const qrY = doc.page.height - margin - 180; // Bottom corner

    // Embed QR Code into PDF
    doc.image(qrImageBuffer, qrX, qrY, { width: 150, height: 150 });

    doc.end();

    // Wait for the PDF file to be written
    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    // Store local file path in database
    const pdfUrl = `/uploads/${pdfFileName}`;
    const updateQuery = `
            UPDATE gatepasses
            SET pdf_url = $1
            WHERE id = $2
        `;
    await pool.query(updateQuery, [pdfUrl, gatepassId]);

    // Fetch updated passes
    const passResult = await pool.query(
      "SELECT * FROM gatepasses WHERE rrn = $1 ORDER BY id DESC",
      [rrn]
    );
    const myPasses = passResult.rows;

    // Send response with PDF link and success message
    res.render("gatepass", {
      rtNames,
      myPasses,
      message: "Gatepass request sent successfully!",
      pdfUrl: pdfUrl,
      user: req.session.user,
    });
  } catch (error) {
    const result = await pool.query("SELECT name FROM rt");
    const rtNames = result.rows;
    // Fetch passes even on error if possible
    let myPasses = [];
    if (req.session.user && req.session.user.rrn) {
      const passResult = await pool.query(
        "SELECT * FROM gatepasses WHERE rrn = $1 ORDER BY id DESC",
        [req.session.user.rrn]
      );
      myPasses = passResult.rows;
    }

    console.error("Error processing gatepass request:", error);
    res.render("gatepass", {
      rtNames,
      myPasses,
      message: "There was an error processing your request. Please try again.",
      user: req.session.user,
    });
  }
});

export default router;
