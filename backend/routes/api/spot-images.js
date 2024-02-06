const router = require("express").Router();
const { Spot, SpotImage } = require("../../db/models");
const { requireAuth } = require("../../utils/auth");

// Middleware helper for SpotImage authorization
// const testAuthorization = async (req, res, next) => {
// 	const { id: userId } = req.user;
// 	const { id: spotImageId } = req.params;
// 	const include = { include: Spot };

// 	try {
// 		const mySpotImage = await SpotImage.findByPk(spotImageId, include);
// 		console.log(mySpotImage)
// 		if (!mySpotImage){
// 			res.status(404).json({"message": "Spot Image couldn't be found"})
// 		}else{
// 			if (Number(userId) !== Number(mySpotImage.Spot.toJSON().ownerId)){
// 				res.status(401).json({"message": "Forbidden"});
// 			}
// 		}
// 	} catch (err) {
// 		return next(err);
// 	}
// 	return next();
// };

// Delete a spot image require authentication and authorization
router.delete("/:id", requireAuth, async (req, res, next) => {
  const { id: spotImageId } = req.params;
  const { id: userId } = req.user;
  const include = { include: Spot };
  try {
	const mySpotImage = await SpotImage.findByPk(spotImageId, include);
    if (!mySpotImage) {
      return res.status(404).json({ message: "Spot Image couldn't be found" });
    } else {
      if (Number(userId) !== Number(mySpotImage.Spot.toJSON().ownerId)) {
        return res.status(403).json({ message: "Forbidden" });
      }else{
		  await mySpotImage.destroy();
		  return res.json({ message: "Successfully deleted" });
		}
    }
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
