const express = require('express');
const router = express.Router();

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Spot } = require('../../db/models');


router.get('/', async (req, res, next) => {
    let spots = []

    spots = await Spot.findAll({
        attributes: [
            "id",
            "ownerId",
            "address",
            "city",
            "state",
            "country",
            "lat",
            "lng",
            "name",
            "description",
            "price",
            "createdAt",
            "updatedAt",
        ]
    });
    res.json(spots)
})

module.exports = router;
