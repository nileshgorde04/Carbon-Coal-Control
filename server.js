// server.js
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const json2csv = require('json2csv').parse;

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from "assets" and "src" folders
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/src', express.static(path.join(__dirname, 'src')));
app.use('/views', express.static(path.join(__dirname, 'views')));

// Serve the HTML file from "views"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'LoginPage.html'));
});

// Set up MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database!');
});


app.get("/login", (req, res)=>{
    res.sendFile(__dirname + "/views/LoginPage.html")
})

// Route for login authentication
app.post('/login', (req, res) => {
    const { username, password, role } = req.body;
    const encoded = encodeURIComponent(password)
    const encrypted = Buffer.from(encoded).toString("base64")


    const query = 'SELECT * FROM users WHERE username = ? AND password = ? AND role = ?';
    
    db.query(query, [username, encrypted, role], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.send({ message: 'Login successful', role });
        } else {
            res.send({ message: 'Invalid credentials' });
        }
    });
});

// Route for signup
app.post('/signup', (req, res) => {
    const { username, email, password , role } = req.body;
    const encoded = encodeURIComponent(password)
    const encrypted = Buffer.from(encoded).toString("base64")
    const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
    
    db.query(query, [username, email, encrypted, role], (err, results) => {
        if (err) throw err;
        res.send({ message: 'Bhosadike' });
    });
});

// Endpoint to submit emission data
app.post('/submitEmissionData', async (req, res) => {
    const { fuel_usage, machinery_usage, transport_distance } = req.body;

    // Emission calculation factors
    const emissionFactorFuel = 2.68; // kg CO2 per litre of fuel
    const emissionFactorMachinery = 1.5; // kg CO2 per machinery hour
    const emissionFactorTransport = 0.3; // kg CO2 per kilometer traveled

    // Calculate total emissions
    const totalEmissions = (fuel_usage * emissionFactorFuel) +
                           (machinery_usage * emissionFactorMachinery) +
                           (transport_distance * emissionFactorTransport);

    try {

        // Insert data into database
        const sql = `
            INSERT INTO emission_data (fuel_usage, machinery_usage, transport_distance, total_emissions)
            VALUES (?, ?, ?, ?)
        `;
        await db.execute(sql, [fuel_usage, machinery_usage, transport_distance, totalEmissions]);

        res.status(200).json({ success: true, message: 'Emission data submitted successfully.' });
    } catch (error) {
        console.error('Error submitting emission data:', error);
        res.status(500).json({ success: false, message: 'Error submitting emission data.' });
    }
});


// POST endpoint to handle the form submission
app.post('/submit-pathways', (req, res) => {
    const {
        userType, primaryActivity, energy, landAvailable, landSize, transport, invest, renewable
    } = req.body;

    // Save data to the database
    const query = `
        INSERT INTO pathways_data (user_type, primary_activity, energy_consumption, land_available, land_size, transportation_mode, invest_in_co2_capture, renewable_energy)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [
        userType, 
        primaryActivity, 
        energy, 
        landAvailable, 
        landSize || null, 
        transport, 
        invest, 
        renewable
    ], (err, results) => {
        if (err) {
            console.error('Error saving data to database:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        } 

        // Generate recommended pathways based on the form data
        let recommendedPathways = [];

        // CCS Recommendation (Industry + High Emissions)
        if (userType === 'business' && energy > 5000 && invest === 'yes') {
            recommendedPathways.push('CO2 Compression and Sequestration (CCS)');
        } 

        // DAC Recommendation (High Carbon Footprint + Willing to Invest)
        if (energy > 2000 && invest === 'yes') {
            recommendedPathways.push('Direct Air Capture (DAC)');
        } 

        // BECCS Recommendation (Biomass Available + Energy Needs)
        if (primaryActivity === 'farming' && energy > 1000 && invest === 'yes') {
            recommendedPathways.push('Bioenergy with Carbon Capture and Storage (BECCS)');
        } 

        // Forestation/ Reforestation Recommendation (Land Available)
        if (landAvailable === 'yes' && landSize > 1) {
            recommendedPathways.push('Forestation and Reforestation');
        } 

        // More pathways based on conditions
        if (renewable === 'yes' && energy > 1000) {
            recommendedPathways.push('Switch to 100% Renewable Energy');
        } 

        if (recommendedPathways.length === 0) {
            recommendedPathways.push('No specific pathways recommended based on your input.');
        } 

        // Update the recommended pathways in the database 
        const updateQuery = ` 
            UPDATE pathways_data
            SET recommended_pathways = ?
            WHERE pathway_id = ?`; 

        db.query(updateQuery, [recommendedPathways.join(', '), results.insertId], (err) => {
            if (err) {
                console.error('Error updating pathways in database:', err);
                return res.status(500).json({ success: false, message: 'Error saving recommended pathways' });
            }

            // Respond with the pathways
            res.json({ success: true, recommendedPathways });
        });
    });
}); 


// Endpoint to receive Energy Consumption data
app.post('/submit-energy-consumption', (req, res) => {
    const { energyType, energyUsed, timePeriod, emissionFactor, totalEmission } = req.body;
    const query = `INSERT INTO energy_consumption (energy_type, energy_used, time_period, emission_factor, Total_emission)
                   VALUES (?, ?, ?, ?, ?)`;
    
    db.execute(query, [energyType, energyUsed, timePeriod, emissionFactor, totalEmission], (err, result) => {
        if (err) {
            console.error("Error inserting energy consumption data:", err);
            //res.status(500).json({ message: 'Failed to submit energy consumption data.' });
            return res.status(500).json({ success: false, message: 'Failed to store data' });
        } else {
            //res.json({ message: 'Energy consumption data submitted successfully.' });
            res.status(200).json({ success: true, message: 'Data successfully stored in database' });
        }
    });
});

// Endpoint to receive Carbon Sink Management data
app.post('/submit-carbon-sink-management', (req, res) => {
    const { sinkType, areaSize, co2AbsorptionRate, location, lastHealthCheck, healthStatus } = req.body;
    const query = `INSERT INTO carbon_sink_management (sink_type, area_size, co2_absorption_rate, location, last_health_check, health_status)
                   VALUES (?, ?, ?, ?, ?, ?)`;
    
    db.execute(query, [sinkType, areaSize, co2AbsorptionRate, location, lastHealthCheck, healthStatus], (err, result) => {
        if (err) {
            console.error("Error inserting carbon sink data:", err);
            //res.status(500).json({ message: 'Failed to submit carbon sink data.' });
            return res.status(500).json({ success: false, message: 'Failed to store data' });
        } else {
            //res.json({ message: 'Carbon sink data submitted successfully.' });
            res.status(200).json({ success: true, message: 'Data successfully stored in database' });
        }
    });
});

// Endpoint to receive Forest Management data
app.post('/submit-forest-management', (req, res) => {
    const { forestType, treeDensity, growthRate, lastHealthCheck, healthStatus } = req.body;
    const query = `INSERT INTO forest_management (forest_type, tree_density, growth_rate, last_health_check, health_status)
                   VALUES (?, ?, ?, ?, ?)`;
    
    db.execute(query, [forestType, treeDensity, growthRate, lastHealthCheck, healthStatus], (err, result) => {
        if (err) {
            console.error("Error inserting forest management data:", err);
            //res.status(500).json({ message: 'Failed to submit forest management data.' });
            return res.status(500).json({ success: false, message: 'Failed to store data' });
        } else {
            //res.json({ message: 'Forest management data submitted successfully.' });
            res.status(200).json({ success: true, message: 'Data successfully stored in database' });
        }
    });
});

app.get('/get-emission-data', (req, res) => {
    const sqlQuery = 'SELECT submission_date, total_emissions FROM emission_data';
    
    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error fetching data');
            return;
        }

        // Send the data as JSON to the frontend
        res.json(results);
    });
});

// Endpoint to generate CSV report
app.get('/generate-report', (req, res) => {
    // Fetch data from all tables
    db.query('SELECT * FROM carbon_sink_management', (err, carbonSinkData) => {
        if (err) {
            return res.status(500).send('Error fetching carbon_sink_management data');
        }

        db.query('SELECT * FROM emission_data', (err, emissionData) => {
            if (err) {
                return res.status(500).send('Error fetching emission_data');
            }

            db.query('SELECT * FROM energy_consumption', (err, energyData) => {
                if (err) {
                    return res.status(500).send('Error fetching energy_consumption data');
                }

                db.query('SELECT * FROM forest_management', (err, forestData) => {
                    if (err) {
                        return res.status(500).send('Error fetching forest_management data');
                    }

                    db.query('SELECT * FROM pathways_data', (err, pathwaysData) => {
                        if (err) {
                            return res.status(500).send('Error fetching pathways_data');
                        }

                        db.query('SELECT * FROM users', (err, usersData) => {
                            if (err) {
                                return res.status(500).send('Error fetching users data');
                            }

                            // Combine all data into a single object
                            const allData = {
                                "Carbon Sink Management": carbonSinkData,
                                "Emission Data": emissionData,
                                "Energy Consumption": energyData,
                                "Forest Management": forestData,
                                "Pathways Data": pathwaysData,
                                "Users": usersData
                            };

                            // Convert the data to CSV format
                            const csvData = [];
                            for (const table in allData) {
                                const tableData = allData[table];
                                tableData.forEach(row => {
                                    const rowObj = { Table: table, ...row };
                                    csvData.push(rowObj);
                                });
                            }

                            const csv = json2csv(csvData);
                            res.header('Content-Type', 'text/csv');
                            res.attachment('report.csv');
                            res.send(csv);
                        });
                    });
                });
            });
        });
    });
});

// Endpoint to fetch all data and send it to the front-end for displaying
app.get('/view-data', (req, res) => {
    // Fetch data from all tables (as previously explained)
    db.query('SELECT * FROM carbon_sink_management', (err, carbonSinkData) => {
        if (err) {
            return res.status(500).send('Error fetching carbon_sink_management data');
        }

        db.query('SELECT * FROM emission_data', (err, emissionData) => {
            if (err) {
                return res.status(500).send('Error fetching emission_data');
            }

            db.query('SELECT * FROM energy_consumption', (err, energyData) => {
                if (err) {
                    return res.status(500).send('Error fetching energy_consumption data');
                }

                db.query('SELECT * FROM forest_management', (err, forestData) => {
                    if (err) {
                        return res.status(500).send('Error fetching forest_management data');
                    }

                    db.query('SELECT * FROM pathways_data', (err, pathwaysData) => {
                        if (err) {
                            return res.status(500).send('Error fetching pathways_data');
                        }

                        db.query('SELECT * FROM users', (err, usersData) => {
                            if (err) {
                                return res.status(500).send('Error fetching users data');
                            }

                            // Combine all data into a single object
                            const allData = {
                                "Carbon Sink Management": carbonSinkData,
                                "Emission Data": emissionData,
                                "Energy Consumption": energyData,
                                "Forest Management": forestData,
                                "Pathways Data": pathwaysData,
                                "Users": usersData
                            };

                            // Send all data as JSON to the frontend
                            res.json(allData);
                        });
                    });
                });
            });
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
