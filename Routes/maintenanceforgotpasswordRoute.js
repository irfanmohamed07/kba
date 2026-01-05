import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../Db/index.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const router=express.Router();

router.get('/maintenanceforgotpassword',(req,res)=>{
    res.render('maintenance-forgot-password');
});


router.post('/maintenanceforgotpassword',async(req,res)=>{
    const email = req.body.email;  
  
    try {
      // Check if the email exists in the database
      const checkResult = await pool.query("SELECT * FROM maintenanceuser WHERE email = $1", [email]);
      
    
      if (checkResult.rows.length === 0) {
        res.render('maintenance-forgot-password',{"error-message":"Email not Found"})
      }
   
      const token = crypto.randomBytes(32).toString('hex');
      const tokenExpiration = Date.now() + 3600000;  
       
  
   
      await pool.query("UPDATE maintenanceuser SET reset_token = $1, reset_token_expiration = $2 WHERE email = $3", [token, tokenExpiration, email]);
  
       
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.NODEMAILER_EMAIL,
          pass: process.env.NODEMAILER_PASS  
        }
      });
  
       
      const mailOptions = {
        to: email,
        from: process.env.NODEMAILER_EMAIL,
        subject: 'Password Reset',
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
               Please click on the following link, or paste this into your browser to complete the process:\n\n
               http://${req.headers.host}/maintenancereset/${token}\n\n
               If you did not request this, please ignore this email and your password will remain unchanged.\n`
      };
  
       
      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          console.error("Error sending email:", err);
          return   res.render('maintenance-forgot-password',{"error-message":"Error Sending Email"})
        }
         res.render('maintenance-forgot-password',{"error-message":"Reset link sent"})
      });
    } catch (err) {
      console.error("Internal Server Error:", err);
      res.render('maintenance-forgot-password',{"error-message":"Internal Server Error"})
    }
  });
  
   
router.get('/maintenancereset/:token', (req, res) => {
    const { token } = req.params;
    res.render('maintenance-reset-password', { token });
  });
  
  router.post("/maintenancereset/:token", async (req, res) => {
    const token = req.params.token;
    const  password  = req.body.confirmpassword;  // The new password from request body

    // Check if password is provided
    if (!password) {
      res.render('maintenance-reset-password',{"error-message":"password are required"})
    }
      if (!token) {
      res.render('maintenance-reset-password',{"error-message":"Token Expired"})
    }
  
    try {
      // Check if the token is valid
      const result = await pool.query(
        "SELECT * FROM maintenanceuser WHERE reset_token = $1 AND reset_token_expiration > $2",
        [token, Date.now()]
      );
  
      if (result.rows.length === 0) {
        res.render('maintenance-reset-password',{"error-message":"Invalid or expired token" });
      }
  
      const saltRounds = 10;  // The number of rounds for bcrypt hashing
      
      // Start bcrypt hashing
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
            return res.render('maintenance-reset-password',{"error-message":"Error hashing password"}); 
        }
        else{
        // Update the user with the new hashed password and clear the reset token
        try {
          await pool.query(
            "UPDATE maintenanceuser SET password = $1, reset_token = NULL, reset_token_expiration = NULL WHERE reset_token = $2",
            [hash, token]
          );
  
          // After successful update, redirect to login page
              res.redirect('/maintenanceadmin');
        } catch (dbError) {
          console.error("Error updating database:", dbError);
          res.render('maintenancet-reset-password',{"error-message":"Error updating database"});
        }
      }
      });
    } catch (err) {
      console.error("Internal Server Error:", err);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  });
export default router;
