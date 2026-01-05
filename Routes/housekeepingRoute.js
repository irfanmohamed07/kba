import express from 'express';
import pool from '../Db/index.js';

const router=express.Router();


router.get('/housekeeping',(req,res)=>{
    res.render('housekeeping',{user: req.session.user});
});

router.post('/housekeeping',async(req,res)=>{
    const {name, rrn,block,room_number}= req.body;
     
    try{
        const result=await pool.query("INSERT INTO housekeeping_requests (name, rrn,block,room_number,maintenance_done,status) VALUES ($1,$2,$3,$4,$5,$6)",[name, rrn,block,room_number,'No','pending']);
        res.render('housekeeping',{"message":"Housekeeping work submitted successfully!",user: req.session.user});
    
    }
    catch(error){
        console.log(error);
        res.render('housekeeping',{"message":"An error occured please try again later",user: req.session.user});
    }

});

export default router;

