const submitButton = document.getElementById("signupButton");
const loginStatus = document.getElementById("signupStatus");

function showModal(status) {
	submitButton.setAttribute("aria-busy", "false");
	loginStatus.innerHTML = "";
	if(status == 1) {
		loginStatus.innerHTML += `
            <dialog open>
            <article>
            <h3>Sign Up Success!</h3>
            <p>
              Please go to login page!
            </p>
            <footer>
            <button class="inline-button" onclick="window.location='./login.html';">Login Page</button>
            </footer>
            </article>
            </dialog>
        `;
	} else {
		loginStatus.innerHTML += `
        <dialog open>
        <article>
        <h3>Sign Up Failed!</h3>
        <p>
          Username already taken! Please use other username!
        </p>
        <footer>
        <button class="inline-button" onclick="location.reload();">Try Again</button>
        </footer>
        </article>
        </dialog>
    `;
	}
}

function signUp() {
	submitButton.setAttribute("aria-busy", "true");
	const userNameInput = document.getElementById("userName").value;
	const userPasswordInput = document.getElementById("userPassword").value;
	if(userNameInput == "" || userPasswordInput == "") {
		loginStatus.innerHTML += `
        <dialog open>
        <article>
        <h3>Sign Up Failed!</h3>
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
		console.log(data);
		fetch("/sign-up", option)
			.then(response => response.json())
			.then(result => {
				if(result.signUpSuccess == true) {
					console.log("Sign Up Success");
					showModal(1);
				} else {
					console.log("Sign Up Failed");
					showModal(0);
				}
			});
	}
}

submitButton.addEventListener("click", (e) => {
	e.preventDefault();
	signUp();
});
