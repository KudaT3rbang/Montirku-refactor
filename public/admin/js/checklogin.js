const loginStatus = document.getElementById("loginStatus");
if(localStorage.getItem("adminKey") === null) {
	loginStatus.innerHTML += `
        <dialog open>
        <article>
        <h3>You are not logged in!</h3>
        <p>
          Please log in first, to use montirku!
        </p>
        <footer>
        <button onclick="window.location='login.html';">Log In</button>
        </footer>
        </article>
        </dialog>
    `;
}

// eslint-disable-next-line no-unused-vars
function logout() {
	localStorage.clear();
	location.reload(); 
}