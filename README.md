# solarUp
Practice HTML web bluetooth connnect
This is a web app that uses bluetooth and has the ability to connect a solar panel and display some information.
To view this in browser, install Live Server extension on VScode, on the top left HTML file, right click and "Open with Live Server" or ALT L + ALT O


08/02/24
Issues trying to have stars show up only at night. When opacity of stars are changed to <0, stars will show up in the morning and at night. When set to 0, it never shows up at all, tried to find solutions for this, no avail :(.

Next Steps, adding chart reading features, and other solar features needed. Maybe add an auth or sign in page. Here is the list of what I could add: Real-time Monitoring:

**Display real-time data for energy usage**, battery status, panel efficiency, and grid status.
Use WebSockets or long-polling to update data without refreshing the page.
Historical Data and Graphs:

S**how historical data for energy production and consumption.**
Use charts and graphs to visualize the data over different periods (daily, weekly, monthly).
Alerts and Notifications:
****
**Send alerts for critical events like low battery, system faults, or maintenance reminders.*****
Allow users to configure notification preferences (email, SMS, push notifications).
Control and Management:

Provide controls to manage the solar panel system remotely, like toggling between grid and battery power, adjusting panel angles, etc.
**Energy Savings Calculations:**

Calculate and display potential energy savings and environmental benefits (e.g., CO2 reduction).
Weather Integration:

**Integrate weather data to predict solar energy production.**
Provide recommendations based on weather conditions.
Multi-User Support:

**Allow multiple users to monitor and control the system, with different access levels (admin, user).**
Mobile Responsiveness:

Ensure the app is mobile-friendly and responsive.
Consider creating a companion mobile app.
**Customization and Personalization:**

**Allow users to customize their dashboard with widgets and preferred data views.**
Provide themes and color schemes for a personalized experience.
**Battery Management:**

Show detailed battery status, including charge cycles, health, and temperature.
Provide recommendations for optimizing battery usage and lifespan.
Integration with Smart Home Devices:
**
****Integrate with other smart home devices **(e.g., thermostats, smart plugs) for optimized energy usage.****
Use IoT protocols like MQTT for seamless integration.
Energy Forecasting:

**Predict future energy production based on historical data and weather forecasts.**
Provide recommendations for optimal energy usage.
Support and Troubleshooting:

**Add a help section with FAQs, guides, and troubleshooting steps.**
Provide a support chat or ticketing system for user issues.
User Feedback and Community:

**Allow users to provide feedback and rate the app's features.**
Create a community forum for users to share tips, experiences, and ask questions.

These are just some ideas, I need to setup websocket for **Real time monitoring**
