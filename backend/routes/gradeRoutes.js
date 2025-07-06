const express = require('express');
const router = express.Router();
const {giveGrade, deleteGrade, updateGrade} = require('../controllers/gradeController');

router.post('/givegrade', giveGrade);
router.delete('/deletegrade', deleteGrade);
router.put('/updateGrade', updateGrade);

module.exports = router;