const router = require("express").Router();
const { Review, ReviewImage } = require("../../db/models");
const { requireAuth } = require("../../utils/auth");

// Middleware helper for ReviewImage authorization
const testAuthorization = async (req, res, next) => {
	const { id: userId } = req.user;
	const { id: reviewImageId } = req.params;
	const include = { include: Review };

	try {
		const mySpotImage = await ReviewImage.findByPk(reviewImageId, include);

		if (!mySpotImage) throw new Error("Review Image couldn't be found");

		const { userId: ownerId } = mySpotImage.Review;

		if (Number(userId) !== Number(ownerId)) throw new Error("Forbidden");
	} catch (err) {
		return next(err);
	}
	return next();
};

// Delete a spot image require authentication and authorization
router.delete(
	"/:id",
	requireAuth,
	testAuthorization,
	async (req, res, next) => {
		const { id: reviewImageId } = req.params;
		const where = { id: reviewImageId };

		try {
			await ReviewImage.destroy({ where });

			return res.json({ message: "Successfully deleted" });
		} catch (err) {
			return next(err);
		}
	},
);

module.exports = router;
