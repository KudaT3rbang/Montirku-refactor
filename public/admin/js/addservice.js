const submitButton = document.getElementById("submitButton");

function submitService() {
	submitButton.setAttribute("aria-busy", "true");
	const orderTypeValue = document.getElementById("orderType").value;
	const orderNameValue = document.getElementById("orderName").value;
	const orderPriceValue = document.getElementById("orderPrice").value;
	const orderDescValue = document.getElementById("orderDesc").value;
	const submitStatus = document.getElementById("submitStatus");

	const data = {
		orderType: orderTypeValue,
		orderName: orderNameValue,
		orderPrice: orderPriceValue,
		orderDesc: orderDescValue
	};
	console.log(data);

	const option = {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(data)
	};

	fetch("/add-service", option)
		.then(response => response.json())
		.then(result => {
			if(result) {
				submitStatus.innerHTML += `
				<dialog open>
				<article>
				<h3>Data Submitted Succesfully!</h3>
				<p>
					New Service added!
				</p>
				<footer>
				<button class="inline-button" onclick="location.reload();">Confirm</button>
				</footer>
				</article>
				</dialog>
			`;
			}
		});		
}

submitButton.addEventListener("click", (e) => {
	e.preventDefault();
	submitService();
});