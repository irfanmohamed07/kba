import express from "express";

const router = express.Router();

router.get('/aboutus',(req,res)=>{
    res.render('aboutus',{user: req.session.user});
});

export default router;