// Key names we will use in the browser's storage
const DB_KEY = 'churnguard_db';
const SESSION_KEY = 'churnguard_session';

/**
 * Asynchronous function to load the JSON file into localStorage.
 * Only fetches the first time; on subsequent visits it reads directly from localStorage
 * so we don't lose changes made in the application.
 */
async function loadDatabase() {
    // Checks if a saved copy already exists in the browser
    const savedData = localStorage.getItem(DB_KEY);

    if (!savedData) {
        // If it doesn't exist, fetches the JSON file from the data/ folder
        const response = await fetch('data/mock_data.json');
        const jsonData = await response.json();

        // Converts the JavaScript object into text and saves it in localStorage
        localStorage.setItem(DB_KEY, JSON.stringify(jsonData));
        return jsonData;
    }

    // If it already exists, converts the text back into a JavaScript object
    return JSON.parse(savedData);
}


// Function called by the "Quick fill" buttons in HTML.
function fillDemo(demoEmail) {
    document.getElementById('email').value = demoEmail;
    document.getElementById('password').value = '123';
}

/**
 * Login form logic.
 * Only runs if we are on the index.html page (where 'login-form' exists).
 */
const loginForm = document.getElementById('login-form');

if (loginForm) {
    // Loads the data as soon as the page opens
    loadDatabase();

    // Listens for the click on the "Sign In" button ('submit' event)
    loginForm.addEventListener('submit', async function (event) {
        // Prevents the page from reloading (default HTML behavior)
        event.preventDefault();

        // Reads what the user typed in the inputs (.trim() removes extra spaces)
        const typedEmail = document.getElementById('email').value.trim();
        const typedPassword = document.getElementById('password').value.trim();
        const errorBox = document.getElementById('error-message');

        // Fetches the database (JSON)
        const db = await loadDatabase();

        // Searches the 'users' list for someone with the same email AND password
        const user = db.users.find(
            (u) => u.email === typedEmail && u.password === typedPassword
        );

        // If not found, shows an error and stops here
        if (!user) {
            errorBox.textContent = 'Incorrect email or password.';
            errorBox.classList.remove('d-none'); // Makes the red box visible
            return;
        }

        // Checks if the account is active
        if (!user.active) {
            errorBox.textContent = 'This account is disabled.';
            errorBox.classList.remove('d-none');
            return;
        }

        // Fetches the profile name (Admin or Manager) from the 'profiles' table using profile_id
        const profile = db.profiles.find((p) => p.id === user.profile_id);

        // Creates a session object with the necessary data for the Dashboard
        const session = {
            id: user.id,
            name: user.name,
            email: user.email,
            profile_id: user.profile_id,
            profile_name: profile ? profile.name : 'Unknown'
        };

        // Saves the active session in sessionStorage (cleared when you close the tab)
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

        // Redirects the user to the main dashboard
        window.location.href = 'dashboard.html';
    });
}

// Helper functions we will use in dashboard.html

function getLoggedInUser() {
    const sessionText = sessionStorage.getItem(SESSION_KEY);
    if (!sessionText) {
        // If someone tries to open dashboard.html without logging in, goes back to index.html
        window.location.href = 'index.html';
        return null;
    }
    return JSON.parse(sessionText);
}

function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
}