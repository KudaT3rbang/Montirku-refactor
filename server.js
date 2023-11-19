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
function overwriteOrder(keyType, keyValue, status, res) {
	let query = {
		orderStatus: "active",
	};
	query[keyType] = keyValue;
	let overwrite = {
		orderStatus: status
	};
	databaseOrder.update(query, {$set: overwrite}, {}, () => {
		databaseOrder.loadDatabase();
	});
	res.end();
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
	databaseOrder.find({orderStatus: "active", montirStatus: "fetching-montir"}, {userKey: 0}, (err, docs) => {
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
	overwriteOrder("userKey", dataKey, "finished", res);
});

// Route yang digunakan ketika user menyelesaikan orderan
app.post("/cancel-order-user", (req, res) => {
	const dataKey = req.body.userKey;
	overwriteOrder("userKey", dataKey, "cancelled", res);
});

// Route yang digunakan ketika user menyelesaikan orderan
app.post("/finish-order-montir", (req, res) => {
	const dataKey = req.body.montirKey;
	overwriteOrder("montirKey", dataKey, "finished", res);
});

// Route yang digunakan ketika user menyelesaikan orderan
app.post("/cancel-order-montir", (req, res) => {
	const dataKey = req.body.montirKey;
	overwriteOrder("montirKey", dataKey, "cancelled", res);
});

app.post("/montir-arrived", (req, res) => {
	const data = req.body;
	// https://stackoverflow.com/questions/33590114/update-a-row-in-nedb (Remove new line of data after replace)
	databaseOrder.update({orderStatus: "active", montirKey: data.montirKey}, {$set: {montirStatus: "montir-arrived"}}, {}, () => {
		databaseOrder.loadDatabase();
	});
	res.end();
});

module.exports = app;