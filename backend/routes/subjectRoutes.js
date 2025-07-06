const express = require('express');
const router = express.Router();
const {createSubject, deleteSubject} = require('../controllers/subjectController');

router.post('/createsubject', createSubject);
router.delete('/deletesubject', deleteSubject);

module.exports = router;