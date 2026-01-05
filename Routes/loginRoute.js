import express from "express";
import pool from '../Db/index.js';
import bcrypt from 'bcrypt';

const router= express.Router();

router.get('/login',(req,res)=>{
    res.render('login');
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const checkResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      
      if (checkResult.rows.length > 0) {
        const user = checkResult.rows[0];
        const storedPassword = user.password;
  
        bcrypt.compare(password, storedPassword, (error, result) => {
          if (result) {
             
            req.session.isAuthenticated = true;
            req.session.user = { 
              email: user.email, 
              name: user.name
            };
  
             
            pool.query("INSERT INTO logins (email) VALUES ($1)", [email]);
  
             
            res.redirect('/');
          } else {
           
            res.render('login', { "error-message": "Incorrect password" });
          }
        });
      } else {
        
        res.render('login', { "error-message": "Email not found" });
      }
    } catch (error) {
        console.log(error)
       
      res.render('login', { "error-message": "Error occurred. Please try again" });
    }
  });

router.get("/logout", (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).send("Error logging out");
      }
      res.redirect('/');
    });
  });

export default router;
