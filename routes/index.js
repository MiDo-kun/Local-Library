const express = require('express');
const router = express.Router();
const path = require('path');

/* GET home page. */
router.get('/', function (req, res, next) {
   res.redirect('/catalog');
});

router.get('/architecture', function (req, res) {
   const filePath = path.join(__dirname, '../public/Layout.svg');
   res.sendFile(filePath);
})

module.exports = router;