import express from "express";

const router = express.Router();



router.get('/', (req, res) => {
  if (!req.session.isAuthenticated) {
    return res.redirect('/login');
  }


  res.render('home', { user: req.session.user });
})

router.get('/home', (req, res) => {
  if (!req.session.isAuthenticated) {
    return res.redirect('/login');
  }
  res.render('home', { user: req.session.user });
})

export default router;
