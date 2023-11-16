/* eslint-disable no-undef */
let key = localStorage.getItem("userKey");
var map = L.map("map").setView([0, 0], 13);
let groupMarker = new L.featureGroup();
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
	maxZoom: 19,
	attribution: "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
}).addTo(map);
const orderStatusText = document.getElementById("orderStatus");
const divCurrentOrder = document.getElementById("currentOrder");

function finishOrder() {
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
	fetch("/finish-order-user", option);
}

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
				clearInterval(intervalId);
				orderStatusText.innerText = "There is no active order";
			} else if(result.montirStatus == "fetching-montir") {
				orderStatusText.innerText = "Searching for montir";
			} else if(result.montirStatus == "montir-otw") {
				addMarker(result.userLon, result.userLat, result.montirLon, result.montirLat);
			} else {
				clearInterval(intervalId);
				addMarker(result.userLon, result.userLat, result.montirLon, result.montirLat);
				const finishButton = divCurrentOrder.querySelector("button");
				if (!finishButton) {
					const buttonDone = document.createElement("button");
					buttonDone.textContent = "Finish Order";
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
	checkOrder();
	intervalId = setInterval(checkOrder, 5000);
};