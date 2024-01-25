const express = require('express');
const router = express.Router();

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Spot, user } = require('../../db/models');


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
router.get('/spots/current', async (req, res)=>{
    const {ownerId} = req.params;

    const UserSpots = await ownerId.findAll({
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
    })
    res.json(UserSpots)
})
router.get('/spots/:spotId', async (req, res)=>{
    const {Id} = req.params

    const spot = await Spot.findByPk(Id, {
        

    })
})



module.exports = router;
