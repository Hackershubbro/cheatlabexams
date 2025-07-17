const express = require("express");
const multer = require("multer");
const DataController = require("../controllers/DataBaseController");

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Unified endpoint for create/update operations
router.post('/data', upload.array('images', 10), DataController.createOrUpdate);

// Delete operation (can delete entire record or specific image)
router.delete('/data', DataController.delete);

// Fetch operation
router.get('/data', DataController.fetch);

module.exports = router;