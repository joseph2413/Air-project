function formatSpots(spotsArray, oneImage = false, rateSpot = true) {

	spotsArray.forEach((ele, i) => {
		const { Reviews, SpotImages } = ele.dataValues;
		const mySpot = spotsArray[i].dataValues;


		if (rateSpot) _avgStarRating(Reviews, mySpot);

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


async function checkConflicts(myBooking, spotArray, datesObj) {
    const { startDate, endDate } = datesObj;
    const errors = {};

    const { startDate: myStart, endDate: myEnd } = myBooking;

    spotArray.forEach((ele) => {
      const { startDate: oldStart, endDate: oldEnd } = ele;

      if (
        ele.id !== myBooking.id
        // &&
        // ((new Date(oldStart) >= new Date(startDate) &&
        //   new Date(oldStart) <= new Date(endDate)) ||
        //   (new Date(startDate) >= new Date(oldStart) &&
        //     new Date(startDate) <= new Date(oldEnd)))
      ) {
        errors.startDate = "Start date conflicts with an existing booking";
        errors.endDate = "End date conflicts with an existing booking";
      }

      if (
        myBooking.id !== ele.id &&
        ((new Date(myStart) >= new Date(oldStart) &&
          new Date(myStart) <= new Date(oldEnd)) ||
          (new Date(myEnd) >= new Date(oldStart) &&
            new Date(myEnd) <= new Date(oldEnd)))
      ) {
        errors.startDate = "Start date conflicts with an existing booking";
        errors.endDate = "End date conflicts with an existing booking";
      }
    });

    if (errors.startDate || errors.endDate) {
      const err = new Error(
        "Sorry, this spot is already booked for the specified dates"
      );
      err.errors = errors;
      err.status = 403;
      throw err;
    }
  }

module.exports = { formatSpots, checkConflicts };
