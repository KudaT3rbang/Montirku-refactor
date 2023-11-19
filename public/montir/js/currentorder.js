/* eslint-disable no-undef */
let key = localStorage.getItem("montirKey");
var map = L.map("map").setView([0, 0], 13);
let groupMarker = new L.featureGroup();
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
	maxZoom: 19,
	attribution: "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
}).addTo(map);
const divCurrentOrder = document.getElementById("currentOrder");
const orderStatusText = document.getElementById("orderStatus");

// Tambahkan marker user dan montir
function addMarker(userLon, userLat, montirLon, montirLat) {
	groupMarker.clearLayers();
	console.log(userLon, userLat, montirLon, montirLat);
	const userMarker = L.marker({ lng: userLon, lat: userLat });
	const montirMarker = L.marker({ lng: montirLon, lat: montirLat });

	groupMarker.addLayer(userMarker);
	groupMarker.addLayer(montirMarker);
	groupMarker.addTo(map);
	map.fitBounds(groupMarker.getBounds());
}

function cancelOrder() {
	const cancelButton = document.getElementById("cancelButton");
	cancelButton.setAttribute("aria-busy", "true");
	const data = {
		montirKey: key,
	};
  
	const option = {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(data)
	};
	fetch("/cancel-order-montir", option)
		.then(response => {
			if(response) {
				window.location.href = "http://localhost:5500/montir/checkorder.html";
			}
		});
}

function finishOrder() {
	const finishButton = document.getElementById("finishButton");
	finishButton.setAttribute("aria-busy", "true");
	const data = {
		montirKey: key,
	};
  
	const option = {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(data)
	};
	fetch("/finish-order-montir", option)
		.then(response => {
			if(response) {
				location.reload();
			}
		});
}

// Upload lokasi montir
function uploadLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(position => {
			const lat = position.coords.latitude;
			const lon = position.coords.longitude;

			const data = {
				montirKey: key,
				montirLat: lat,
				montirLon: lon
			};

			const option = {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(data)
			};

			fetch("/update-location-montir", option);
		}, showError);
	} else {
		alert("Geolocation is not supported by this browser.");
	}
}

function montirArrived() {
	const arrivedButton = document.getElementById("arrivedButton");
	arrivedButton.setAttribute("aria-busy", "true");
	const data = {
		montirKey: key,
	};
  
	const option = {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(data)
	};

	fetch("/montir-arrived", option)
		.then(response => {
			if(response) {
				location.reload();
			}
		});
}

// Cek orderan
function checkOrder() {
	const data = {
		montirKey: key,
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
			if (result.orderExist == 0) {
				clearInterval(intervalUploadLocation);
				clearInterval(intervalCheckOrder);
				orderStatusText.innerText = "There is no active order";
			} else if(result.montirStatus == "montir-otw") {
				addMarker(result.userLon, result.userLat, result.montirLon, result.montirLat);
				const cancelButtonExist = document.getElementById("cancelButton");
				const arrivedButtonExist = document.getElementById("arrivedButton");
				if (!cancelButtonExist && !arrivedButtonExist) {
					const buttonCancel = document.createElement("button");
					buttonCancel.classList.add("warning");
					buttonCancel.textContent = "Cancel Order";
					buttonCancel.setAttribute("id", "cancelButton");
					buttonCancel.onclick = () => cancelOrder();
					divCurrentOrder.appendChild(buttonCancel);
					const buttonArrived = document.createElement("button");
					buttonArrived.textContent = "Montir Arrived";
					buttonArrived.setAttribute("id", "arrivedButton");
					buttonArrived.onclick = () => montirArrived();
					divCurrentOrder.appendChild(buttonArrived);
				}
			} else {
				clearInterval(intervalUploadLocation);
				clearInterval(intervalCheckOrder);
				addMarker(result.userLon, result.userLat, result.montirLon, result.montirLat);
				const finishButtonExist = document.getElementById("finishButton");
				if (!finishButtonExist) {
					const buttonFinish = document.createElement("button");
					buttonFinish.textContent = "Finish Order";
					buttonFinish.setAttribute("id", "finishButton");
					buttonFinish.onclick = () => finishOrder();
					divCurrentOrder.appendChild(buttonFinish);
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