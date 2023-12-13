/* eslint-disable no-undef */
const express = require("express");
const Datastore = require("nedb");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5500;

app.listen(PORT, () => {
	console.log("Listening to port:", PORT);
});

app.use(express.static("public"));
app.use(express.json());

const databaseOrder = new Datastore("databaseOrder.db");
databaseOrder.loadDatabase();

const databaseUser = new Datastore("databaseUser.db");
databaseUser.loadDatabase();

// Fungsi untuk mencek status orderan dan update koordinat user dan montir
function checkOrderStatus(keyType, keyValue, res) {
	let query = {
		orderStatus: "active",
	};
	query[keyType] = keyValue;
	databaseOrder.find(query, (err, docs) => {
		if(docs.length == 0) {
			res.json({orderExist: 0});
		} else {
			res.json({
				orderStatus: docs.orderStatus,
				orderExist: docs.length > 0 ? 1 : 0,
				montirStatus: docs[0].montirStatus,
				montirLat: docs[0].montirLat,
				montirLon: docs[0].montirLon,
				userLat: docs[0].userLat,
				userLon: docs[0].userLon
			});
		}
	});
}

// Fungsi mengambil key user/montir untuk menyelesaikan orderan
function overwriteOrder(keyType, keyValue, status, price, res) {
	let query = {
		orderStatus: "active"
	};
	query[keyType] = keyValue;
	let overwrite = {
		orderStatus: status,
		orderPrice: price
	};
	databaseOrder.update(query, {$set: overwrite}, {}, () => {
		databaseOrder.loadDatabase();
	});
	res.end();
}

function orderHistory(keyType, keyValue, res) {
	let query = {
		orderStatus: { $in: ["finished", "cancelled"] },
	};
	query[keyType] = keyValue;
	databaseOrder.find(query, {userKey: 0, montirKey: 0}, (err, docs) => {
		if(docs.length == 0) {
			res.json({orderHistory: false});
		} else {
			res.json(docs);
		}
	});
}

// Route untuk cek apakah user memiliki order aktif
app.post("/check-order-user", (req, res) => {
	const dataKey = req.body.userKey;
	checkOrderStatus("userKey", dataKey, res);
});

// Route untuk cek apakah montir memiliki order aktif
app.post("/check-order-montir", (req, res) => {
	const montirKey = req.body.montirKey;
	checkOrderStatus("montirKey", montirKey, res);
});

// Route untuk user men-submit orderan, hasil submit data dimasukkan ke database
app.post("/submit-order", (req, res) => {
	const data = req.body;
	databaseOrder.insert(data);
	res.json({submitData: "success"});
});

// Route untuk montir mengambil data orderan yang aktif dan belum ada montir yang mengambil order
app.get("/get-order", (req, res) => {
	databaseOrder.find({ orderStatus: "active", montirStatus: "fetching-montir" }, { userKey: 0 })
		.sort({ postedAt: 1 }) // Sort from oldest
		.limit(1) // Limit to 1
		.exec((err, docs) => { // Idk i found it on stackoverflow https://stackoverflow.com/questions/56113318/how-to-sort-find-query-by-date
			res.json(docs);
		});
});

// Route yang digunakan ketika montir mengambil orderan dari data
app.post("/take-order", (req, res) => {
	const data = req.body;
	// https://stackoverflow.com/questions/33590114/update-a-row-in-nedb (Remove new line of data after replace)
	databaseOrder.update({_id: data.id}, {$set: {montirLat: data.montirLat, montirLon: data.montirLon, montirStatus: data.montirStatus, montirKey: data.montirKey}}, {}, () => {
		databaseOrder.loadDatabase();
	});
	res.json({takeOrder: "berhasil"});
});

// Route untuk upload lokasi montir
app.post("/update-location-montir", (req, res) => {
	const data = req.body;
	// https://stackoverflow.com/questions/33590114/update-a-row-in-nedb (Remove new line of data after replace)
	databaseOrder.update({orderStatus: "active", montirKey: data.montirKey}, {$set: {montirLat: data.montirLat, montirLon: data.montirLon}}, {}, () => {
		databaseOrder.loadDatabase();
	});
	res.end();
});

// Route untuk upload lokasi user
app.post("/update-location-user", (req, res) => {
	const data = req.body;
	// https://stackoverflow.com/questions/33590114/update-a-row-in-nedb (Remove new line of data after replace)
	databaseOrder.update({orderStatus: "active", userKey: data.userKey}, {$set: {userLat: data.userLat, userLon: data.userLon}}, {}, () => {
		databaseOrder.loadDatabase();
	});
	res.end();
});

// Route yang digunakan ketika user menyelesaikan orderan
app.post("/finish-order-user", (req, res) => {
	const dataKey = req.body.userKey;
	overwriteOrder("userKey", dataKey, "finished", 0, res);
});

// Route yang digunakan ketika user menyelesaikan orderan
app.post("/cancel-order-user", (req, res) => {
	const dataKey = req.body.userKey;
	overwriteOrder("userKey", dataKey, "cancelled", 0, res);
});

// Route yang digunakan ketika user menyelesaikan orderan
app.post("/finish-order-montir", (req, res) => {
	const dataKey = req.body.montirKey;
	const orderPrice = req.body.orderPrice;
	overwriteOrder("montirKey", dataKey, "finished", orderPrice, res);
});

// Route yang digunakan ketika user menyelesaikan orderan
app.post("/cancel-order-montir", (req, res) => {
	const dataKey = req.body.montirKey;
	overwriteOrder("montirKey", dataKey, "finished", 0, res);
});

app.post("/montir-arrived", (req, res) => {
	const data = req.body;
	// https://stackoverflow.com/questions/33590114/update-a-row-in-nedb (Remove new line of data after replace)
	databaseOrder.update({orderStatus: "active", montirKey: data.montirKey}, {$set: {montirStatus: "montir-arrived"}}, {}, () => {
		databaseOrder.loadDatabase();
	});
	res.end();
});

app.post("/sign-up", (req, res) => {
	let data = req.body;
	databaseUser.find({userName: data.userName}, (err, docs) => {
		if(docs.length == 0) {
			databaseUser.insert(data);
			res.json({signUpSuccess: true});
		} else {
			res.json({signUpSuccess: false});
		}
	});
});

app.post("/log-in", (req, res) => {
	let data = req.body;
	databaseUser.find({userName: data.userName, userPassword: data.userPassword, userType: data.userType}, (err, docs) => {
		if(docs.length == 0) {
			res.json({
				status: "failed"
			});
		} else {
			res.json({
				userType: docs[0].userType,
				_id: docs[0]._id,
				status: "success"
			});
		}
	});
});

app.post("/order-history-user", (req, res) => {
	let data = req.body.userKey;
	orderHistory("userKey", data, res);
});

app.post("/order-history-montir", (req, res) => {
	let data = req.body.montirKey;
	orderHistory("montirKey", data, res);
});