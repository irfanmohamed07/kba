import express from "express";
import pool from "../Db/index.js";

const router = express.Router();


router.get('/carpentrywork',(req,res)=>{
    res.render('carpentrywork',{user: req.session.user});
});

router.post('/carpentry',async(req,res)=>{
    const {name, rrn,block,room_number, complaint}= req.body;
     
    try{
        const result=await pool.query("INSERT INTO carpentry_requests (name, rrn,block,room_number, complaint,maintenance_done,status) VALUES ($1,$2,$3,$4,$5,$6,$7)",[name, rrn,block,room_number, complaint,'No','pending']);
        res.render('carpentrywork',{"message":"carpentry work submitted successfully!",user: req.session.user});
    
    }
    catch(error){
        console.log(error);
        res.render('carpentrywork',{"message":"An error occured please try again later",user: req.session.user});
    }

});
export default router;
