import express from 'express';
import pool from '../Db/index.js';

const router=express.Router();


router.get('/medical',(req,res)=>{
    res.render('medical',{user: req.session.user});
});

router.post('/medical',async(req,res)=>{
    const {name, rrn,block,room_number,phone_number,issue}= req.body;
     
    try{
        const result=await pool.query("INSERT INTO medical_requests (name, rrn,block,room_number, phone_number,issue,service_done,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",[name, rrn,block,room_number,phone_number,issue,'No','pending']);
        res.render('medical',{"message":"Medical work submitted successfully!",user: req.session.user});
    
    }
    catch(error){
        console.log(error);
        res.render('medical',{"message":"An error occured please try again later",user: req.session.user});
    }

});

export default router;

