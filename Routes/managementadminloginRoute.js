import express from "express";
import pool from "../Db/index.js";
import bcrypt from "bcrypt";

const router = express.Router();

router.get('/managementadmin',(req,res)=>{
    res.render('managementadminlogin');
});

router.post('/managementadmin', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Query to find the admin in the admin-specific table
      const checkResult = await pool.query("SELECT * FROM admin WHERE email = $1", [email]);
  
      if (checkResult.rows.length > 0) {
        const admin = checkResult.rows[0];
        const storedPassword = admin.password;
  
        // Compare password with stored password using bcrypt
        bcrypt.compare(password, storedPassword, (error, result) => {
          if (result) {
            // Set session data for the authenticated admin
            req.session.isManagementAdminAuthenticated = true;
             
            req.session.managementadmin = { 
              email: admin.email,
              role: 'managementadmin', // role for access control
            };
            pool.query("INSERT INTO admin_logins (email) VALUES ($1)", [email]);
  
            // After successful login, redirect to the admin panel
             return res.redirect('/managementadminpanel');
          } else {
            // Password mismatch
            res.render('managementadminlogin', { "error-message": "Incorrect password" });
          }
        });
      } else {
        // Email not found in admin table
        res.render('managementadminlogin', { "error-message": "Email not found" });
      }
    } catch (error) {
      // Catch database or other errors
      console.error(error);
      res.render('managementadminlogin', { "error-message": "Error occurred. Please try again" });
    }
  });
  
  
export default router;
