// Return to this later, not implemented yet
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
    console.log('Client connected');
    
    // Simulate real-time data updates
    setInterval(() => {
        const data = {
            energyUsage: Math.random() * 100,
            batteryStatus: Math.random() * 100,
            panelEfficiency: Math.random() * 100,
            gridStatus: Math.random() * 100
        };
        ws.send(JSON.stringify(data));
    }, 5000); // Send data every 5 seconds

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});
