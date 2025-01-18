document.getElementById('activity-data-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const fuelUsage = parseFloat(document.getElementById('fuel-usage').value);
  const machineryUsage = parseFloat(document.getElementById('machinery-usage').value);
  const transportDistance = parseFloat(document.getElementById('transport-distance').value);

  if (validateInput(fuelUsage, machineryUsage, transportDistance)) {
    const totalEmissions = calculateEmissions(fuelUsage, machineryUsage, transportDistance);
    displayEmissionEstimates(totalEmissions);
  } else {
    alert('Please enter valid input values.');
  }
});

document.getElementById('generate-report-btn').addEventListener('click', function() {
  generateEmissionReport();
});

document.getElementById('show-credits-btn').addEventListener('click', function() {
  // Get the total emissions from the displayed value
  const emissionOutputText = document.getElementById('emission-output').innerText;
  const totalEmissions = parseFloat(emissionOutputText.replace(/[^0-9.-]+/g, "")); // Extract numeric value
  if (!isNaN(totalEmissions)) {
    manageCarbonCredits(totalEmissions); // Pass emissions to manage credits
  } else {
    alert('Please submit the data first to calculate emissions.');
  }
});

function validateInput(fuel, machinery, transport) {
  return fuel > 0 && machinery > 0 && transport > 0;
}

function calculateEmissions(fuelUsage, machineryUsage, transportDistance) {
  const emissionFactorFuel = 2.68; // kg CO2 per litre of fuel
  const emissionFactorMachinery = 1.5; // kg CO2 per machinery hour
  const emissionFactorTransport = 0.3; // kg CO2 per kilometer traveled

  const totalEmissions = (fuelUsage * emissionFactorFuel) +
                         (machineryUsage * emissionFactorMachinery) +
                         (transportDistance * emissionFactorTransport);

  return totalEmissions;
}

function displayEmissionEstimates(totalEmissions) {
  const emissionOutput = document.getElementById('emission-output');
  emissionOutput.innerHTML = `<strong>Total Estimated Emissions: ${totalEmissions.toFixed(2)} kg CO2</strong>`;
}

function generateEmissionReport() {
  const fuelUsage = parseFloat(document.getElementById('fuel-usage').value);
  const machineryUsage = parseFloat(document.getElementById('machinery-usage').value);
  const transportDistance = parseFloat(document.getElementById('transport-distance').value);
  const totalEmissions = calculateEmissions(fuelUsage, machineryUsage, transportDistance);

  const report = `
    <p><strong>Fuel Usage:</strong> ${fuelUsage} litres</p>
    <p><strong>Machinery Usage:</strong> ${machineryUsage} hours</p>
    <p><strong>Transportation Distance:</strong> ${transportDistance} km</p>
    <p><strong>Total Estimated Emissions:</strong> ${totalEmissions.toFixed(2)} kg CO2</p>
  `;
  document.getElementById('emission-report').innerHTML = report;
}

// Carbon Credits Management Logic
function manageCarbonCredits(totalEmissions) {
  const carbonCreditsDiv = document.getElementById('carbon-credits');
  if (totalEmissions > 1000) {
    carbonCreditsDiv.innerHTML = "<p>You need to control carbon emissions. No credits will be given for now.</p>";
  } else {
    let credits = calculateCredits(totalEmissions);
    carbonCreditsDiv.innerHTML = `<p>You have earned ${credits} carbon credits!</p>`;
  }
}

// Calculate Carbon Credits
function calculateCredits(totalEmissions) {
  const emissionThreshold = 500; // Emission level under which credits are awarded
  let credits = 0;
  
  if (totalEmissions <= emissionThreshold) {
    credits = Math.max(0, (emissionThreshold - totalEmissions) * 0.2); // For every unit less, earn 0.2 credits
  }
  return credits.toFixed(2);
}

document.getElementById('activity-data-form').addEventListener('submit', async function(event) {
  event.preventDefault();

  const fuelUsage = parseFloat(document.getElementById('fuel-usage').value);
  const machineryUsage = parseFloat(document.getElementById('machinery-usage').value);
  const transportDistance = parseFloat(document.getElementById('transport-distance').value);

  const requestData = {
      fuel_usage: fuelUsage,
      machinery_usage: machineryUsage,
      transport_distance: transportDistance
  };

  try {
      const response = await fetch('/submitEmissionData', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData)
      });

      const result = await response.json();
      if (result.success) {
          alert(result.message); // Show success message
      } else {
          alert('Failed to submit data.');
      }
  } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while submitting data.');
  }
});
