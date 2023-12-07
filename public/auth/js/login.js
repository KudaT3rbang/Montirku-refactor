const loginButton = document.getElementById("loginButton");
const loginStatus = document.getElementById("loginStatus");

function showModal(status, redirect) {
	loginButton.setAttribute("aria-busy", "false");
	loginStatus.innerHTML = "";
	if(status == 1 && redirect == "customer") {
		loginStatus.innerHTML += `
            <dialog open>
            <article>
            <h3>Login Success!</h3>
            <p>
              Redirecting...
            </p>
            <footer>
            <button class="inline-button" onclick="window.location='../user/index.html';">Login Page</button>
            </footer>
            </article>
            </dialog>
        `;
	} else if (status == 1 && redirect == "montir") {
		loginStatus.innerHTML += `
            <dialog open>
            <article>
            <h3>Login Success!</h3>
            <p>
              Redirecting...
            </p>
            <footer>
            <button class="inline-button" onclick="window.location='../montir/index.html';">Login Page</button>
            </footer>
            </article>
            </dialog>
        `;
	} else {
		loginStatus.innerHTML += `
        <dialog open>
        <article>
        <h3>Login Failed!</h3>
        <p>
          Username/Password is wrong, please try again!
        </p>
        <footer>
        <button class="inline-button" onclick="location.reload();">Try Again</button>
        </footer>
        </article>
        </dialog>
    `;
	}
}

function logIn() {
	loginButton.setAttribute("aria-busy", "true");
	const userNameInput = document.getElementById("userName").value;
	const userPasswordInput = document.getElementById("userPassword").value;
	let radioButtonInput = document.querySelector("input[type='radio'][name=userType]:checked").value;
	if(userNameInput == "" || userPasswordInput == "") {
		loginStatus.innerHTML += `
        <dialog open>
        <article>
        <h3>Login Failed!</h3>
        <p>
          Username or password field must be filled!
        </p>
        <footer>
        <button class="inline-button" onclick="location.reload();">Try Again</button>
        </footer>
        </article>
        </dialog>
    `;
	} else {
		const data = {
			userName: userNameInput,
			userPassword: userPasswordInput,
			userType: radioButtonInput
		};
		const option = {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(data)
		};

		fetch("/log-in", option)
			.then(response => response.json())
			.then(result => {
				if(result.status == "success") {
					console.log(result);
					localStorage.clear();
					if(result.userType == "customer") {
						localStorage.setItem("customerKey", result._id);
						showModal(1, "customer");
					} else {
						localStorage.setItem("montirKey", result._id);
						showModal(1, "montir");
					}
				} else {
					console.log(result);
					showModal(0, "error");
				}
			});
	}
}

loginButton.addEventListener("click", (e) => {
	e.preventDefault();
	logIn();
});
