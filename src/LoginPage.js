const wrapper = document.querySelector('.wrapper');
const registerLink = document.querySelector('.register-link');
const loginLink = document.querySelector('.login-link');

// Function to handle form submission
async function handleLogin(event) {
    event.preventDefault(); // Prevent the default form submission
    console.log("Login start")
    // Collect form data
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    try {
        // Send login request to the server
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, role })
        });

        // Parse the response
        const result = await response.json();

        // Handle redirection based on the response
        if (result.message == "Login successful") {
            if (role === 'admin') {
                window.location.href = "/views/AdminDashboard.html";
            } else if (role === 'user' || role === 'data-analyst') {
                window.location.href = "/views/UserDashBoard.html";
            }
        } else {
            alert('Invalid credentials. Please try again.');
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred. Please try again later.');
    }
}

// Function to handle signup submission
async function handleSignup(event) {
    event.preventDefault(); // Prevent the default form submission
    console.log("Signup start");

    // Collect form data
    const username = document.getElementById('username2').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password2').value;
    const role = document.getElementById('role2').value;

    try {
        // Send signup request to the server
        const response = await fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password, role })
        });

        // Parse the response
        const result = await response.json();

        // Handle response
        if (result.success) {
            alert('Signup successful! Please login.');
            document.querySelector('.wrapper').classList.remove('active'); // Switch to login view
        } else {
            alert(result.message || 'Signup failed. Please try again.');
        }
    } catch (error) {
        console.error('Error during signup:', error);
        alert('An error occurred. Please try again later.');
    }
}
// Add an event listener to the form for submission
document.getElementById('loginbtn').addEventListener('click', handleLogin);
document.getElementById('signupForm').addEventListener('click', handleSignup);

registerLink.onclick = () => {
    wrapper.classList.add('active');
};

loginLink.onclick = () => {
    wrapper.classList.remove('active');
};

