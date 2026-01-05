import express from 'express';
import pool from '../Db/index.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const router=express.Router();

router.get('/rtforgotpassword',(req,res)=>{

    res.render('rt-forgot-password');
});

router.post('/rtforgotpassword',async(req,res)=>{
    const email = req.body.email;  
  
    try {
      // Check if the email exists in the database
      const checkResult = await pool.query("SELECT * FROM rt WHERE email = $1", [email]);
      
    
      if (checkResult.rows.length === 0) {
        res.render('rt-forgot-password',{"error-message":"Email not Found"})
      }
   
      const token = crypto.randomBytes(32).toString('hex');
      const tokenExpiration = Date.now() + 3600000;  
       
  
   
      await pool.query("UPDATE rt SET reset_token = $1, reset_token_expiration = $2 WHERE email = $3", [token, tokenExpiration, email]);
  
       
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
               http://${req.headers.host}/rtreset/${token}\n\n
               If you did not request this, please ignore this email and your password will remain unchanged.\n`
      };
  
       
      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          console.error("Error sending email:", err);
          return   res.render('rt-forgot-password',{"error-message":"Error Sending Email"})
        }
         res.render('rt-forgot-password',{"error-message":"Reset link sent"})
      });
    } catch (err) {
      console.error("Internal Server Error:", err);
      res.render('rt-forgot-password',{"error-message":"Internal Server Error"})
    }
  });
  
   
router.get('/rtreset/:token', (req, res) => {
    const { token } = req.params;
    res.render('rt-reset-password', { token });
  });
  
  router.post("/rtreset/:token", async (req, res) => {
    const token = req.params.token;
    const  password  = req.body.confirmpassword;  // The new password from request body

    // Check if password is provided
    if (!password) {
      res.render('rt-reset-password',{"error-message":"password are required"})
    }
      if (!token) {
      res.render('rt-reset-password',{"error-message":"Token Expired"})
      }
  
    try {
      // Check if the token is valid
      const result = await pool.query(
        "SELECT * FROM rt WHERE reset_token = $1 AND reset_token_expiration > $2",
        [token, Date.now()]
      );
  
      if (result.rows.length === 0) {
        res.render('rt-reset-password',{"error-message":"Invalid or expired token" });
      }
  
      const saltRounds = 10;  // The number of rounds for bcrypt hashing
      
      // Start bcrypt hashing
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
            return res.render('rt-reset-password',{"error-message":"Error hashing password"}); 
        }
        else{
        // Update the user with the new hashed password and clear the reset token
        try {
          await pool.query(
            "UPDATE rt SET password = $1, reset_token = NULL, reset_token_expiration = NULL WHERE reset_token = $2",
            [hash, token]
          );
  
          // After successful update, redirect to login page
              res.redirect('/rtadmin');
        } catch (dbError) {
          console.error("Error updating database:", dbError);
          res.render('rt-reset-password',{"error-message":"Error updating database"});
        }
      }
      });
    } catch (err) {
      console.error("Internal Server Error:", err);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  });
export default router;
