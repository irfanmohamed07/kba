import express from 'express';
import pool from '../Db/index.js';
import bcrypt from 'bcrypt';

const router=express.Router();


router.get('/maintenanceadmin',(req,res)=>{
          res.render('maintenanceadminlogin');
});

router.post('/maintenanceadmin', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Query to find the admin in the admin-specific table
      const checkResult = await pool.query("SELECT * FROM maintenanceuser WHERE email = $1", [email]);
  
      if (checkResult.rows.length > 0) {
        const maintenanceadmin = checkResult.rows[0];
        const storedPassword = maintenanceadmin.password;
  
        // Compare password with stored password using bcrypt
        bcrypt.compare(password, storedPassword, (error, result) => {
          if (result) {
            // Set session data for the authenticated admin
            req.session.isMaintenanceAdminAuthenticated = true;
             
            req.session.maintenanceadmin = { 
              email: maintenanceadmin.email,
              role: 'maintenancetadmin', // role for access control
            };
            
            pool.query("INSERT INTO maintenanceuserlogins (email) VALUES ($1)", [email]);
  
            // After successful login, redirect to the admin panel
             return res.redirect('/maintenanceadminpanel');
          } else {
            // Password mismatch
            res.render('maintenanceadminlogin', { "error-message": "Incorrect password" });
          }
        });
      } else {
        // Email not found in admin table
        res.render('maintenanceadminlogin', { "error-message": "Email not found" });
      }
    } catch (error) {
      // Catch database or other errors
      console.error(error);
      res.render('maintenanceadminlogin', { "error-message": "Error occurred. Please try again" });
    }
  });


export default router;
