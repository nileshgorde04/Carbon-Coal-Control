document.addEventListener("DOMContentLoaded", function() {

    // Generate Comparison Chart
    const generateComparisonButton = document.querySelector("button");
    const comparisonCtx = document.getElementById("comparisonChart").getContext("2d");

    generateComparisonButton.addEventListener("click", function() {
        // Fetch emission data from the server
        fetch("/get-emission-data") // Your backend endpoint to fetch emission data
            .then(response => response.json())
            .then(data => {
                // Extract the data for the chart
                const dates = data.map(item => item.submission_date); // Assuming "submission_date" is available
                const emissions = data.map(item => item.total_emissions); // Assuming "total_emissions" is the field to chart

                // Create the comparison chart dynamically
                new Chart(comparisonCtx, {
                    type: "bar", // You can change the chart type if needed
                    data: {
                        labels: dates, // Use submission_date as labels
                        datasets: [{
                            label: "Current Emissions (tons)",
                            data: emissions, // Data for total emissions
                            backgroundColor: "rgba(153, 102, 255, 0.2)", // Bar color
                            borderColor: "rgba(153, 102, 255, 1)", // Border color
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { position: 'top' }
                        },
                        scales: {
                            y: { beginAtZero: true }
                        }
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching emission data:', error);
                alert("Failed to load data for chart.");
            });
    });
});

// Falling Coal Animation - Adds randomized position and delay for animation effect
const coalElements = document.querySelectorAll('.coal');
coalElements.forEach((coal, index) => {
    const randomPosition = Math.random() * 100;
    const randomDelay = Math.random() * 5;
    coal.style.left = `${randomPosition}%`;
    coal.style.animationDelay = `${randomDelay}s`;
});
