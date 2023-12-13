let key = localStorage.getItem("customerKey");
function getOrderHistory() {
	const desc = document.getElementById("desc");
	const orderHistoryDiv = document.getElementById("orderHistory");
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
	fetch("/order-history-user", option)
		.then(response => response.json())
		.then(result => {
			if(result.orderHistory == false) {
				desc.innerHTML = "There Is No Order History Available.";
			} else {
				for(let data of result) {
					let dateParsed = new Date(data.postedAt);
					const orderChildDiv = document.createElement("article");
					orderChildDiv.innerHTML += `
                        <header>Order No. ${data._id}</header>
                        <p>Posted At: ${dateParsed}</p>
                        <p>User Problem: ${data.userProb}</p>
                        <p>Status: ${data.orderStatus}</p>
                    `;
					orderHistoryDiv.append(orderChildDiv);
				}
			}
		});
}

window.onload = () => {
	getOrderHistory();
};