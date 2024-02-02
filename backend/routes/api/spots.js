const router = require("express").Router();
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const { Op } = require("sequelize");
const {
	Spot,
	Review,
	SpotImage,
	User,
	Booking,
	ReviewImage,
	Sequelize,
} = require("../../db/models");
const { requireAuth } = require("../../utils/auth");
const { formatSpots, checkConflicts } = require("../../utils/helper");
const { environment } = require("../../config");
const isProduction = environment === "production";

const testAuthorization = async (req, res, next) => {
	const { id: userId } = req.user;
	const { id: spotId } = req.params;

	try {
		const mySpot = await Spot.findByPk(spotId);

		if (!mySpot){
			res.status(404).json({"message": "Spot couldn't be found"})
		}

		const { ownerId } = mySpot;

		if (Number(userId) !== Number(ownerId)) throw new Error("Forbidden");
	} catch (err) {
		return next(err);
	}
	return next();
};

///
/// GET
///

const validateQueryFilters = [
	check("page")
		.default(1)
		.isInt({ min: 1, max: 10 })
		.withMessage("Page must be greater than or equal to 1"),
	check("size")
		.default(20)
		.isInt({ min: 1, max: 20 })
		.withMessage("Size must be greater than or equal to 1"),
	check("minLat")
		.optional()
		.isFloat()
		.withMessage("Maximum latitude is invalid"),
	check("maxLat")
		.optional()
		.isFloat()
		.withMessage("Minimum latitude is invalid"),
	check("minLng")
		.optional()
		.isFloat()
		.withMessage("Minimum longitude is invalid"),
	check("maxLng")
		.optional()
		.isFloat()
		.withMessage("Maximum longitude is invalid"),
	check("minPrice")
		.optional()
		.isFloat({ min: 0 })
		.withMessage("Minimum price must be greater than or equal to 0"),
	check("maxPrice")
		.optional()
		.isFloat({ min: 0 })
		.withMessage("Maximum price must be greater than or equal to 0"),
	handleValidationErrors,
];

// Get all spots
router.get('/', async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1;
        let size = parseInt(req.query.size) || 20;
        const minLat = parseFloat(req.query.minLat);
        const maxLat = parseFloat(req.query.maxLat);
        const minLng = parseFloat(req.query.minLng);
        const maxLng = parseFloat(req.query.maxLng);
        const minPrice = parseFloat(req.query.minPrice);
        const maxPrice = parseFloat(req.query.maxPrice);

        let errors = {};
        if (page < 1) errors.page = "Page must be greater than or equal to 1";
        if (size < 1 || size > 20) errors.size = "Size must be greater than or equal to 1";
        if (minLat !== undefined && (isNaN(minLat) || minLat < -90 || minLat > 90)) errors.minLat = "Minimum latitude is invalid";
        if (maxLat !== undefined && (isNaN(maxLat) || maxLat < -90 || maxLat > 90)) errors.maxLat = "Maximum latitude is invalid";
        if (minLng !== undefined && (isNaN(minLng) || minLng < -180 || minLng > 180)) errors.minLng = "Minimum longitude is invalid";
        if (maxLng !== undefined && (isNaN(maxLng) || maxLng < -180 || maxLng > 180)) errors.maxLng = "Maximum longitude is invalid";
        if ((minPrice !== undefined && isNaN(minPrice)) || minPrice < 0) errors.minPrice = "Minimum price must be greater than or equal to 0";
        if ((maxPrice !== undefined && isNaN(maxPrice)) || maxPrice < 0) errors.maxPrice = "Maximum price must be greater than or equal to 0";

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ message: "Bad Request", errors });
        }

        let where = {};
        if (minLat !== undefined) where.lat = { [Sequelize.Op.gte]: minLat };
        if (maxLat !== undefined) where.lat = { ...where.lat, [Sequelize.Op.lte]: maxLat };
        if (minLng !== undefined) where.lng = { [Sequelize.Op.gte]: minLng };
        if (maxLng !== undefined) where.lng = { ...where.lng, [Sequelize.Op.lte]: maxLng };
        if (minPrice !== undefined) where.price = { [Sequelize.Op.gte]: minPrice };
        if (maxPrice !== undefined) where.price = { ...where.price, [Sequelize.Op.lte]: maxPrice };

        let offset = (page - 1) * size;
        let limit = size;

        const spots = await Spot.findAll({
            include: [
                {
                    model: SpotImage,
                    attributes: ['url'],
                    where: { preview: true },
                    limit: 1
                },
                {
                    model: Review,
                    attributes: [],
                }
            ],
            attributes: {
                include: [
                    [Sequelize.fn('AVG', Sequelize.col('Reviews.stars')), 'avgRating']
                ]
            },
            group: ['Spot.id'],
            limit,
            offset,
            subQuery: false,
            order: [['id']]
        });



        const spotsResponse = spots.map(spot => {
            const spotJSON = spot.toJSON();
            spotJSON.avgRating = parseFloat(spotJSON.avgRating).toFixed(1);
            if (spotJSON.SpotImages && spotJSON.SpotImages.length) {
                spotJSON.previewImage = spotJSON.SpotImages[0].url;
            }
            delete spotJSON.SpotImages;
            return spotJSON;
        });

        res.status(200).json({
            Spots: spotsResponse,
            page: page,
            size: size
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

function _paginationBuilder(page, size) {
	page = Number(page);
	size = Number(size);

	const pagination = {};
	if (page > 0 && size > 0) {
		pagination.limit = size;
		pagination.offset = size * (page - 1);
	}

	return pagination;
}

// Get spots by user with authorization
router.get("/current", requireAuth, async (req, res, next) => {
	const { id: userId } = req.user;
	const where = { ownerId: userId };
	const include = [
		{
			model: Review,
		},
		{
			model: SpotImage,
		},
	];

	try {
		const mySpots = await Spot.findAll({ where, include });

		formatSpots(mySpots, true);

		return res.json({ Spots: mySpots });
	} catch (err) {
		return next(err);
	}
});

// Get details of spot by id
router.get("/:id", async (req, res, next) => {
	const { id: spotId } = req.params;
	const include = [
		{
			model: Review,
		},
		{
			model: SpotImage,
		},
		{
			model: User,
			as: "Owner",
		},
	];

	try {
		const spotDetails = await Spot.findByPk(spotId, { include });
		if (!spotDetails) {
			return res.status(404).json({ "message": "Spot couldn't be found"})
		}

		spotDetails.dataValues.numReviews = spotDetails.dataValues.Reviews.length;

		formatSpots([spotDetails]);

		return res.json(spotDetails);
	} catch (err) {
		return next(err);
	}
});

// get all reviews from spot id
router.get("/:id/reviews", async (req, res, next) => {
	const { id: spotId } = req.params;
	const where = { spotId: spotId };
	const include = [
		{
			model: User,
		},
		{
			model: ReviewImage,
		},
	];

	try {
		const mySpot = await Spot.findByPk(spotId);

		if (!mySpot){
			return res.status(404).json({"message": "Spot couldn't be found"})
		}

		const Reviews = await Review.findAll({ where, include });

		return res.json({ Reviews });
	} catch (err) {
		return next(err);
	}
});

// get all bookings based on spot ID require authentication
router.get("/:id/bookings", requireAuth, async (req, res, next) => {
	const { id: userId } = req.user;
	const { id: spotId } = req.params;
	const include = {
		model: Booking,
		include: {
			model: User,
		},
	};

	try {
		const mySpot = await Spot.findByPk(spotId, { include });

		if (!mySpot) res.status(404).json({"message": "Spot couldn't be found"})

		const { ownerId, Bookings } = mySpot;

		if (ownerId !== userId) {
			Bookings.forEach((ele, i) => {
				const { startDate, endDate } = ele;
				Bookings[i] = { spotId, startDate, endDate };
			});
		}

		return res.json({ Bookings });
	} catch (err) {
		return next(err);
	}
});



// Create a spot with authentication
router.post("/", requireAuth, async (req, res, next) => {
	const { id: userId } = req.user;

	const { address, city, state, country, lat, lng, name, description, price } =
		req.body;

	const query = {
		ownerId: userId,
		address: address,
		city: city,
		state: state,
		country: country,
		lat: lat,
		lng: lng,
		name: name,
		description: description,
		price: price,
	};

	try {
		const { dataValues } = await Spot.create(query);
		return res.status(201).json({
			id: userId,
			...dataValues,
		});
	} catch (err) {
		return res.status(400).json(err);
	}
});

router.post(
	"/:id/images",
	requireAuth,
	testAuthorization,
	async (req, res, next) => {
		const { id: spotId } = req.params;
		const { url, preview } = req.body;
		const query = {
			spotId: spotId,
			url: url,
			preview: preview,
		};

		try {
			const { id } = await SpotImage.create(query);
			return res.json({ id, url, preview });
		} catch (err) {
			return next(err);
		}
	},
);

router.post("/:id/reviews", requireAuth, async (req, res, next) => {
	const { id: userId } = req.user;
	const { id: spotId } = req.params;
	const { review, stars } = req.body;
	const where = {
		userId: userId,
		spotId: +spotId,
	};
	const defaults = {
		review: review,
		stars: stars,
	};

	try {
		const [newReview, created] = await Review.findOrCreate({
			where,
			defaults,
		});

		if (!created) throw new Error("User already has a review for this spot");

		return res.status(201).json(newReview);
	} catch (err) {
		if (err.message.toLowerCase().includes("foreign key constraint")) {
			res.status(404).json({"message": "Spot couldn't be found"});
		}
		return res.status(400), next(err);
	}
});

router.post("/:id/bookings", requireAuth, async (req, res, next) => {
	const { startDate, endDate } = req.body;
	const { id: spotId } = req.params;
	const { id: userId } = req.user;
	const where = { spotId: spotId };

	try {
		const mySpot = await Spot.findByPk(spotId);
		if (!mySpot){
			res.status(404).json({"message": "Spot couldn't be found"})
		}
		const { ownerId } = mySpot;
		if (Number(userId) === Number(ownerId)) throw new Error("Forbidden");

		const spotBookings = await Booking.findAll({ where });

		const dates = { startDate, endDate };
		checkConflicts(spotBookings, dates);

		if (new Date(startDate) <= new Date()) {
			throw new Error("Past bookings can't be modified");
		}


		const newBooking = await Booking.create({
			spotId: spotId,
			userId: userId,
			startDate: startDate,
			endDate: endDate,
		});

		return res.json(newBooking);
	} catch (err) {
		if (err.message.toLowerCase().includes("foreign key constraint")) {
			throw new Error("Spot couldn't be found");
		}
		return next(err);
	}
});

router.put("/:id", requireAuth, testAuthorization, async (req, res, next) => {
	const { id: spotId } = req.params;
	const { address, city, state, country, lat, lng, name, description, price } =
		req.body;
	const query = {
		address: address,
		city: city,
		state: state,
		country: country,
		lat: lat,
		lng: lng,
		name: name,
		description: description,
		price: price,
	};
	const options = {
		where: { id: spotId },
		returning: true,
		plain: true,
	};

	try {
		const updatedSpot = await Spot.update(query, options);

		if (!isProduction) {
			updatedSpot.sqlite = await Spot.findByPk(spotId);
		}
		return res.json(updatedSpot.sqlite || updatedSpot[1].dataValues);
	} catch (err) {
		return res.status(400).json(err);
	}
});


router.delete(
	"/:id",
	requireAuth,
	testAuthorization,
	async (req, res, next) => {
		const { id: spotId } = req.params;
		const where = { id: spotId };

		try {
			await Spot.destroy({ where });

			return res.json({ message: "Successfully deleted" });
		} catch (err) {
			return next(err);
		}
	},
);

module.exports = router;
