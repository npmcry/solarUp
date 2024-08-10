// Declare the chart variables globally
let energyChart, batteryChart, efficiencyChart, gridChart;

// Function to handle Google Sign-In response
function handleCredentialResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);
    const userName = getUserNameFromIDToken(response.credential);
    document.getElementById('welcomeMessage').textContent = `Welcome, ${userName}!`;
    // Fade out welcome screen and show main content
    setTimeout(() => {
        document.getElementById('welcomeScreen').style.opacity = 0;
        setTimeout(() => {
            document.getElementById('welcomeScreen').style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';
            document.getElementById('mainContent').style.visibility = 'visible';
            document.getElementById('mainContent').style.opacity = 1;
        }, 1000); // Inner timeout for smooth transition
    }, 1500); // Outer timeout to delay the welcome message
}

// Function to decode the JWT token and extract the user name
function getUserNameFromIDToken(idToken) {
    const base64Url = idToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const user = JSON.parse(jsonPayload);
    return user.name || user.email;
}

// Function to update charts
function updateChart(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(data);
    chart.update();
}

// Event listeners for button clicks
document.getElementById('scanButton').addEventListener('click', onScanButtonClick);
document.getElementById('discoverButton').addEventListener('click', () => {
    document.getElementById('settingsPage').style.display = 'flex';
});
document.getElementById('closeSettingsButton').addEventListener('click', () => {
    document.getElementById('settingsPage').style.display = 'none';
});

// Variables to store selected device and recent devices
let selectedDevice = null;
let recentDevices = [];

// Initialization code that runs when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadRecentDevices();
    populateRecentDevices();
    document.getElementById('optionalServices').addEventListener('input', connectToDevice);
    const weatherInfo = document.getElementById('weatherInfo');

    // Fetch current weather information based on geolocation
    navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const apiKey = '7e7696703675ae60dcc16d2fa649db06';
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

        fetch(weatherUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.cod === 200) {
                    const weatherDescription = data.weather[0].description;
                    const temperature = data.main.temp;
                    weatherInfo.textContent = `Current weather: ${weatherDescription}, ${temperature}°F`;
                } else {
                    weatherInfo.textContent = 'Unable to fetch weather data';
                }
            })
            .catch(() => {
                weatherInfo.textContent = 'Unable to fetch weather data';
            });
    }, () => {
        weatherInfo.textContent = 'Unable to fetch location';
    });

    // Initialize charts
    const energyCtx = document.getElementById('energyChart').getContext('2d');
    const batteryCtx = document.getElementById('batteryChart').getContext('2d');
    const efficiencyCtx = document.getElementById('efficiencyChart').getContext('2d');
    const gridCtx = document.getElementById('gridChart').getContext('2d');
    
    energyChart = new Chart(energyCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Energy Usage (kW)',
                data: [],
                borderColor: 'rgba(255, 240, 0)', // Set line color to white
                backgroundColor: 'rgba(255, 255, 255, 0)', // Transparent background
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#fff' // Change y-axis labels to white
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.3)' // Light white grid lines
                    }
                },
                x: {
                    ticks: {
                        color: '#fff' // Change x-axis labels to white
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.3)' // Light white grid lines
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#fff' // Change legend text color to white
                    }
                }
            }
        }
    });

    batteryChart = new Chart(batteryCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Battery Status (%)',
                data: [],
                borderColor: 'rgba(3, 138, 255)',
                backgroundColor: 'rgba(255, 255, 255, 0)', // Transparent background
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#fff' // Change y-axis labels to white
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.3)' // Light white grid lines
                    }
                },
                x: {
                    ticks: {
                        color: '#fff' // Change x-axis labels to white
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.3)' // Light white grid lines
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#fff' // Change legend text color to white
                    }
                }
            }
        }
    });

    efficiencyChart = new Chart(efficiencyCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Panel Efficiency (%)',
                data: [],
                borderColor: 'rgba(46, 204, 113)', // Change the sqaure color
                backgroundColor: 'rgba(255, 255, 255, 0)', // Transparent background
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#fff' // Change y-axis labels to white
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.3)' // Light white grid lines
                    }
                },
                x: {
                    ticks: {
                        color: '#fff' // Change x-axis labels to white
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.3)' // Light white grid lines
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#fff' // Change legend text color to white
                    }
                }
            }
        }
    });

    gridChart = new Chart(gridCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Grid Status',
                data: [],
                borderColor: 'rgba(159, 90, 253)', 
                backgroundColor: 'rgba(255, 255, 255, 0)', // Transparent background
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#fff' // Change y-axis labels to white
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.3)' // Light white grid lines
                    }
                },
                x: {
                    ticks: {
                        color: '#fff' // Change x-axis labels to white
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.3)' // Light white grid lines
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#fff' // Change legend text color to white
                    }
                }
            }
        }
    });

    fetchDataAndDisplay();
});

// Function to scan for Bluetooth devices and connect
function onScanButtonClick() {
    log('Searching Solar Panel...');
    navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['0000180a-0000-1000-8000-00805f9b34fb'] // Example UUID, replace with your actual service UUID
    })
    .then(device => {
        log('Device selected: ' + device.name);
        selectedDevice = device;
        storeRecentDevice(device);
        selectedDevice.addEventListener('gattserverdisconnected', onDisconnected);
        log('Connecting to GATT Server...');
        return device.gatt.connect();
    })
    .then(server => {
        log('Getting Services...');
        return server.getPrimaryServices();
    })
    .then(services => {
        log('Getting Characteristics...');
        let queue = Promise.resolve();
        services.forEach(service => {
            log('Service UUID: ' + service.uuid); // Log service UUID
            queue = queue.then(() => service.getCharacteristics().then(characteristics => {
                characteristics.forEach(characteristic => {
                    log('Characteristic UUID: ' + characteristic.uuid + ' ' + getSupportedProperties(characteristic));
                    // Reading characteristic values based on UUIDs
                    if (characteristic.uuid === '00002a24-0000-1000-8000-00805f9b34fb') { // Replace with actual UUID
                        characteristic.readValue().then(value => {
                            let energy = value.getUint8(0);
                            document.getElementById('energyUsage').textContent = 'Energy Usage: ' + energy + ' kW';
                            updateChart(energyChart, new Date().toLocaleTimeString(), energy);
                        }).catch(error => {
                            log('Error reading energy usage: ' + error);
                        });
                    }
                    if (characteristic.uuid === '00002a26-0000-1000-8000-00805f9b34fb') { // Replace with actual UUID
                        characteristic.readValue().then(value => {
                            let battery = value.getUint8(0);
                            document.getElementById('batteryStatus').textContent = 'Battery Status: ' + battery + ' %';
                            updateChart(batteryChart, new Date().toLocaleTimeString(), battery);
                        }).catch(error => {
                            log('Error reading battery status: ' + error);
                        });
                    }
                    if (characteristic.uuid === '00002a27-0000-1000-8000-00805f9b34fb') { // Replace with actual UUID
                        characteristic.readValue().then(value => {
                            let efficiency = value.getUint8(0);
                            document.getElementById('panelEfficiency').textContent = 'Panel Efficiency: ' + efficiency + ' %';
                            updateChart(efficiencyChart, new Date().toLocaleTimeString(), efficiency);
                        }).catch(error => {
                            log('Error reading panel efficiency: ' + error);
                        });
                    }
                    if (characteristic.uuid === '00002a29-0000-1000-8000-00805f9b34fb') { // Replace with actual UUID
                        characteristic.readValue().then(value => {
                            let grid = value.getUint8(0);
                            document.getElementById('gridStatus').textContent = 'Grid Status: ' + grid;
                            updateChart(gridChart, new Date().toLocaleTimeString(), grid);
                        }).catch(error => {
                            log('Error reading grid status: ' + error);
                        });
                    }
                });
            }));
        });
        return queue;
    })
    .then(() => {
        document.getElementById('solarInfo').style.display = 'block';
    })
    .catch(error => {
        log('Error: ' + error);
    });
}

// Function to handle device disconnection
function onDisconnected() {
    log('Device disconnected');
    selectedDevice = null;
}

// Store recently connected devices in local storage
function storeRecentDevice(device) {
    const deviceInfo = {
        name: device.name,
        id: device.id,
        timestamp: new Date().getTime()
    };
    recentDevices = recentDevices.filter(d => d.id !== device.id);
    recentDevices.push(deviceInfo);
    localStorage.setItem('recentDevices', JSON.stringify(recentDevices));
}

// Load recently connected devices from local storage
function loadRecentDevices() {
    const storedDevices = localStorage.getItem('recentDevices');
    if (storedDevices) {
        recentDevices = JSON.parse(storedDevices);
    }
}

// Populate the device list with recent devices
function populateRecentDevices() {
    const dataList = document.getElementById('services');
    dataList.innerHTML = '';
    recentDevices.forEach(device => {
        const option = document.createElement('option');
        option.value = device.name;
        option.textContent = device.name;
        dataList.appendChild(option);
    });
}

// Connect to a device based on user input
function connectToDevice(event) {
    const deviceName = event.target.value;
    const device = recentDevices.find(d => d.name === deviceName);
    if (device) {
        navigator.bluetooth.requestDevice({
            filters: [{ name: device.name }]
        })
        .then(device => {
            log('Connecting to device: ' + device.name);
            return device.gatt.connect();
        })
        .then(server => {
            log('Connected to device: ' + deviceName);
        })
        .catch(error => {
            log('Error connecting to device: ' + error);
        });
    }
}

// Get the supported properties of a characteristic
function getSupportedProperties(characteristic) {
    let supportedProperties = [];
    for (const p in characteristic.properties) {
        if (characteristic.properties[p] === true) {
            supportedProperties.push(p.toUpperCase());
        }
    }
    return '[' + supportedProperties.join(', ') + ']';
}

// Function to log messages to the console and UI
function log(message) {
    console.log(message);
    let logElement = document.getElementById('log');
    let el = document.createElement('a');
    el.textContent = message;
    logElement.appendChild(el);
    logElement.appendChild(document.createElement('br'));
}

// Change background based on the time of day
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    setInterval(() => {
        const currentBackground = getComputedStyle(body).backgroundImage;
        if (currentBackground.includes('2B3A67')) {
            body.classList.add('night');
        } else {
            body.classList.remove('night');
        }
    }, 10000);
});

// Fetch and display weather information when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const weatherInfo = document.getElementById('weatherInfo');

    navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const apiKey = '7e7696703675ae60dcc16d2fa649db06';
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

        fetch(weatherUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.cod === 200) {
                    const weatherDescription = data.weather[0].description;
                    const temperature = data.main.temp;
                    weatherInfo.textContent = `Current weather: ${weatherDescription}, ${temperature}°F`;
                } else {
                    weatherInfo.textContent = 'Unable to fetch weather data';
                }
            })
            .catch(() => {
                weatherInfo.textContent = 'Unable to fetch weather data';
            });
    }, () => {
        weatherInfo.textContent = 'Unable to fetch location';
    });

    // Apply styles to the Google Sign-In button after it loads
    setTimeout(() => {
        const googleSignInButton = document.querySelector('.g_id_signin iframe');
        if (googleSignInButton) {
            googleSignInButton.style.borderRadius = '10px';
            googleSignInButton.style.overflow = 'hidden';
        }
    }, 500);
});

// Function to fetch and display historical data
function fetchDataAndDisplay() {
    db.collection('solarData')
      .orderBy('timestamp', 'desc')
      .limit(100) // Fetch the latest 100 records
      .get()
      .then(querySnapshot => {
          let labels = [];
          let energyData = [];
          let batteryData = [];
          let efficiencyData = [];
          let gridData = [];
          
          querySnapshot.forEach(doc => {
              let data = doc.data();
              labels.push(new Date(data.timestamp.seconds * 1000).toLocaleString()); // Convert timestamp to readable format
              energyData.push(data.energyUsage);
              batteryData.push(data.batteryStatus);
              efficiencyData.push(data.panelEfficiency);
              gridData.push(data.gridStatus);
          });

          energyChart.data.labels = labels;
          energyChart.data.datasets[0].data = energyData;
          energyChart.update();

          batteryChart.data.labels = labels;
          batteryChart.data.datasets[0].data = batteryData;
          batteryChart.update();

          efficiencyChart.data.labels = labels;
          efficiencyChart.data.datasets[0].data = efficiencyData;
          efficiencyChart.update();

          gridChart.data.labels = labels;
          gridChart.data.datasets[0].data = gridData;
          gridChart.update();
      });
}

