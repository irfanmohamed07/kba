import express from 'express';
import pool from '../Db/index.js';
import bcrypt from 'bcrypt';

const router=express.Router();


router.get('/rtadmin',(req,res)=>{
    res.render('rtadminlogin');
});

router.post('/rtadmin', async (req, res) => {
    const { rtid, email, password } = req.body;

    try {
        // Query to find the admin in the RT table by email and rtid
        const checkQuery = "SELECT * FROM rt WHERE email = $1 AND rtid = $2";
        const checkResult = await pool.query(checkQuery, [email, rtid]);

        if (checkResult.rows.length > 0) {
            const rtadmin = checkResult.rows[0];
            const storedPassword = rtadmin.password;

            // Compare the password with the stored hashed password using bcrypt
            bcrypt.compare(password, storedPassword, (error, result) => {
                if (result) {
                    // Set session data for the authenticated RT admin
                    req.session.isRtAdminAuthenticated = true;
                    req.session.rtadmin = {
                        email: rtadmin.email,
                        rtid: rtadmin.rtid, // Add rtid to session data
                        role: 'rtadmin',   // Role for access control
                    };
                  pool.query("INSERT INTO rtlogins (email) VALUES ($1)", [email]);
  
                    // Redirect to the admin panel after successful login
                    return res.redirect('/rtadminpanel');
                } else {
                    // Handle password mismatch
                    res.render('rtadminlogin', { "error-message": "Incorrect password" });
                }
            });
        } else {
            // Handle case where email and rtid combination is not found
            res.render('rtadminlogin', { "error-message": "Invalid RT ID or email" });
        }
    } catch (error) {
        // Handle database or other errors
        console.error("Error during RT admin login:", error);
        res.render('rtadminlogin', { "error-message": "An error occurred. Please try again." });
    }
});




export default router;
