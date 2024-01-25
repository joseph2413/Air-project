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
router.get('/spots/current', async (req, res) => {
    try {
        const userId = req.user.id;

        const userSpots = await Spot.findAll({
            where: {
                ownerId: userId,
            },
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

        res.json(userSpots);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/spots/:spotId', async (req, res)=>{
    const {Id} = req.params

    const spot = await Spot.findByPk(Id, {


    })
})


module.exports = router;
