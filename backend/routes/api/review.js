const router = require("express").Router();
const {
	Review,
	User,
	Spot,
	ReviewImage,
	SpotImage,
} = require("../../db/models");
const { requireAuth } = require("../../utils/auth");
// const { formatSpots } = require("../../utils/utils");
// chech production or dev
const { environment } = require("../../config");
const isProduction = environment === "production";

// Middleware helper for Review authorization
const testAuthorization = async (req, res, next) => {
	const { id: userId } = req.user;
	const { reviewId } = req.params;

	try {
		const myReview = await Review.findByPk(reviewId);

		if (!myReview) throw new Error("Review couldn't be found");

		const { userId: ownerId } = myReview;

		if (Number(userId) !== Number(ownerId)) throw new Error("Forbidden");
	} catch (err) {
		return next(err);
	}
	return next();
};

///
/// GET
///

// get all reviews for the current user requires authentication
router.get("/current", requireAuth, async (req, res, next) => {
	const { id: userId } = req.user;
	const where = { userId: userId };
	const include = [
		{
			model: User,
		},
		{
			model: Spot,
			// remove [description, updated, created]
			// add previewImage
			attributes: {
				exclude: ["description", "updatedAt", "createdAt"],
			},
			include: SpotImage,
		},
		{
			model: ReviewImage,
		},
	];

	try {
		const Reviews = await Review.findAll({ where, include });

		Reviews.forEach((ele) => {
			const { Spot } = ele;

			// formatSpots([Spot], true, false);
		});

		res.json({ Reviews });
	} catch (err) {
		return next(err);
	}
});

///
/// POST
///

// Add an image to a review with authentication and authorization
router.post(
	"/:reviewId/images",
	requireAuth,
	testAuthorization,
	async (req, res, next) => {
		const { url } = req.body;
		const { reviewId } = req.params;
		const where = { reviewId: reviewId };
		const payload = {
			reviewId: reviewId,
			url: url,
		};

		try {
			const limit = await ReviewImage.count({ where });

			if (limit >= 10) {
				throw new Error(
					"Maximum number of images for this resource was reached",
				);
			}

			const { id } = await ReviewImage.create(payload);

			return res.json({ id, url });
		} catch (err) {
			return next(err);
		}
	},
);

///
/// PUT
///

// edit a review with authentication and authorization
router.put(
	"/:reviewId",
	requireAuth,
	testAuthorization,
	async (req, res, next) => {
		const { review, stars } = req.body;
		const { reviewId } = req.params;
		const payload = {
			review: review,
			stars: stars,
		};
		const options = {
			where: { id: reviewId },
			/* ONLY supported for Postgres */
			// will return the results without needing another db query
			returning: true,
			plain: true,
		};

		try {
			const updatedReview = await Review.update(payload, options);

			// check if we are in production or if we have to make another DB query
			if (!isProduction) {
				updatedReview.sqlite = await Review.findByPk(reviewId);
			}

			return res.json(updatedReview.sqlite || updatedReview[1].dataValues);
		} catch (err) {
			return next(err);
		}
	},
);

///
/// DELETE
///

// delete a review with authentication and authorization
router.delete(
	"/:reviewId",
	requireAuth,
	testAuthorization,
	async (req, res, next) => {
		const { reviewId } = req.params;
		const where = { id: reviewId };

		try {
			await Review.destroy({ where });

			return res.json({ message: "Successfully deleted" });
		} catch (err) {
			return next(err);
		}
	},
);

///
/// ERROR HANDLING
///

// router.use((err, req, res, next) => {
// 	if (err.message === "Review couldn't be found") {
// 		return res.status(404).json({ message: err.message });
// 	}
// 	return next(err);
// });

module.exports = router;
