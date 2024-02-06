const router = require("express").Router();
const { Spot, SpotImage, Review, ReviewImage, User, Booking, Sequelize } = require('../../db/models');;
const { requireAuth } = require("../../utils/auth");
const { formatSpots, checkConflicts } = require("../../utils/helper");
const { environment } = require("../../config");
const isProduction = environment === "production";

// Middleware helper for Booking authorization
const testAuthorization = async (req, res, next) => {
	const { id: userId } = req.user;
	const { bookingsId } = req.params;
	const include = { model: Spot };

	try {
		const myBooking = await Booking.findByPk(bookingsId, { include });

		if (!myBooking) res.status(404).json({"message": "Booking couldn't be found"});

		const { userId: ownerId } = myBooking;

		console.log(ownerId, userId)

		if (req.method === "DELETE") {
			const { startDate } = myBooking;
			const { ownerId: spotOwner } = myBooking.Spot;

			if (new Date(startDate) < new Date()) {
				throw new Error("Bookings that have been started can't be deleted");
			}

			// no need to check if we own the booking
			if (Number(userId) === Number(spotOwner)) return next();
		}

		if (Number(userId) !== Number(ownerId)) return res.status(403).json({ message: "Forbidden" });
	} catch (err) {
		return next(err);
	}
	return next();
};

///
/// GET
///

// get all bookings for the current user requires authentication
router.get("/current", requireAuth, async (req, res, next) => {
	const { id: userId } = req.user;
	const where = { userId: userId };
	const include = {
		model: Spot,
		attributes: {
			exclude: ["description", "updatedAt", "createdAt"],
		},
		include: SpotImage,
	};

	try {
		const Bookings = await Booking.findAll({ where, include });

		Bookings.forEach((ele) => {
			const { Spot } = ele;

			formatSpots([Spot], true, false);
		});

		return res.json({ Bookings });
	} catch (err) {
		return next(err);
	}
});

///
/// PUT
///

router.put("/:bookingsId", requireAuth, testAuthorization, async (req, res, next) => {
    const { startDate, endDate } = req.body;
    const { bookingsId } = req.params;
    const userId = req.user.id;
    // const options = {
    //     where: { id: bookingsId },
    //     returning: true,
    //     plain: true,
    // };

    try {
        const myBooking = await Booking.findByPk(bookingsId);
		if(!myBooking){
			return res.status(404).json({message: "Booking couldn't be found"});
		};
		if (new Date(myBooking.endDate) < new Date()) {
            return res.status(403).json({ message: "Past bookings can't be modified" });
        };
		if (new Date(startDate) >= new Date(endDate)) {
            return res.status(403).json({ errors: { endDate: "endDate cannot come before or on the startDate", startDate: "startDate cannot be on the endDate"} });
        };

		const otherBookings = await Booking.findAll({
			where:{
				spotId: myBooking.spotId,
				id:{[Sequelize.Op.ne]: bookingsId}
			}
		})
		for(const other of otherBookings){
			if (new Date(startDate) <= new Date(other.endDate) && new Date(endDate) >= new Date(other.startDate)) {
				return res.status(403).json({
					message: "Sorry, this spot is already booked for the specified dates",
					errors: {
						startDate: "Start date conflicts with an existing booking",
						endDate: "End date conflicts with an existing booking"
					}
				});
			}
		}

		myBooking.startDate = startDate;
		myBooking.endDate = endDate;
		await myBooking.save()

		res.status(200).json(myBooking)

    } catch (err) {
        return next(err);
    }
});


///
/// DELETE
///

router.delete(
	"/:bookingsId",
	requireAuth,
	testAuthorization,
	async (req, res, next) => {
		const { bookingsId } = req.params;
		const where = { id: bookingsId };

		try {
			await Booking.destroy({ where });

			return res.json({ message: "Successfully deleted" });
		} catch (err) {
			return next(err);
		}
	},
);

module.exports = router;
