const express = require('express');
const router = express.Router();

const { createCourse, updateCourse, deleteCourse } = require('../controllers/courseController')


router.post('/createcourse', createCourse);
router.put('/upatecourse', updateCourse);
router.delete('/deletecourse', deleteCourse);

module.exports = router;
 