function formatSpots(spotsArray, oneImage = false, rateSpot = true) {
	// loop through array
	spotsArray.forEach((ele, i) => {
		const { Reviews, SpotImages } = ele.dataValues;
		const mySpot = spotsArray[i].dataValues;

		// need avgStarRating?
		if (rateSpot) _avgStarRating(Reviews, mySpot);

		// Only need one Image? aka previewImage
		if (oneImage) _previewImage(SpotImages, mySpot);
	});
}

function _avgStarRating(Reviews, mySpot) {
	if (Reviews) {
		var sum = Reviews.reduce((acc, ele) => {
			const { stars } = ele.dataValues;
			return acc + stars;
		}, 0);
	}
	mySpot.avgStarRating = sum / Reviews.length || 0;
	delete mySpot.Reviews;
}

function _previewImage(SpotImages, mySpot) {
	if (SpotImages[0]) {
		const [firstImage] = SpotImages;
		var { url } = firstImage.dataValues;
	}
	mySpot.previewImage = url || "no images";
	delete mySpot.SpotImages;
}

///
/// Booking Utils
///

function checkConflicts(spotArray, datesObj) {
	const { startDate, endDate, bookingId, isEdit  } = datesObj;

	const errors = {};
	spotArray.forEach((ele) => {
		const { startDate: oldStart, endDate: oldEnd, bookingId: oldBookingId } = ele;

        if (isEdit && oldBookingId === bookingId) {
            return;
        }

		if (
			new Date(oldStart) >= new Date(startDate) &&
			new Date(oldStart) <= new Date(endDate)
		) {
			errors.endDate = "End date conflicts with an existing booking";
		}

		if (
			new Date(startDate) >= new Date(oldStart) &&
			new Date(startDate) <= new Date(oldEnd)
		) {
			errors.startDate = "Start date conflicts with an existing booking";
		}
	});

	if (errors.startDate || errors.endDate) {
		const err = new Error(
			"Sorry, this spot is already booked for the specified dates",
		);
		err.errors = errors;
		err.status = 403;
		throw err;
	}
}

module.exports = { formatSpots, checkConflicts };
