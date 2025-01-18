
// Animated coal background functionality
const body = document.body;
const coalParticles = [];

// Create coal particles
for (let i = 0; i < 30; i++) {
    const coal = document.createElement('div');
    coal.className = 'coal-particle';
    coal.style.left = Math.random() * 100 + '%';
    coal.style.animationDuration = (Math.random() * 5 + 3) + 's';
    coal.style.animationDelay = (Math.random() * 3) + 's';
    body.appendChild(coal);
    coalParticles.push(coal);
}

// Add styles for coal animation
const coalStyles = document.createElement('style');
coalStyles.textContent = `
    .coal-particle {
        position: fixed;
        width: 50px;
        height: 50px;
        background: #1a1a1a;
        clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        opacity: 0.2;
        animation: floatCoal linear infinite;
        z-index: -1;
        pointer-events: none;
    }

    @keyframes floatCoal {
        0% {
            transform: translateY(-100vh) rotate(0deg);
        }
        100% {
            transform: translateY(100vh) rotate(360deg);
        }
    }

    body {
        position: relative;
        overflow-x: hidden;
    }
`;
document.head.appendChild(coalStyles);

// Original land selection functionality
document.getElementById('land').addEventListener('change', function () {
    var landSizeGroup = document.getElementById('land-size-group');
    if (this.value === 'yes') {
        landSizeGroup.style.display = 'block';
    } else {
        landSizeGroup.style.display = 'none';
    }
});

// Form submission logic (combining both functionalities)
document.getElementById('co2-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form from submitting

    // Fetch form values
    const userType = document.getElementById('user-type').value;
    const activity = document.getElementById('activity').value;
    const energy = document.getElementById('energy').value;
    const land = document.getElementById('land').value;
    const landSize = document.getElementById('land-size').value || 'N/A';
    const transport = document.getElementById('transport').value;
    const invest = document.querySelector('input[name="invest"]:checked').value;
    const renewable = document.querySelector('input[name="renewable"]:checked').value;

    // Generate and display user's information
    let userInfo = `
        <h2>Your Information</h2>
        <p><strong>User Type:</strong> ${userType}</p>
        <p><strong>Primary Activity:</strong> ${activity}</p>
        <p><strong>Energy Consumption:</strong> ${energy} kWh</p>
        <p><strong>Land Available:</strong> ${land} ${land === 'yes' ? `(${landSize} acres)` : ''}</p>
        <p><strong>Transportation Mode:</strong> ${transport}</p>
        <p><strong>Willing to Invest in CO2 Technologies:</strong> ${invest}</p>
        <p><strong>Interested in Renewable Energy:</strong> ${renewable}</p>
    `;

    // Pathway Recommendation Logic
    let pathways = [];

    // CCS Recommendation (Industry + High Emissions)
    if (userType === 'business' && energy > 5000 && invest === 'yes') {
        pathways.push('CO2 Compression and Sequestration (CCS)');
    }

    // DAC Recommendation (High Carbon Footprint + Willing to Invest)
    if (energy > 2000 && invest === 'yes') {
        pathways.push('Direct Air Capture (DAC)');
    }

    // BECCS Recommendation (Biomass Available + Energy Needs)
    if (activity === 'farming' && energy > 1000 && invest === 'yes') {
        pathways.push('Bioenergy with Carbon Capture and Storage (BECCS)');
    }

    // Forestation/ Reforestation Recommendation (Land Available)
    if (land === 'yes' && landSize > 1) {
        pathways.push('Forestation and Reforestation');
    }

    // Carbon Mineralization Recommendation (Proximity to Minerals + CO2 Emissions)
    if (userType === 'business' && energy > 3000) {
        pathways.push('Carbon Mineralization');
    }

    // Ocean Sequestration (Coastal Areas + Marine Conservation Interest)
    if (userType === 'government' && transport === 'public_transport') {
        pathways.push('Ocean-Based Carbon Sequestration');
    }

    // Soil Carbon Sequestration Recommendation (Farming + Sustainable Farming Practices)
    if (activity === 'farming') {
        pathways.push('Soil Carbon Sequestration');
    }

    // Carbon Recycling and Utilization (Industrial + Sustainable Practices)
    if (userType === 'business' && invest === 'yes') {
        pathways.push('Carbon Recycling and Utilization');
    }

    // Enhanced Weathering Recommendation (Land + Willing to Invest)
    if (land === 'yes' && landSize > 5 && invest === 'yes') {
        pathways.push('Enhanced Weathering');
    }

    // Energy Efficiency and Renewable Energy (High Energy Consumption + Renewable Interest)
    if (energy > 1500 && renewable === 'yes') {
        pathways.push('Energy Efficiency and Renewable Energy');
    }

    // Carbon-Neutral Fuels (Fuel Consumption + Alternative Fuels Interest)
    if (transport === 'car' && renewable === 'yes') {
        pathways.push('Carbon-Neutral Fuels');
    }

    // Generate pathway recommendations output
    let recommendations = `<h2>Recommended Pathways for CO2 Reduction:</h2>`;
    if (pathways.length > 0) {
        recommendations += `<ul>`;
        pathways.forEach(pathway => {
            recommendations += `<li>${pathway}</li>`;
        });
        recommendations += `</ul>`;
    } else {
        recommendations += `<p>No specific pathways recommended based on your input. Please provide more details.</p>`;
    }

    // Display both user's information and recommended pathways
    document.getElementById('result').innerHTML = userInfo + recommendations;
});



// Form Submission Handling
document.getElementById('co2-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Get form data
    const userType = document.getElementById('user-type').value;
    const primaryActivity = document.getElementById('activity').value;
    const energy = parseFloat(document.getElementById('energy').value);
    const landAvailable = document.getElementById('land').value;
    const landSize = landAvailable === 'yes' ? parseFloat(document.getElementById('land-size').value) : null;
    const transport = document.getElementById('transport').value;
    const invest = document.querySelector('input[name="invest"]:checked').value;
    const renewable = document.querySelector('input[name="renewable"]:checked').value;

    // Prepare data to send to the server
    const formData = {
        userType: userType,
        primaryActivity: primaryActivity,
        energy: energy,
        landAvailable: landAvailable,
        landSize: landSize,
        transport: transport,
        invest: invest,
        renewable: renewable
    };

    // Send form data to the server
    fetch('/submit-pathways', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Display the recommended pathways
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '<h2>Recommended CO2 Control Pathways:</h2><ul>';
            data.recommendedPathways.forEach(pathway => {
                resultDiv.innerHTML += `<li>${pathway}</li>`;
            });
            resultDiv.innerHTML += '</ul>';
            alert('Data submitted successfully and pathways generated!');
        } else {
            alert('Error submitting form. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error occurred while saving the data.');
    });
});