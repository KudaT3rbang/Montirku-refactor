/* eslint-disable no-undef */
let key = localStorage.getItem("customerKey");
const mainContainer = document.getElementById("main-container");
const serviceSelection = document.getElementById("serviceSelection");
const descOrder = document.getElementById("desc");

// Submit order ke server dengan data
function submitOrder(orderTypeInput, orderNameInput, orderPriceInput, buttonElement) {
	const buttonSelf = buttonElement;
	buttonSelf.setAttribute("aria-busy", "true");
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(position => {
			const lat = position.coords.latitude;
			const lon = position.coords.longitude;

			const data = {
				orderStatus: "active",
				orderType: orderTypeInput,
				orderName: orderNameInput,
				orderPrice: orderPriceInput,
				userKey: key,
				userLat: lat,
				userLon: lon,
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
				descOrder.style.display = "none";
				const divOrderActive = document.createElement("div");
				divOrderActive.innerHTML += `
				<p>There is active order, please check it at active order page.</p>
				<a href="./currentOrder.html"><button>Active Order Page</button></a>
				`;
				mainContainer.append(divOrderActive);
			} 
			else {
				descOrder.innerText = "Select Service";
				fetchSelection();
			}
		})
		.catch(error => showError(error));
}

function fetchSelection() {
	fetch("/service-selection")
		.then(response => response.json())
		.then(result => {
			for(let data of result) {
				const serviceChildDiv = document.createElement("article");
				serviceChildDiv.innerHTML +=
				`
				<h3>${data.orderName}</h3>
				<p>${data.orderDesc}</p>
				<p>Price: Rp. ${data.orderPrice}</p>
				<button onclick="submitOrder('${data.orderType}', '${data.orderName}', '${data.orderPrice}', this)">Take Service</button>
                `;
				serviceSelection.append(serviceChildDiv);
			}
		});
}

function showError(error) {
	console.error(error);
}

window.onload = () => {
	checkOrder();
};
