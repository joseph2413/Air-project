const express = require('express');
const router = express.Router();

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Spot, user, SpotImage, User} = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

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
router.get('/spots/:spotId', async (req, res)=>{
    const {Id} = req.params

    const spot = await Spot.findByPk(Id, {


    })
})



module.exports = router;
