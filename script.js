// All functions for website functionality 
function handleCredentialResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);
    const userName = getUserNameFromIDToken(response.credential);
    document.getElementById('welcomeMessage').textContent = `Welcome, ${userName}!`;
    setTimeout(() => {
        document.getElementById('welcomeScreen').style.opacity = 0;
        setTimeout(() => {
            document.getElementById('welcomeScreen').style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';
            document.getElementById('mainContent').style.visibility = 'visible';
            document.getElementById('mainContent').style.opacity = 1;
        }, 1000); // Inner timeout for smooth transition
    }, 1500); // Outer timeout to delay the welcome message (3000ms = 3 seconds)
}

function getUserNameFromIDToken(idToken) {
    const base64Url = idToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const user = JSON.parse(jsonPayload);
    return user.name || user.email;
}

document.getElementById('scanButton').addEventListener('click', onScanButtonClick);
document.getElementById('discoverButton').addEventListener('click', () => {
    document.getElementById('settingsPage').style.display = 'flex';
});
document.getElementById('closeSettingsButton').addEventListener('click', () => {
    document.getElementById('settingsPage').style.display = 'none';
});

let selectedDevice = null;
let recentDevices = [];

document.addEventListener('DOMContentLoaded', () => {
    loadRecentDevices();
    populateRecentDevices();
    document.getElementById('optionalServices').addEventListener('input', connectToDevice);
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

function onScanButtonClick() {
    log('Searching Solar Panel...');
    navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['0000180a-0000-1000-8000-00805f9b34fb'] 
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
            queue = queue.then(() => service.getCharacteristics().then(characteristics => {
                log('> Service: ' + service.uuid);
                characteristics.forEach(characteristic => {
                    log('>> Characteristic: ' + characteristic.uuid + ' ' + getSupportedProperties(characteristic));
                    if (characteristic.uuid === 'specific-energy-usage-uuid') {
                        characteristic.readValue().then(value => {
                            let energy = value.getUint8(0);
                            energyUsage.textContent = 'Energy Usage: ' + energy + ' kW';
                        }).catch(error => {
                            log('Error reading energy usage: ' + error);
                        });
                    }
                    if (characteristic.uuid === 'specific-battery-status-uuid') {
                        characteristic.readValue().then(value => {
                            let battery = value.getUint8(0);
                            batteryStatus.textContent = 'Battery Status: ' + battery + ' %';
                        }).catch(error => {
                            log('Error reading battery status: ' + error);
                        });
                    }
                    if (characteristic.uuid === 'specific-panel-efficiency-uuid') {
                        characteristic.readValue().then(value => {
                            let efficiency = value.getUint8(0);
                            panelEfficiency.textContent = 'Panel Efficiency: ' + efficiency + ' %';
                        }).catch(error => {
                            log('Error reading panel efficiency: ' + error);
                        });
                    }
                    if (characteristic.uuid === 'specific-grid-status-uuid') {
                        characteristic.readValue().then(value => {
                            let grid = value.getUint8(0);
                            gridStatus.textContent = 'Grid Status: ' + grid;
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
        solarInfo.style.display = 'block';
    })
    .catch(error => {
        log('Error: ' + error);
    });
}

function onDisconnected() {
    log('Device disconnected');
    selectedDevice = null;
}

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

function loadRecentDevices() {
    const storedDevices = localStorage.getItem('recentDevices');
    if (storedDevices) {
        recentDevices = JSON.parse(storedDevices);
    }
}

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

function getSupportedProperties(characteristic) {
    let supportedProperties = [];
    for (const p in characteristic.properties) {
        if (characteristic.properties[p] === true) {
            supportedProperties.push(p.toUpperCase());
        }
    }
    return '[' + supportedProperties.join(', ') + ']';
}

function log(message) {
    console.log(message);
    let logElement = document.getElementById('log');
    let el = document.createElement('a');
    el.textContent = message;
    logElement.appendChild(el);
    logElement.appendChild(document.createElement('br'));
}

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

