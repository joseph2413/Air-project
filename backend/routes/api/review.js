const router = require("express").Router();
const { Review, User, Spot, ReviewImage } = require("../../db/models");
const { requireAuth } = require("../../utils/auth");
// chech production or dev
const { environment } = require("../../config");
const isProduction = environment === "production";

// Middleware helper for Review authorization
const authorization = async (req, res, next) => {
	const { id: userId } = req.user;
	const { id: spotImageId } = req.params;
    const include = { include: Spot };

	try {
		const mySpotImage = await Review.findByPk(spotImageId, include);

		if (!mySpotImage) throw new Error("Review couldn't be found");

		const { userId: ownerId } = mySpotImage.Spot;

		if (Number(userId) !== Number(ownerId)) throw new Error("Forbidden");
	} catch (err) {
		return next(err);
	}
	return next();
};

router.get("/current", requireAuth, async (req, res, next) => {
	const { id: userId } = req.user;
	const where = { userId: userId };

	try {
		const myReviews = await Review.findAll({ where });

		res.json({ myReviews });
	} catch (err) {
		return next(err);
	}
});


router.post(
	"/:reviewId/images",
	requireAuth,
	authorization,
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

			const newReviewImage = await Review.create(payload);

			return res.json({ newReviewImage });
		} catch (err) {
			return next(err);
		}
	},
);


router.put(
	"/:reviewId",
	requireAuth,
	authorization,
	async (req, res, next) => {
		const { review, stars } = req.body;
		const { reviewId } = req.params;
		const payload = {
			reviweMsg: review,
			stars: stars,
		};
		const options = {
			where: { reviewId: reviewId },
			/* ONLY supported for Postgres */
			// will return the results without needing another db query
			returning: true,
			plain: true,
		};

		try {
			const updatedReview = await Review.update(payload, options);

			if (!isProduction) {
				updatedReview.sqlite = await Review.findByPk(reviewId);
			}

			return res.json(updatedReview.sqlite || updatedReview[1].dataValues);
		} catch (err) {
			return next(err);
		}
	},
);

router.delete(
	"/:reviewId",
	requireAuth,
	authorization,
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

module.exports = router;
