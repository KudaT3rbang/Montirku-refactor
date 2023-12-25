const loginButton = document.getElementById("loginButton");
const loginStatus = document.getElementById("loginStatus");

function showModal(status) {
	loginButton.setAttribute("aria-busy", "false");
	loginStatus.innerHTML = "";
	if(status == 1) {
		loginStatus.innerHTML += `
            <dialog open>
            <article>
            <h3>Login Success!</h3>
            <p>
              Redirecting...
            </p>
            <footer>
            <button class="inline-button" onclick="window.location='addservice.html';">Admin Page</button>
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
			userType: "admin"
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
					localStorage.setItem("adminKey", result._id);
					showModal(1);
				} else {
					console.log(result);
					showModal(0);
				}
			});
	}
}

loginButton.addEventListener("click", (e) => {
	e.preventDefault();
	logIn();
});
