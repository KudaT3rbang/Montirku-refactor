/* eslint-disable no-undef */
let key = localStorage.getItem("customerKey");
const mainContainer = document.getElementById("main-container");
const submitButton = document.getElementById("problemButton");
const descOrder = document.getElementById("desc");
const htmlMap = document.getElementById("map");
const inputForm = document.getElementById("reportForm");
var map = L.map("map").setView([0, 0], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
	attribution: "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
}).addTo(map);

// Tampilkan lokasi sekarang di map
function showLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(location => {
			let lat = location.coords.latitude;
			let lon = location.coords.longitude;
			L.marker([lat, lon]).addTo(map);
			map.panTo([lat, lon]);
		}, showError);
	} else {
		alert("Geolocation is not supported by this browser.");
	}
}

// Hilangkan form dan map bila ada order aktif
function hideForm() {
	htmlMap.style.display = "none";
	inputForm.style.display = "none";
	submitButton.style.display = "none";
	descOrder.style.display = "none";
}

// Submit order ke server dengan data
function submitOrder() {
	submitButton.setAttribute("aria-busy", "true");
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(position => {
			const lat = position.coords.latitude;
			const lon = position.coords.longitude;
			const problem = document.getElementById("userProblem").value;

			const data = {
				orderStatus: "active",
				userKey: key,
				userLat: lat,
				userLon: lon,
				userProb: problem,
				montirKey: "",
				montirLat: "",
				montirLon: "",
				montirStatus: "fetching-montir",
				postedAt: Date.now()
			};

			const option = {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(data)
			};

			fetch("/submit-order", option)
				.then(response => response.json())
				.then(result => {
					if(result) {
						location.reload();
					}
				})
				.catch(error => showError(error));
		}, showError);
	} else {
		alert("Geolocation is not supported by this browser.");
	}
}

// Fungsi cek orderan aktif milik user
function checkOrder() {
	const data = {
		userKey: key,
		orderStatus: "active"
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
			// Hide form bila ada order aktif
			if (result.orderExist == 1) {
				hideForm();
				const divOrderActive = document.createElement("div");
				divOrderActive.innerHTML += `
				<p>There is active order, please check it at active order page.</p>
				<a href="./currentOrder.html"><button>Active Order Page</button></a>
				`;
				mainContainer.append(divOrderActive);
			} 
			else {
				showLocation();
			}
		})
		.catch(error => showError(error));
}

function showError(error) {
	console.error(error);
}

submitButton.addEventListener("click", (e) => {
	e.preventDefault();
	submitOrder();
});

window.onload = () => {
	checkOrder();
};
