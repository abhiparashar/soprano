const path = require("path");
const Location = require("../model/location");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const geocoder = require("../utils/geocoder");

exports.getLocations = asyncHandler(async (req, res, next) => {
	let query;
	queryStr = JSON.stringify(req.query);
	queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);
	query = Location.find(JSON.parse(queryStr));
	const locations = await query;

	res.status(200).json({
		success: true,
		count: locations.length,
		data: locations,
	});
});

exports.getLocation = asyncHandler(async (req, res, next) => {
	const location = await Location.findById(req.params.id);
	if (!location) {
		next(new ErrorResponse(`Location not found with id ${req.params.id}`, 404));
		res.status(200).json({
			success: true,
			data: location,
		});
	}
});

exports.createLocation = asyncHandler(async (req, res, next) => {
	const location = await Location.create(req.body);
	res.status(201).json({
		success: true,
		data: location,
	});
});

exports.updateLocation = asyncHandler(async (req, res, next) => {
	const location = await Location.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	if (!location) {
		return next(new ErrorResponse(`Location not found with id ${req.params.id}`, 404));
	}

	res.status(200).json({
		success: true,
		data: location,
	});
});

exports.deleteLocation = asyncHandler(async (req, res, next) => {
	const location = await Location.findByIdAndDelete(req.params.id);
	if (!location) {
		return next(new ErrorResponse(`Location not found with id ${req.params.id}`, 400));
	}
	res.status(200).json({
		success: true,
	});
});

exports.getLocationByCoordinates = asyncHandler(async (req, res, next) => {
	const { zipcode, distance } = req.params;

	// Get lat/lng from geocoder
	const loc = await geocoder.geocode(zipcode);
	const lat = loc[0].latitude;
	const lng = loc[0].longitude;

	// Calc radius using radians
	// Divide dist by radius of Earth
	// Earth Radius = 3,963 mi / 6,378 km
	const radius = distance / 3963;

	const locations = await Location.find({
		location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
	});

	res.status(200).json({
		success: true,
		count: locations.length,
		data: locations,
	});
});

exports.locationPhotoUpload = asyncHandler(async (req, res, next) => {
	const location = await Location.findById(req.params.id);

	if (!location) {
		return next(
			new ErrorResponse(`location with this id ${req.params.id} does nor exist`),
			400,
		);
	}

	if (!req.files) {
		return next(new ErrorResponse("please upload file", 400));
	}

	const file = req.files.file;

	//Make sure the image is a photo
	if (!file.mimetype.startsWith("image")) {
		return next(new ErrorResponse("the file is not image", 400));
	}

	//check fileSize
	if (file.size > process.env.MAX_SIZE_UPLOAD) {
		return next(
			new ErrorResponse(
				`please upload file size less tha ${process.env.MAX_SIZE_UPLOAD}`,
				400,
			),
		);
	}

	//create custom file name
	file.name = `photo_${location._id}${path.parse(file.name).ext}`;
	console.log(file.name);

	file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
		if (err) {
			console.log(err);
			return next(new ErrorResponse(`problem with file uplaod`, 500));
		}
		const app = await Location.findByIdAndUpdate(req.params.id, { photo: file.name });

		res.status(200).json({
			status: true,
			data: file.name,
		});
	});
});
