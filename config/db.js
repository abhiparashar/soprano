const mongoose = require("mongoose");

const connectDB = async () => {
	const conn = await mongoose.connect("mongodb://localhost/test", {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
		useUnifiedTopology: true,
	});
	console.log(`MongoDB connected:${conn.connection.host}`.cyan.underline.bold);
};

module.exports = connectDB;
