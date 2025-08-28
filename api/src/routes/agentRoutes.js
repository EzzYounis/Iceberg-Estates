const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/agents - List all agents (id, firstName, lastName)
router.get('/', async (req, res) => {
	try {
		const agents = await User.findAll({
			attributes: ['id', 'firstName', 'lastName'],
			where: { isActive: true }
		});
		res.json({ success: true, data: { agents } });
	} catch (err) {
		res.status(500).json({ success: false, message: 'Failed to fetch agents' });
	}
});

module.exports = router;
