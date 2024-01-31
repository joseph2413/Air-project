const router = require("express").Router();
const { Spot, Booking, SpotImage } = require("../../db/models");
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

		if (!myBooking) throw new Error("Booking couldn't be found");

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

		if (Number(userId) !== Number(ownerId)) throw new Error("Forbidden");
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

router.put(
	"/:bookingsId",
	requireAuth,
	testAuthorization,
	async (req, res, next) => {
		const { startDate, endDate } = req.body;
		const { bookingsId } = req.params;
		const include = {
			model: Spot,
			include: Booking,
		};
		const payload = {
			startDate: startDate,
			endDate: endDate,
		};
		const options = {
			where: { id: bookingsId },
			returning: true,
			plain: true,
		};

		try {
			const myBooking = await Booking.findByPk(bookingsId, { include });
			console.log(myBooking)
			const { Bookings } = myBooking.Spot;

			if(myBooking.id == bookingsId){
				const updatedBooking = await Booking.update(payload, options);

				if (!isProduction) {
					updatedBooking.sqlite = await Booking.findByPk(bookingsId);
				}

				return res.json(updatedBooking.sqlite || updatedBooking[1].dataValues);
			}else{
				const dates = { startDate, endDate };
				checkConflicts(Bookings, dates);
			}
		} catch (err) {
			return next(err);
		}
	},
);

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
