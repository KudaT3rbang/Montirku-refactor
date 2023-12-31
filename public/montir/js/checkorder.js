/* eslint-disable no-undef */
let montirKey = localStorage.getItem("montirKey");
const divOrderActive = document.getElementById("orderActive");

// Digunakan untuk menampilkan orderan masuk
function fetchOrder() {
	const orderDiv = document.getElementById("orderDiv");
	orderDiv.innerHTML = "";
	fetch("/get-order")
		.then(response => response.json())
		.then(orderData => {
			if(orderActive.childNodes.length > 1) {
				// Kalau sudah punya order active jangan tampilkan apa-apa dan berhenti fetch 
				orderDiv.innerHTML = "";
				clearInterval(intervalId);
			} else if(orderData.length == 0) {
				// Bila tidak ada order dan tidak ada order active yang diambil montir, tampilkan text dan tetap fetch
				orderDiv.innerHTML += "<p>No order, for now...</p>";
			} else {
				// Bila ada order buat div baru untuk orderan, tetap fetch
				const orderChildDiv = document.createElement("article");
				orderChildDiv.innerHTML += `
						<header class="no-bottom-margin">Order No. ${orderData[0]._id}</header> 
                        <p>Latitude: ${orderData[0].userLat}</p>
                        <p>Longitude: ${orderData[0].userLon}</p>
                        <p>User Problem: ${orderData[0].orderName}</p>
                        <p>Status: ${orderData[0].montirStatus}</p>
                        <button onclick="takeOrder('${orderData[0]._id}')" id='${orderData[0]._id}'>Take Order</button>
                    `;
				orderDiv.append(orderChildDiv);
			}
		})
		.catch(error => showError(error));
}

// Fungsi untuk cek order, jika ada order aktif yang diambil montir maka tampilkan teks
function checkOrder() {
	const data = {
		montirKey: montirKey,
		orderStatus: "active"
	};
  
	const option = {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(data)
	};
  
	fetch("/check-order-montir", option)
		.then(response => response.json())
		.then(result => {
			if (result.orderExist == 1) {
				divOrderActive.innerHTML += `
				<p>There is active order, please check it at active order page.</p>
				<a href="./currentOrder.html"><button>Active Order Page</button></a>
				`;
			}
		})
		.catch(error => {
			showError(error);
		});
}

// Fungsi untuk mengambil orderan dan upload data ke database
// eslint-disable-next-line no-unused-vars
function takeOrder(id) {
	const orderChild = document.getElementById(id);
	orderChild.setAttribute("aria-busy", "true");
	clearInterval(intervalId);
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(position => {
			const lat = position.coords.latitude;
			const lon = position.coords.longitude;

			const data = {
				id: id,
				montirKey: montirKey,
				montirLat: lat,
				montirLon: lon,
				montirStatus: "montir-otw"
			};

			const option = {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(data)
			};

			fetch("/take-order", option)
				.then(response => response.json())
				.then(result => {
					if(result) {
						window.location.href = "currentorder.html";
					}
				})
				.catch(error => showError(error));
		}, showError);
	} else {
		alert("Geolocation is not supported by this browser.");
	}
}

function showError(error) {
	console.error(error);
}

window.onload = () => {
	checkOrder();
	fetchOrder();
	intervalId = setInterval(fetchOrder, 5000);
};