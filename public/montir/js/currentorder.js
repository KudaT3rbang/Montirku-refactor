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
				clearInterval(intervalId);
				orderStatusText.innerText = "There is no active order";
			} else if(result.montirStatus == "montir-arrived") {
				clearInterval(intervalUploadLocation);
				clearInterval(intervalCheckOrder);
				addMarker(result.userLon, result.userLat, result.montirLon, result.montirLat);
			} else {
				clearInterval(intervalUploadLocation);
				clearInterval(intervalCheckOrder);
				addMarker(result.userLon, result.userLat, result.montirLon, result.montirLat);
				const finishButton = divCurrentOrder.querySelector("button");
				// if (!finishButton) {
				// 	const buttonDone = document.createElement("button");
				// 	buttonDone.textContent = "Finish Order";
				// 	buttonDone.onclick = () => finishOrder();
				// 	divCurrentOrder.appendChild(buttonDone);
				// }
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