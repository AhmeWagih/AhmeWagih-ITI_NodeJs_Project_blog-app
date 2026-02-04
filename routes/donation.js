const express = require('express');
const schemas = require('../schemas/donation');
const donationsController = require('../controllers/donation');
const validate = require('../middleware/validation');

const router = express.Router();


router.post("/", validate(schemas.donationSchema), donationsController.createDonation);

router.post("/webhook", donationsController.webhook)


module.exports = router;
