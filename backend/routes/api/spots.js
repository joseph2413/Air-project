const express = require('express');
const router = express.Router();

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Spot, SpotImage, user } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

router.get('/', async (req, res, next) => {
    try {
        const spots = await Spot.findAll({
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
        res.json(spots);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/spots/current', requireAuth, async (req, res) => {
    try {
        const id = req.user.id;

        const userSpots = await Spot.findAll({
            where: {
                ownerId: id,
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
            ],
            include:{
                model: SpotImage,
                attributes:[
                    'id',
                    'url',
                    'preview',
                ]
            }
        });

        res.json(userSpots);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/spots/:spotId', async (req, res) => {
    try {
        const { spotId } = req.params;

        const spot = await Spot.findByPk(spotId, {
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

        if (!spot) {
            res.status(404).json({ message: "Spot couldn't be found" });
            return;
        }

        res.json(spot);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const validSpot = [
    check('address')
      .exists({ checkFalsy: true })
      .withMessage('Please provide a valid address.'),
    check('city')
      .exists({ checkFalsy: true })
      .withMessage('Please provide a city.'),
    check('state')
        .exists({ checkFalsy: true })
        .withMessage('Please provide a state.'),
    check('country')
      .exists({ checkFalsy: true })
      .withMessage('Please provide a country.'),
    check('lat')
      .exists({ checkFalsy: true })
      .withMessage('Please provide a latitude coordinate.'),
    check('lng')
      .exists({ checkFalsy: true })
      .withMessage('Please provide a longitude coordinate.'),
    check('name')
      .exists({ checkFalsy: true })
      .withMessage('Please provide a name.'),
    check('description')
        .exists({ checkFalsy: true })
        .withMessage('Please provide a description.'),
    check('price')
        .exists({ checkFalsy: true })
        .withMessage('Please provide a price.'),
    handleValidationErrors
  ];

router.post("/", requireAuth, validSpot, async (req, res) =>{
    const {address, city, state, country, lat, lng, name, description, price} = req.body;
    const newSpot = await Spot.create({
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price
    })
    return res.json(newSpot)
})

module.exports = router;
