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
				userLat: docs[0].montirLat,
				userLon: docs[0].montirLon
			});
		}
	});
}

// Fungsi mengambil key user/montir untuk menyelesaikan orderan
function finishOrder(keyType, keyValue, res) {
	let query = {
		orderStatus: "active",
	};
	query[keyType] = keyValue;
	databaseOrder.update(query, {$set:{orderStatus: "finished"}}, {}, () => {
		databaseOrder.loadDatabase();
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

// Route yang digunakan ketika user menyelesaikan orderan
app.post("/finish-order-user", (req, res) => {
	const dataKey = req.body.userKey;
	finishOrder("userKey", dataKey, res);
});