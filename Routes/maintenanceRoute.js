import express from "express";

const router= express.Router();

router.get('/maintenance',(req,res)=>{
             res.render('maintenance',{user: req.session.user});
});


export default router;