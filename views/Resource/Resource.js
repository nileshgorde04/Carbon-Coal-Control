// Function to collect data from all forms
/*function collectAllData() {
    // Get data from Carbon Sink Management Form
    const carbonSinkData = {
        sinkType: document.getElementById('sinkType')?.value,
        areaSize: document.getElementById('areaSize')?.value,
        co2AbsorptionRate: document.getElementById('co2AbsorptionRate')?.value,
        location: document.getElementById('location')?.value,
        lastHealthCheck: document.getElementById('lastHealthCheckCSM')?.value,
        healthStatus: document.getElementById('healthStatusCSM')?.value
    };

    // Get data from Energy Consumption Form
    const energyConsumptionData = {
        energyType: document.getElementById('energyType')?.value,
        energyUsed: document.getElementById('energyUsed')?.value,
        timePeriod: document.getElementById('timePeriod')?.value,
        emissionFactor: document.getElementById('emissionFactor')?.value,
        totalEmission: document.getElementById('Totalemission')?.value
    };

    // Get data from Forest Management Form
    const forestManagementData = {
        forestType: document.getElementById('forestType')?.value,
        treeDensity: document.getElementById('treeDensity')?.value,
        growthRate: document.getElementById('growthRate')?.value,
        lastHealthCheck: document.getElementById('lastHealthCheckFM')?.value,
        healthStatus: document.getElementById('healthStatusFM')?.value
    };

    // Combine data into a single object
    const allFormData = {
        carbonSinkData,
        energyConsumptionData,
        forestManagementData
    };

    console.log("Collected Data:", allFormData);
 
}*/

// Function to collect data from individual forms and send to server
function submitFormData(formId, dataObject) {
    // Define a fixed URL for each formId
    let url;
    switch (formId) {
        case 'energy-consumption':
            url = '/submit-energy-consumption';
            break;
        case 'carbon-sink-management':
            url = '/submit-carbon-sink-management';
            break;
        case 'forest-management':
            url = '/submit-forest-management';
            break;
        default:
            console.error('Invalid formId:', formId);
            return; // Exit if formId is not recognized
    }

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataObject)
    })
    .then(response => response.json())
    .then(data => {
        console.log(`${formId} submission response:`, data);
        
        // Check if submission was successful and alert the user
        if (data.success) {
            alert('Data successfully stored in the database!');
        } else {
            alert('There was an issue storing the data. Please try again.');
        }
    })
    .catch(error => {
        console.error(`${formId} submission error:`, error);
        alert('An error occurred while submitting the data.');
    });
}

// Collects data and submits for Energy Consumption Form
document.getElementById('form1').addEventListener('submit', function (event) {
    event.preventDefault();
    const energyConsumptionData = {
        energyType: document.getElementById('energyType')?.value,
        energyUsed: document.getElementById('energyUsed')?.value,
        timePeriod: document.getElementById('timePeriod')?.value,
        emissionFactor: document.getElementById('emissionFactor')?.value,
        totalEmission: document.getElementById('Totalemission')?.value
    };
    submitFormData('energy-consumption', energyConsumptionData);
});

// Collects data and submits for Carbon Sink Management Form
document.getElementById('form2').addEventListener('submit', function (event) {
    event.preventDefault();
    const carbonSinkData = {
        sinkType: document.getElementById('sinkType')?.value,
        areaSize: document.getElementById('areaSize')?.value,
        co2AbsorptionRate: document.getElementById('co2AbsorptionRate')?.value,
        location: document.getElementById('location')?.value,
        lastHealthCheck: document.getElementById('lastHealthCheckCSM')?.value,
        healthStatus: document.getElementById('healthStatus')?.value
    };
    submitFormData('carbon-sink-management', carbonSinkData);
});

// Collects data and submits for Forest Management Form
document.getElementById('form3').addEventListener('submit', function (event) {
    event.preventDefault();
    const forestManagementData = {
        forestType: document.getElementById('forestType')?.value,
        treeDensity: document.getElementById('treeDensity')?.value,
        growthRate: document.getElementById('growthRate')?.value,
        lastHealthCheck: document.getElementById('lastHealthCheckFM')?.value,
        healthStatus: document.getElementById('healthStatus')?.value
    };
    submitFormData('forest-management', forestManagementData);
});