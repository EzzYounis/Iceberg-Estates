const express = require('express');
const router = express.Router();
const postcodeService = require('../services/postcodeService');
const travelTimeService = require('../services/travelTimeService');

// POST /api/validate-postcode
router.post('/', async (req, res) => {
  const { postcode } = req.body;
  if (!postcode) {
    return res.status(400).json({ success: false, message: 'Postcode is required' });
  }
  try {
    // Validate postcode and get coordinates
    const coords = await postcodeService.getCoordinates(postcode);
    // Optionally, calculate travel info from office to property
    let travelInfo = {};
    try {
      travelInfo = await travelTimeService.calculateTravelInfo(postcode);
    } catch (e) {
      // If travel info fails, just return postcode info
      travelInfo = {};
    }
    res.json({
      success: true,
      data: {
        ...coords,
        ...travelInfo
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
