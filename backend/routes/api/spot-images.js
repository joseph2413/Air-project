const router = require("express").Router();
const { Spot, SpotImage } = require("../../db/models");
const { requireAuth } = require("../../utils/auth");

// Middleware helper for SpotImage authorization
const testAuthorization = async (req, res, next) => {
	const { id: userId } = req.user;
	const { id: spotImageId } = req.params;
	const include = { include: Spot };

	try {
		const mySpotImage = await SpotImage.findByPk(spotImageId, include);

		if (!mySpotImage){
			res.status(404).json({"message": "Spot Image couldn't be found"})
		}
		const { ownerId } = mySpotImage.Spot;

		if (Number(userId) !== Number(ownerId)){
			res.status(401).json({"message": "Forbidden"});
		}
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
		const { id: spotImageId } = req.params;
		const where = { id: spotImageId };

		try {
			await SpotImage.destroy({ where });

			return res.json({ message: "Successfully deleted" });
		} catch (err) {
			return next(err);
		}
	},
);

module.exports = router;
