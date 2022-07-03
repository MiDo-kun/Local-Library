const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
   const content = `Respond with a resource <br> 
                    Accessing ./routes/users.js <br>
                    Using /users route in app.js`;

   res.send(content);
});

module.exports = router;