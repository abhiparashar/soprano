const express = require("express");

const {
	getLocations,
	getLocation,
	createLocation,
	updateLocation,
	deleteLocation,
	locationPhotoUpload,
	getLocationByCoordinates,
} = require("../controller/locations");

const router = express.Router();

router.route("/radius/:zipcode/:distance").get(getLocationByCoordinates);

router.route("/:id/photo").put(locationPhotoUpload);

router.route("/").get(getLocations).post(createLocation);
router.route("/:id").get(getLocation).put(updateLocation).delete(deleteLocation);

module.exports = router;
