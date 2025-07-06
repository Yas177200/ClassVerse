const express = require('express');
const router = express.Router();
const { createUser, 
        updateUser,
        deleteUser,
        updatePass
    } = require('../controllers/userController');


router.post('/createuser', createUser);
router.put('/updateuser', updateUser);
router.delete('/deleteuser', deleteUser);
router.put('/updatepass', updatePass);



module.exports = router;
