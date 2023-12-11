const loginStatus = document.getElementById("loginStatus");
if(localStorage.getItem("customerKey") === null) {
	loginStatus.innerHTML += `
        <dialog open>
        <article>
        <h3>You are not logged in!</h3>
        <p>
          Please log in first, to use montirku!
        </p>
        <footer>
        <button onclick="window.location='../auth/login.html';">Log In</button>
        </footer>
        </article>
        </dialog>
    `;
}

function logout() {
	localStorage.clear();
	location.reload(); 
}