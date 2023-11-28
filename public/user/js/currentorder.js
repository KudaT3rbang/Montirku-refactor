/* eslint-disable no-undef */
let key = localStorage.getItem("customerKey");
var map = L.map("map").setView([0, 0], 13);
let groupMarker = new L.featureGroup();
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
	maxZoom: 19,
	attribution: "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
}).addTo(map);
const orderStatusText = document.getElementById("orderStatus");
const divCurrentOrder = document.getElementById("currentOrder");

function cancelOrder() {
	const cancelButton = document.getElementById("cancelButton");
	cancelButton.setAttribute("aria-busy", "true");
	const data = {
		userKey: key,
	};
  
	const option = {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(data)
	};
	fetch("/cancel-order-user", option)
		.then(response => {
			if(response) {
				window.location.href = "getmontir.html";
			}
		});
}

function finishOrder() {
	const finishButton = document.getElementById("finishButton");
	finishButton.setAttribute("aria-busy", "true");
	const data = {
		userKey: key,
	};
  
	const option = {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(data)
	};
	fetch("/finish-order-user", option)
		.then(response => {
			if(response) {
				window.location.href = "getmontir.html";
			}
		});
}

// Tambahkan marker user dan montir
function addMarker(userLon, userLat, montirLon, montirLat) {
	groupMarker.clearLayers();
	orderStatusText.innerText = "Montir is on the way";
	const userMarker = L.marker({ lng: userLon, lat: userLat });
	const montirMarker = L.marker({ lng: montirLon, lat: montirLat });

	groupMarker.addLayer(userMarker);
	groupMarker.addLayer(montirMarker);
	groupMarker.addTo(map);
	map.fitBounds(groupMarker.getBounds());
}

// Upload lokasi user
function uploadLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(position => {
			const lat = position.coords.latitude;
			const lon = position.coords.longitude;

			const data = {
				userKey: key,
				userLat: lat,
				userLon: lon
			};

			const option = {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(data)
			};

			fetch("/update-location-user", option);
		}, showError);
	} else {
		alert("Geolocation is not supported by this browser.");
	}
}

// Check orderan apakah ada order atau tidak
function checkOrder() {
	const data = {
		userKey: key,
	};
  
	const option = {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(data)
	};
  
	fetch("/check-order-user", option)
		.then(response => response.json())
		.then(result => {	
			if (result.orderExist == 0) {
				clearInterval(intervalUploadLocation);
				clearInterval(intervalCheckOrder);
				orderStatusText.innerText = "There is no active order";
			} else if(result.montirStatus == "fetching-montir") {
				const cancelButtonExist = document.getElementById("cancelButton");
				if (!cancelButtonExist) {
					const buttonCancel = document.createElement("button");
					buttonCancel.classList.add("warning");
					buttonCancel.textContent = "Cancel Order";
					buttonCancel.setAttribute("id", "cancelButton");
					buttonCancel.onclick = () => cancelOrder();
					divCurrentOrder.appendChild(buttonCancel);
				}
				orderStatusText.innerText = "Searching for montir";
			} else if(result.montirStatus == "montir-otw") {
				addMarker(result.userLon, result.userLat, result.montirLon, result.montirLat);
				const cancelButtonExist = document.getElementById("cancelButton");
				if (!cancelButtonExist) {
					const buttonCancel = document.createElement("button");
					buttonCancel.classList.add("warning");
					buttonCancel.textContent = "Cancel Order";
					buttonCancel.setAttribute("id", "cancelButton");
					buttonCancel.onclick = () => cancelOrder();
					divCurrentOrder.appendChild(buttonCancel);
				}
			} else {
				clearInterval(intervalUploadLocation);
				clearInterval(intervalCheckOrder);
				addMarker(result.userLon, result.userLat, result.montirLon, result.montirLat);
				const finishButtonExist = document.getElementById("finishButton");
				if (!finishButtonExist) {
					const buttonDone = document.createElement("button");
					buttonDone.textContent = "Finish Order";
					buttonDone.setAttribute("id", "finishButton");
					buttonDone.onclick = () => finishOrder();
					divCurrentOrder.appendChild(buttonDone);
				}
			}
		})
		.catch(error => showError(error));
}

function showError(error) {
	console.error(error);
}

window.onload = () => {
	intervalUploadLocation = setInterval(uploadLocation, 5000);
	intervalCheckOrder = setInterval(checkOrder, 5000);
};