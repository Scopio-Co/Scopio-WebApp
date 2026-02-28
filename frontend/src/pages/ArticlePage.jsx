import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ArticlePage.css';
import article1 from '../assets/img/articles/article 1.1.png';
import article2 from '../assets/img/articles/article 2.1.png';
import article3 from '../assets/img/articles/article 3.1.png';
import article4 from '../assets/img/articles/article 4.1.png';
import article5 from '../assets/img/articles/article 5.1.png';
import article6 from '../assets/img/articles/article 6.1.png';
import article12 from '../assets/img/articles/article 1.2.webp';
const ArticlePage = () => {
  const navigate = useNavigate();
  const articles = [
    {
      id: 1,
      title: "Sensors and Actuators – The Eyes and Hands of IoT",
      image: article1,
      
      content: `
        
        <h2>Sensors and Actuators – The Eyes and Hands of IoT</h2>
        <p>At the heart of every Internet of Things (IoT) system lies a simple idea: machines must sense the world and act on it. This is exactly where sensors and actuators come into play. Sensors allow devices to observe their environment, while actuators enable them to respond or take action. Without these two components, IoT would simply be a network of silent devices with nothing meaningful to do.</p>

        <p>Whether it’s a smart home adjusting room temperature, a wearable tracking heart rate, or a smart farm monitoring soil moisture, sensors and actuators form the foundation of real-world IoT applications. This article explores what sensors and actuators are, how they work, their types, and why they are critical in modern IoT systems.</p>

        <h3>What Are Sensors?</h3>
        <p>A sensor is a device that detects changes in physical conditions and converts them into electrical signals that can be read by a microcontroller or processor. In simple terms, sensors act as the eyes, ears, and skin of an IoT system.</p>

        <p>Sensors measure real-world parameters such as:</p>
        <ul>
          <li>Temperature</li>
          <li>Humidity</li>
          <li>Light intensity</li>
          <li>Motion</li>
          <li>Pressure</li>
          <li>Gas concentration</li>
          <li>Heart rate</li>
        </ul>

        <h3>How Sensors Work in IoT</h3>
        <p>Sensors operate using physical principles such as resistance change, capacitance change, piezoelectric effect, or optical detection. For example:</p>
        <ul>
          <li>A temperature sensor changes its resistance with heat</li>
          <li>A light sensor (LDR) changes resistance based on light intensity</li>
          <li>A gas sensor reacts chemically with gases and alters electrical output</li>
        </ul>

        <p>In IoT, sensors are typically connected to microcontrollers like Arduino or ESP32, which read the sensor values using analog or digital pins.</p>

        <h3>Types of Sensors Used in IoT</h3>
        <ol>
          <li><strong>Environmental Sensors</strong>: Temperature sensors (DHT11, DHT22), humidity, air quality, barometric pressure. Use cases: smart homes, weather stations, agriculture.</li>
          <li><strong>Motion and Position Sensors</strong>: PIR, accelerometers, gyroscopes, GPS. Use cases: fitness trackers, security systems, vehicle tracking.</li>
          <li><strong>Proximity and Distance Sensors</strong>: Ultrasonic, infrared, LiDAR. Use cases: obstacle detection, parking systems, robotics.</li>
          <li><strong>Biometric Sensors</strong>: Heart rate, pulse oximeters, temperature patches. Use cases: remote health monitoring, wearables.</li>
        </ol>
        <figure class="article-figure">
          <img src="${article12}" alt="Types of IoT sensors" />
          <figcaption>Types of IoT sensors</figcaption>
        </figure>
        <h3>What Are Actuators?</h3>
        <p>While sensors collect information, actuators perform actions based on decisions made by the system. An actuator converts electrical signals into physical movement or control — think of actuators as the hands and muscles of an IoT system.</p>

        <p>Examples of actuator actions include turning a motor, opening a valve, switching a relay, moving a robotic arm, or dimming a light.</p>

        <h3>Types of Actuators in IoT</h3>
        <ol>
          <li><strong>Electrical Actuators</strong>: Relays and switches that control electrical devices. Use cases: smart switches, home automation.</li>
          <li><strong>Mechanical Actuators</strong>: DC motors, servos, stepper motors. Use cases: robotics and automation systems.</li>
          <li><strong>Hydraulic and Pneumatic Actuators</strong>: Pneumatic cylinders, hydraulic pistons. Use cases: industrial IoT in factories and manufacturing.</li>
        </ol>

        <h3>Sensors + Actuators: Working Together</h3>
        <p>A complete IoT loop looks like this: sensor detects a change → microcontroller processes data → decision is made → actuator is triggered → system returns to monitoring. This closed-loop system is what makes IoT intelligent rather than just connected.</p>

        <h3>Real-World Example: Smart Irrigation System</h3>
        <p>Soil moisture sensor checks soil condition → Data is sent to the controller → If moisture is low, a water pump actuator turns ON → Once moisture reaches required level, the pump turns OFF. This saves water, energy, and manual effort.</p>

        <h3>Key Challenges</h3>
        <ul>
          <li>Accuracy and calibration issues</li>
          <li>Power consumption</li>
          <li>Environmental wear and tear</li>
          <li>Noise and signal interference</li>
          <li>Cost vs performance trade-offs</li>
        </ul>

        <h3>Why They Matter</h3>
        <p>Sensors and actuators connect the digital world with the physical world, enable automation and intelligence, and directly impact reliability and accuracy. Poor sensor data leads to poor decisions.</p>

        <h3>Conclusion</h3>
        <p>Sensors and actuators are the foundation stones of any IoT system. Sensors gather truth from the physical world, while actuators turn digital decisions into real actions. Understanding how they work, their types, and how to choose them correctly is essential for anyone entering the IoT domain.</p>
      `
    },
    {
      id: 2,
      title: "Microcontrollers and Embedded Systems – The Brain of IoT",
      image: article2,
      
      content: `
        <h2>Microcontrollers and Embedded Systems – The Brain of IoT</h2>

<p>If sensors are the eyes of IoT and actuators are the hands, then microcontrollers are the brain. Every intelligent decision in an IoT system—when to send data, when to trigger an action, and how to respond to environmental changes—happens inside a microcontroller or embedded system.</p>

<p>Microcontrollers form the core processing unit that connects sensors, communication modules, actuators, and software logic into a single functioning device. Without them, IoT devices would not be able to interpret data or act intelligently. This article explores what microcontrollers and embedded systems are, how they work in IoT, popular platforms, and how to choose the right one for your application.</p>

<h3>What Is a Microcontroller?</h3>

<p>A microcontroller (MCU) is a compact integrated circuit designed to perform a specific task. Unlike general-purpose computers, microcontrollers are optimized for:</p>

<ul>
  <li>Low power consumption</li>
  <li>Real-time operation</li>
  <li>Continuous functioning</li>
  <li>Dedicated control tasks</li>
</ul>

<p>A typical microcontroller includes:</p>

<ul>
  <li>CPU (Processor)</li>
  <li>Memory (RAM + Flash)</li>
  <li>Input/Output pins</li>
  <li>Timers and peripherals</li>
  <li>Communication interfaces (UART, I2C, SPI)</li>
</ul>

<p>In IoT systems, the microcontroller acts as the decision-making unit that processes sensor data and controls actuators or communication modules.</p>

<h3>What Is an Embedded System?</h3>

<p>An embedded system is a combination of:</p>

<ul>
  <li>Hardware (microcontroller + peripherals)</li>
  <li>Firmware (embedded software)</li>
  <li>Specific functionality</li>
</ul>

<p>Every IoT device is essentially an embedded system designed to perform one job extremely well—whether it’s measuring temperature, tracking location, or controlling lighting.</p>

<p>Unlike laptops or smartphones, embedded systems:</p>

<ul>
  <li>Run continuously</li>
  <li>Perform limited but critical tasks</li>
  <li>Rarely have a screen or keyboard</li>
  <li>Are optimized for efficiency and reliability</li>
</ul>

<h3>Role of Microcontrollers in IoT</h3>

<p>Microcontrollers act as the central hub in an IoT architecture. Their responsibilities include:</p>

<ul>
  <li>Reading data from sensors</li>
  <li>Filtering and preprocessing data</li>
  <li>Making decisions based on programmed logic</li>
  <li>Communicating with cloud servers or gateways</li>
  <li>Controlling actuators</li>
  <li>Managing power efficiently</li>
</ul>

<p>In simple terms, every “smart” behavior in an IoT system starts inside the microcontroller.</p>

<h3>Core Components Inside a Microcontroller</h3>

<ol>
  <li><strong>Processor Core</strong>: Executes program instructions. Speed is measured in MHz, but in IoT, efficiency and low power consumption are often more important than raw speed.</li>
  
  <li><strong>Memory</strong>: Flash memory stores the program code, while RAM stores variables and runtime data. IoT devices typically operate with limited memory, requiring optimized programming.</li>
  
  <li><strong>GPIO (General Purpose Input Output)</strong>: Pins used to connect sensors, LEDs, relays, buttons, and other external components.</li>
  
  <li><strong>Communication Interfaces</strong>: 
    <ul>
      <li>UART – Serial communication</li>
      <li>I2C – Short-distance, multi-device communication</li>
      <li>SPI – High-speed communication</li>
    </ul>
    These interfaces allow the microcontroller to communicate with sensors, displays, and other integrated circuits.
  </li>
</ol>

<h3>Popular Microcontrollers Used in IoT</h3>

<ol>
  <li><strong>Arduino-Based Controllers</strong>: Beginner-friendly, massive community support, and simple programming model. Best for learning, prototyping, and small-scale projects.</li>
  
  <li><strong>ESP8266 and ESP32</strong>: Built-in Wi-Fi (ESP32 also includes Bluetooth), powerful yet affordable. Widely used in real-world IoT devices. Ideal for smart home and connected device applications.</li>
  
  <li><strong>STM32 Microcontrollers</strong>: Industrial-grade performance, low power consumption, and advanced peripherals. Suitable for industrial IoT and commercial products.</li>
  
  <li><strong>Raspberry Pi (Special Case)</strong>: Although technically a microprocessor-based system, it is often used in IoT gateways and edge devices. Best suited for edge computing and advanced prototyping.</li>
</ol>

<h3>Firmware: The Software That Runs IoT Devices</h3>

<p>Microcontrollers run firmware, which is low-level software written in:</p>

<ul>
  <li>C / C++</li>
  <li>MicroPython</li>
  <li>Arduino framework</li>
</ul>

<p>Firmware is responsible for:</p>

<ul>
  <li>Sensor reading logic</li>
  <li>Communication protocols</li>
  <li>Timing and scheduling</li>
  <li>Power-saving modes</li>
</ul>

<p>Well-designed firmware is critical. Poor firmware can drain batteries, crash devices, or cause data loss.</p>

<h3>Real-Time Operation in IoT</h3>

<p>Many IoT applications require real-time responses, such as:</p>

<ul>
  <li>Turning off a motor instantly</li>
  <li>Triggering alarms</li>
  <li>Monitoring health parameters continuously</li>
</ul>

<p>Microcontrollers are ideal for real-time systems because:</p>

<ul>
  <li>They execute instructions deterministically</li>
  <li>Interrupt mechanisms allow immediate response</li>
  <li>They do not run heavy background processes</li>
</ul>

<p>This makes them more reliable than general-purpose computers for control-based applications.</p>

<h3>Power Management and Low-Power Design</h3>

<p>IoT devices often operate on batteries for months or even years. Microcontrollers support:</p>

<ul>
  <li>Sleep modes</li>
  <li>Deep sleep modes</li>
  <li>Low-power peripherals</li>
</ul>

<p>A typical low-power cycle works as follows:</p>

<p>Device wakes up → Reads sensor → Processes data → Sends data → Returns to sleep.</p>

<p>This efficient power cycle enables IoT systems to function reliably in remote or hard-to-access environments.</p>

<h3>Embedded Systems vs Cloud Intelligence</h3>

<p>Microcontrollers handle local intelligence, while cloud systems handle:</p>

<ul>
  <li>Large-scale data processing</li>
  <li>Analytics and dashboards</li>
  <li>Machine learning models</li>
</ul>

<p>However, device-level decision-making is essential to:</p>

<ul>
  <li>Reduce latency</li>
  <li>Save bandwidth</li>
  <li>Increase reliability</li>
</ul>

<p>The balance between local processing (edge computing) and cloud intelligence defines modern IoT architecture.</p>

<h3>Choosing the Right Microcontroller for IoT</h3>

<p>Key factors to consider include:</p>

<ul>
  <li>Power consumption</li>
  <li>Processing speed</li>
  <li>Memory capacity</li>
  <li>Connectivity requirements</li>
  <li>Cost constraints</li>
  <li>Community and ecosystem support</li>
</ul>

<p>There is no universally “best” microcontroller—only the one that best fits your specific use case.</p>

<h3>Real-World Example: Smart Energy Meter</h3>

<p>Voltage and current sensors measure electrical parameters → Microcontroller calculates power usage → Data is stored locally → Periodically transmitted to the cloud → Alerts are triggered if abnormal usage is detected.</p>

<p>All intelligence at the device level is powered by the microcontroller.</p>

<h3>Challenges in Embedded IoT Systems</h3>

<ul>
  <li>Limited memory and processing power</li>
  <li>Debugging difficulties</li>
  <li>Security vulnerabilities</li>
  <li>Firmware updates over the air (OTA)</li>
  <li>Hardware-software integration complexity</li>
</ul>

<p>Mastering embedded systems requires a strong understanding of both hardware and software principles.</p>

<h3>Conclusion</h3>

<p>Microcontrollers and embedded systems form the backbone of IoT intelligence. They connect sensors, execute logic, manage power, and enable communication. A strong understanding of embedded systems transforms IoT from simple connectivity into meaningful automation.</p>

<p>As IoT continues to scale, the importance of efficient, secure, and intelligent microcontroller design becomes increasingly critical.</p>

      `
    },
    {
      id: 3,
      title: "Connectivity and Communication Protocols – The Nervous System of IoT",
      image: article3,
      
      content: `
        <h2>Connectivity and Communication Protocols – The Nervous System of IoT</h2>

<p>An IoT device that cannot communicate is just an isolated embedded system. What truly transforms embedded devices into the Internet of Things is connectivity. Communication technologies and protocols allow IoT devices to exchange data with other devices, gateways, and cloud platforms.</p>

<p>Just like the human nervous system carries signals between the brain and the body, connectivity acts as the nervous system of IoT, enabling sensing, decision-making, and action across distributed systems.</p>

<p>In this article, we explore IoT connectivity options, communication protocols, how they work, and how to choose the right one for your application.</p>

<h3>What Is Connectivity in IoT?</h3>

<p>Connectivity refers to the method by which IoT devices transmit data from one point to another. This could be:</p>

<ul>
  <li>Device to device</li>
  <li>Device to gateway</li>
  <li>Device to cloud</li>
</ul>

<p>Connectivity includes both:</p>

<ul>
  <li>Physical communication technologies (Wi-Fi, Bluetooth, cellular, LoRa, etc.)</li>
  <li>Communication protocols (MQTT, HTTP, CoAP, etc.)</li>
</ul>

<p>Both layers are essential for building a reliable IoT system.</p>

<h3>Why Connectivity Is Critical in IoT</h3>

<p>Connectivity enables:</p>

<ul>
  <li>Real-time data transfer</li>
  <li>Remote monitoring and control</li>
  <li>Automation and alerts</li>
  <li>Cloud analytics and AI processing</li>
  <li>Scalability across thousands or millions of devices</li>
</ul>

<p>Without efficient communication, IoT systems become slow, unreliable, insecure, or too expensive to operate.</p>

<h3>IoT Communication Architecture</h3>

<p>A typical IoT communication flow looks like this:</p>

<p>Sensors generate data → Microcontroller processes it → Data is transmitted using a connectivity technology → Protocol defines how data is structured and delivered → Cloud or application consumes the data.</p>

<p>This layered approach separates hardware, networking, and application logic, allowing flexibility and scalability.</p>

<h3>Connectivity Technologies in IoT</h3>

<ol>
  <li><strong>Wi-Fi</strong><br>
  Wi-Fi is one of the most commonly used connectivity options in IoT.<br><br>
  <strong>Advantages:</strong>
  <ul>
    <li>High data rates</li>
    <li>Easy internet access</li>
    <li>Existing infrastructure in homes and offices</li>
  </ul>
  <strong>Limitations:</strong>
  <ul>
    <li>High power consumption</li>
    <li>Limited range</li>
  </ul>
  <strong>Use cases:</strong> Smart homes, offices, campuses.
  </li>

  <br>

  <li><strong>Bluetooth and Bluetooth Low Energy (BLE)</strong><br>
  BLE is designed specifically for low-power IoT devices.<br><br>
  <strong>Advantages:</strong>
  <ul>
    <li>Low energy consumption</li>
    <li>Ideal for short-range communication</li>
    <li>Widely supported by smartphones</li>
  </ul>
  <strong>Limitations:</strong>
  <ul>
    <li>Short range</li>
    <li>Lower data rates compared to Wi-Fi</li>
  </ul>
  <strong>Use cases:</strong> Wearables, fitness trackers, smart locks.
  </li>

  <br>

  <li><strong>Cellular (2G/4G/5G, NB-IoT, LTE-M)</strong><br>
  Cellular connectivity allows IoT devices to connect directly to the internet.<br><br>
  <strong>Advantages:</strong>
  <ul>
    <li>Wide geographic coverage</li>
    <li>High reliability</li>
    <li>No local infrastructure required</li>
  </ul>
  <strong>Limitations:</strong>
  <ul>
    <li>Higher operational cost</li>
    <li>Higher power consumption</li>
  </ul>
  <strong>Use cases:</strong> Vehicle tracking, smart meters, logistics, asset monitoring.
  </li>

  <br>

  <li><strong>LPWAN (LoRa, Sigfox)</strong><br>
  Low Power Wide Area Networks are designed for long-range, low-data-rate IoT communication.<br><br>
  <strong>Advantages:</strong>
  <ul>
    <li>Very long range</li>
    <li>Ultra-low power consumption</li>
    <li>Ideal for remote or rural areas</li>
  </ul>
  <strong>Limitations:</strong>
  <ul>
    <li>Very low data rate</li>
    <li>Not suitable for high-bandwidth or real-time streaming</li>
  </ul>
  <strong>Use cases:</strong> Agriculture, smart cities, environmental monitoring.
  </li>

  <br>

  <li><strong>Wired Connectivity (Ethernet, RS485)</strong><br>
  Wired communication remains highly relevant in industrial environments.<br><br>
  <strong>Advantages:</strong>
  <ul>
    <li>High reliability</li>
    <li>Low latency</li>
    <li>No battery dependency</li>
  </ul>
  <strong>Use cases:</strong> Industrial IoT, factories, power plants.
  </li>
</ol>

<h3>What Are IoT Communication Protocols?</h3>

<p>While connectivity technologies move data physically, protocols define how data is exchanged. They specify:</p>

<ul>
  <li>Message format</li>
  <li>Data delivery rules</li>
  <li>Error handling mechanisms</li>
  <li>Security features</li>
</ul>

<p>Protocols ensure that devices, gateways, and cloud servers understand each other correctly.</p>

<h3>Common IoT Communication Protocols</h3>

<ol>
  <li><strong>MQTT (Message Queuing Telemetry Transport)</strong><br>
  One of the most popular IoT protocols.<br><br>
  <strong>Key features:</strong>
  <ul>
    <li>Lightweight and efficient</li>
    <li>Publish–subscribe communication model</li>
    <li>Low bandwidth usage</li>
  </ul>
  <strong>Best for:</strong> Sensor data transmission, real-time updates, unreliable networks.
  </li>

  <br>

  <li><strong>HTTP / HTTPS</strong><br>
  Widely used in traditional web communication.<br><br>
  <strong>Key features:</strong>
  <ul>
    <li>Simple and universally supported</li>
    <li>Easy integration with cloud services</li>
  </ul>
  <strong>Limitations:</strong>
  <ul>
    <li>Heavy headers</li>
    <li>Not optimized for low-power devices</li>
  </ul>
  <strong>Best for:</strong> REST APIs, configuration updates, dashboards.
  </li>

  <br>

  <li><strong>CoAP (Constrained Application Protocol)</strong><br>
  Designed for constrained IoT devices.<br><br>
  <strong>Key features:</strong>
  <ul>
    <li>Lightweight alternative to HTTP</li>
    <li>Runs over UDP</li>
  </ul>
  <strong>Best for:</strong> Low-power and resource-constrained devices.
  </li>

  <br>

  <li><strong>WebSockets</strong><br>
  Enables full-duplex communication between client and server.<br><br>
  <strong>Key features:</strong>
  <ul>
    <li>Real-time bidirectional communication</li>
    <li>Persistent connection</li>
  </ul>
  <strong>Best for:</strong> Live dashboards and real-time control systems.
  </li>
</ol>

<h3>Publish–Subscribe vs Request–Response</h3>

<p><strong>Request–Response Model:</strong><br>
Client sends a request → Server sends a response.<br>
Commonly used in HTTP-based systems.</p>

<p><strong>Publish–Subscribe Model:</strong><br>
Devices publish data to topics → Subscribers automatically receive updates.<br>
Commonly used in MQTT systems and highly scalable for large IoT deployments.</p>

<h3>Security in IoT Communication</h3>

<p>Connectivity introduces security risks such as:</p>

<ul>
  <li>Data interception</li>
  <li>Unauthorized access</li>
  <li>Device spoofing</li>
</ul>

<p>Common security practices include:</p>

<ul>
  <li>TLS/SSL encryption</li>
  <li>Authentication tokens</li>
  <li>Device certificates</li>
  <li>Secure key storage</li>
</ul>

<p>Secure communication is non-negotiable in production IoT systems.</p>

<h3>Choosing the Right Connectivity and Protocol</h3>

<p>Important decision factors include:</p>

<ul>
  <li>Range requirements</li>
  <li>Power availability</li>
  <li>Data volume</li>
  <li>Latency tolerance</li>
  <li>Cost constraints</li>
  <li>Scalability needs</li>
</ul>

<p>Examples:</p>

<ul>
  <li>Smart home → Wi-Fi + MQTT</li>
  <li>Smart agriculture → LoRa + MQTT</li>
  <li>Wearables → BLE</li>
</ul>

<p>There is no universal solution—each application demands a tailored communication stack.</p>

<h3>Real-World Example: Smart City Parking System</h3>

<p>Parking sensors detect availability → Data transmitted via LPWAN → MQTT protocol publishes updates → Mobile app subscribes to parking data → Drivers receive real-time parking availability information.</p>

<p>Connectivity enables city-scale intelligence and automation.</p>

<h3>Challenges in IoT Communication</h3>

<ul>
  <li>Network instability</li>
  <li>Latency and packet loss</li>
  <li>Power constraints</li>
  <li>Scalability limitations</li>
  <li>Security vulnerabilities</li>
</ul>

<p>Successful IoT systems carefully balance performance, power consumption, reliability, and cost.</p>

<h3>Conclusion</h3>

<p>Connectivity and communication protocols are the backbone that transform isolated embedded devices into a connected ecosystem. Choosing the right communication stack directly impacts the reliability, scalability, and cost of an IoT solution.</p>

<p>In the world of IoT, intelligence is powerful—but connectivity makes it meaningful.</p>

      `
    },
    {
      id: 4,
      title: "IoT Gateways – The Bridge Between Devices and the Cloud",
      image: article4,
      
      content: `
        <h2>IoT Gateways – The Bridge Between Devices and the Cloud</h2>

<h3>Introduction</h3>

<p>In a small IoT project, devices can sometimes communicate directly with the cloud. However, as systems grow—hundreds or thousands of devices, multiple communication protocols, and unreliable networks—direct communication becomes inefficient, expensive, and unreliable. This is where IoT gateways become essential.</p>

<p>An IoT gateway acts as an intelligent bridge between IoT devices and cloud platforms. It collects data from devices, processes it locally, ensures secure communication, and forwards only meaningful information to the cloud.</p>

<p>In many real-world deployments, gateways are the silent heroes that keep IoT systems scalable, secure, and efficient.</p>

<h3>What Is an IoT Gateway?</h3>

<p>An IoT gateway is a hardware or software system that:</p>

<ul>
  <li>Connects multiple IoT devices</li>
  <li>Aggregates and filters data</li>
  <li>Translates communication protocols</li>
  <li>Manages local processing and security</li>
  <li>Communicates with the cloud or central server</li>
</ul>

<p>Think of a gateway as a local manager—it handles complexity at the device level so the cloud doesn’t have to.</p>

<h3>Why IoT Gateways Are Needed</h3>

<p>Direct device-to-cloud communication may seem simple, but it creates several challenges:</p>

<ul>
  <li>High bandwidth usage</li>
  <li>Increased cloud costs</li>
  <li>Latency issues</li>
  <li>Poor reliability during network outages</li>
  <li>Security risks</li>
</ul>

<p>IoT gateways solve these problems by acting as an intermediate intelligence layer between devices and the cloud.</p>

<h3>Role of IoT Gateways in IoT Architecture</h3>

<p>A typical IoT data flow with a gateway looks like this:</p>

<p>Sensors generate raw data → Devices send data to the gateway → Gateway filters, aggregates, or preprocesses data → Gateway applies encryption and security checks → Clean data is sent to the cloud → Cloud performs analytics and visualization.</p>

<p>This layered architecture improves performance, reliability, and scalability.</p>

<h3>Key Functions of an IoT Gateway</h3>

<ol>
  <li><strong>Protocol Translation</strong><br><br>
  IoT devices use various protocols such as:
  <ul>
    <li>BLE</li>
    <li>Zigbee</li>
    <li>Modbus</li>
    <li>LoRa</li>
  </ul>
  Cloud platforms typically use:
  <ul>
    <li>MQTT</li>
    <li>HTTP</li>
    <li>HTTPS</li>
  </ul>
  The gateway translates between these protocols, enabling seamless communication between devices and cloud systems.
  </li>

  <br>

  <li><strong>Data Aggregation and Filtering</strong><br><br>
  Instead of sending every raw data point to the cloud:
  <ul>
    <li>The gateway combines data from multiple devices</li>
    <li>Filters out noise and irrelevant values</li>
    <li>Sends summarized or event-based data</li>
  </ul>
  This significantly reduces bandwidth usage and cloud processing costs.
  </li>

  <br>

  <li><strong>Edge Processing</strong><br><br>
  Gateways often perform edge computing tasks such as:
  <ul>
    <li>Threshold-based decision-making</li>
    <li>Generating local alerts</li>
    <li>Temporary data storage</li>
    <li>Basic analytics</li>
  </ul>
  This allows systems to continue functioning even when internet connectivity is unstable.
  </li>

  <br>

  <li><strong>Security Management</strong><br><br>
  Gateways act as a security shield by providing:
  <ul>
    <li>Device authentication</li>
    <li>Data encryption</li>
    <li>Firewall configurations</li>
    <li>Secure tunneling (VPNs)</li>
  </ul>
  They reduce the attack surface by preventing direct internet exposure of IoT devices.
  </li>

  <br>

  <li><strong>Device Management</strong><br><br>
  Gateways assist in:
  <ul>
    <li>Device onboarding and registration</li>
    <li>Configuration management</li>
    <li>Firmware updates (OTA)</li>
    <li>Device health monitoring</li>
  </ul>
  This is essential for managing large-scale IoT deployments efficiently.
  </li>
</ol>

<h3>Types of IoT Gateways</h3>

<ol>
  <li><strong>Hardware Gateways</strong><br>
  Physical devices deployed at the edge of the network.<br><br>
  Examples:
  <ul>
    <li>Industrial gateways</li>
    <li>Edge computers</li>
    <li>Router-based gateways</li>
  </ul>
  <strong>Use cases:</strong> Factories, farms, smart cities.
  </li>

  <br>

  <li><strong>Software Gateways</strong><br>
  Software systems running on:
  <ul>
    <li>Servers</li>
    <li>Embedded systems</li>
    <li>Single-board computers</li>
  </ul>
  <strong>Use cases:</strong> Cloud simulations, small deployments.
  </li>

  <br>

  <li><strong>Edge Gateways</strong><br>
  Advanced gateways with strong processing capabilities.<br><br>
  Capabilities:
  <ul>
    <li>Running AI models locally</li>
    <li>Performing advanced analytics</li>
    <li>Real-time decision-making</li>
  </ul>
  <strong>Use cases:</strong> Industrial automation, video analytics, predictive maintenance.
  </li>
</ol>

<h3>Gateway vs Direct Device-to-Cloud Communication</h3>

<div class="table-wrapper">
  <table class="article-table" role="table">
    <thead>
      <tr>
        <th>Feature</th>
        <th>Direct to Cloud</th>
        <th>With Gateway</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Scalability</td>
        <td>Limited</td>
        <td>High</td>
      </tr>
      <tr>
        <td>Latency</td>
        <td>Higher</td>
        <td>Lower</td>
      </tr>
      <tr>
        <td>Security</td>
        <td>Lower</td>
        <td>Higher</td>
      </tr>
      <tr>
        <td>Cloud Cost</td>
        <td>Higher</td>
        <td>Optimized</td>
      </tr>
      <tr>
        <td>Offline Operation</td>
        <td>No</td>
        <td>Yes</td>
      </tr>
    </tbody>
  </table>
</div>

<p>Gateways may not always be required in small projects, but at scale, they become essential.</p>

<h3>Real-World Example: Industrial IoT Factory</h3>

<p>Machine sensors collect operational data → PLCs transmit data using industrial protocols → Gateway converts data to MQTT → Local alerts are generated for faults → Cloud receives summarized performance insights.</p>

<p>If internet connectivity fails, the factory continues operating safely due to gateway-level logic and edge processing.</p>

<h3>Gateways and Edge Computing</h3>

<p>Modern IoT gateways are evolving into powerful edge computing platforms capable of:</p>

<ul>
  <li>Running AI inference at the edge</li>
  <li>Enabling predictive maintenance</li>
  <li>Supporting real-time decision-making</li>
  <li>Reducing dependency on cloud processing</li>
</ul>

<p>This evolution is critical for latency-sensitive and mission-critical applications.</p>

<h3>Hardware Used as IoT Gateways</h3>

<p>Common gateway hardware includes:</p>

<ul>
  <li>Industrial PCs</li>
  <li>Single-board computers</li>
  <li>Network routers with IoT support</li>
  <li>Embedded Linux systems</li>
</ul>

<p>They typically support:</p>

<ul>
  <li>Multiple interfaces (Ethernet, Wi-Fi, cellular)</li>
  <li>Large storage capacity</li>
  <li>Strong processing capabilities</li>
</ul>

<h3>Challenges with IoT Gateways</h3>

<ul>
  <li>Higher initial deployment cost</li>
  <li>Maintenance complexity</li>
  <li>Software update management</li>
  <li>Hardware failure risks</li>
  <li>Configuration management challenges</li>
</ul>

<p>Despite these challenges, gateways significantly improve long-term reliability and efficiency.</p>

<h3>When Do You Need an IoT Gateway?</h3>

<p>You likely need a gateway if:</p>

<ul>
  <li>You manage many devices</li>
  <li>Devices use multiple communication protocols</li>
  <li>Low latency is required</li>
  <li>Internet connectivity is unreliable</li>
  <li>Security is a major concern</li>
</ul>

<p>Small hobby projects may operate without gateways, but production-grade systems rarely do.</p>

<h3>Conclusion</h3>

<p>IoT gateways play a critical role in building scalable, secure, and intelligent IoT systems. They reduce cloud dependency, improve performance, and act as a protective layer between devices and the public internet.</p>

<p>As IoT systems increasingly move toward edge intelligence, gateways are no longer optional components—they are strategic assets in modern IoT architecture.</p>

      `
    },
    {
      id: 5,
      title: "Cloud Platforms and Data Processing – The Intelligence Layer of IoT",
      image: article5,
      
      content: `
        <h2>Cloud Platforms and Data Processing – The Intelligence Layer of IoT</h2>

<h3>Introduction</h3>

<p>Sensors collect data. Microcontrollers process it. Connectivity transmits it. Gateways manage it. But the real intelligence of IoT lives in the cloud.</p>

<p>Cloud platforms transform raw sensor data into insights, predictions, alerts, and dashboards that humans and systems can actually use. Without cloud computing, IoT would remain a collection of isolated devices instead of a scalable, data-driven ecosystem.</p>

<p>In this article, we explore how cloud platforms work in IoT, how data is processed, and why the cloud is essential for large-scale IoT solutions.</p>

<h3>What Is the Cloud in IoT?</h3>

<p>In IoT, the cloud refers to remote servers and infrastructure that:</p>

<ul>
  <li>Receive data from IoT devices</li>
  <li>Store massive amounts of data</li>
  <li>Process and analyze information</li>
  <li>Provide dashboards, APIs, and integrations</li>
  <li>Enable automation and intelligent decision-making</li>
</ul>

<p>The cloud acts as a centralized intelligence layer that can manage thousands or even millions of connected devices simultaneously.</p>

<h3>Why Cloud Platforms Are Essential for IoT</h3>

<p>IoT systems generate enormous volumes of data over long periods of time. Cloud platforms enable:</p>

<ul>
  <li>Scalability (adding devices without redesigning the system)</li>
  <li>Remote access from anywhere</li>
  <li>Long-term data storage</li>
  <li>Advanced analytics</li>
  <li>Machine learning and AI integration</li>
  <li>Centralized monitoring and control</li>
</ul>

<p>Handling all this using local servers would be costly, complex, and difficult to maintain at scale.</p>

<h3>Typical IoT Cloud Architecture</h3>

<p>A standard IoT cloud pipeline looks like this:</p>

<p>IoT devices send data → Gateway or device connects to cloud → Data ingestion service receives messages → Data is stored in databases → Processing and analytics are applied → Dashboards, alerts, and APIs are generated.</p>

<p>Each layer is built to handle high availability, scalability, and security.</p>

<h3>Data Ingestion in IoT</h3>

<p>Data ingestion is the process of securely receiving data from IoT devices.</p>

<p>Key characteristics include:</p>

<ul>
  <li>Handling millions of messages per second</li>
  <li>Supporting protocols like MQTT and HTTP</li>
  <li>Managing authentication and authorization</li>
  <li>Ensuring reliable message delivery</li>
</ul>

<p>Efficient ingestion systems ensure that no data is lost—even when devices reconnect after temporary network failures.</p>

<h3>IoT Data Storage</h3>

<p>IoT data is stored in different formats depending on its usage and structure.</p>

<ol>
  <li><strong>Time-Series Databases</strong><br>
  Designed for storing sensor readings over time.<br><br>
  <ul>
    <li>Optimized for fast data writes</li>
    <li>Efficient time-based queries</li>
  </ul>
  <strong>Examples:</strong> Temperature logs, energy consumption records.
  </li>

  <br>

  <li><strong>Relational Databases</strong><br>
  Used for structured data such as:
  <ul>
    <li>Device metadata</li>
    <li>User information</li>
    <li>Configuration settings</li>
  </ul>
  </li>

  <br>

  <li><strong>Object Storage</strong><br>
  Used for storing large files:
  <ul>
    <li>Images</li>
    <li>Videos</li>
    <li>Log files</li>
  </ul>
  </li>
</ol>

<p>Cloud storage allows IoT systems to scale without worrying about hardware limitations.</p>

<h3>Data Processing in IoT Cloud</h3>

<ol>
  <li><strong>Real-Time Processing</strong><br><br>
  Used for:
  <ul>
    <li>Instant alerts</li>
    <li>Notifications</li>
    <li>Live dashboards</li>
  </ul>
  <strong>Example:</strong> If temperature exceeds a defined threshold, trigger an alert immediately.
  </li>

  <br>

  <li><strong>Batch Processing</strong><br><br>
  Used for:
  <ul>
    <li>Periodic reports</li>
    <li>Historical data analysis</li>
    <li>Trend identification</li>
  </ul>
  <strong>Example:</strong> Generating daily or monthly energy usage reports.
  </li>

  <br>

  <li><strong>Stream Processing</strong><br><br>
  Used for:
  <ul>
    <li>Continuous data flows</li>
    <li>Pattern detection</li>
    <li>Anomaly detection</li>
  </ul>
  This enables near real-time intelligence at large scale.
  </li>
</ol>

<h3>Analytics and Visualization</h3>

<p>Raw data becomes valuable only when it can be interpreted easily.</p>

<p>Cloud platforms provide:</p>

<ul>
  <li>Interactive graphs and charts</li>
  <li>Dashboards</li>
  <li>Heat maps</li>
  <li>Usage reports</li>
</ul>

<p>Visualization helps users:</p>

<ul>
  <li>Identify trends</li>
  <li>Detect anomalies</li>
  <li>Make informed decisions</li>
</ul>

<p>A well-designed dashboard can simplify complex systems into clear, actionable insights.</p>

<h3>Machine Learning and AI in IoT Cloud</h3>

<p>Cloud platforms enable advanced intelligence such as:</p>

<ul>
  <li>Predictive maintenance</li>
  <li>Demand forecasting</li>
  <li>Behavior analysis</li>
  <li>Anomaly detection</li>
</ul>

<p>Examples include:</p>

<ul>
  <li>Analyzing vibration data to predict machine failure</li>
  <li>Forecasting power consumption patterns</li>
  <li>Detecting unusual activity in security systems</li>
</ul>

<p>Cloud-based AI shifts IoT systems from reactive responses to predictive decision-making.</p>

<h3>Automation and Rules Engine</h3>

<p>Many IoT cloud platforms include built-in automation features such as:</p>

<ul>
  <li>Rule engines</li>
  <li>Event triggers</li>
  <li>Automated workflows</li>
</ul>

<p>Examples:</p>

<ul>
  <li>If moisture &lt; threshold → Send notification</li>
  <li>If energy usage spikes → Shut down system</li>
  <li>If device goes offline → Alert administrator</li>
</ul>

<p>Automation reduces manual intervention and improves operational efficiency.</p>

<h3>APIs and Integrations</h3>

<p>IoT cloud platforms expose APIs that allow integration with:</p>

<ul>
  <li>Mobile applications</li>
  <li>Web dashboards</li>
  <li>Enterprise systems</li>
  <li>Third-party services</li>
</ul>

<p>This makes IoT data accessible across different platforms and business systems.</p>

<h3>Security in the Cloud Layer</h3>

<p>Security is critical in cloud-based IoT systems. Key measures include:</p>

<ul>
  <li>Encrypted communication (TLS/SSL)</li>
  <li>Strong device authentication</li>
  <li>Role-based access control</li>
  <li>Secure data storage</li>
  <li>Audit logging and monitoring</li>
</ul>

<p>A compromised cloud layer can expose thousands of connected devices, so security must be built into the architecture from the start.</p>

<h3>Real-World Example: Smart Energy Monitoring System</h3>

<p>Smart meters transmit usage data → Cloud stores time-series data → Analytics identify peak consumption → Dashboards display patterns → Alerts notify abnormal usage → AI models predict future demand.</p>

<p>The cloud transforms raw electrical readings into actionable business intelligence.</p>

<h3>Cloud vs Edge: Finding the Balance</h3>

<p>Not all processing should occur in the cloud.</p>

<ul>
  <li><strong>Cloud:</strong> Heavy analytics, long-term storage, AI training, large-scale coordination</li>
  <li><strong>Edge:</strong> Low-latency decisions, offline operation, immediate control actions</li>
</ul>

<p>Modern IoT systems combine cloud and edge computing to achieve both efficiency and reliability.</p>

<h3>Challenges of Cloud-Based IoT</h3>

<ul>
  <li>Latency for real-time control</li>
  <li>Data privacy concerns</li>
  <li>Cost management at scale</li>
  <li>Dependency on stable network connectivity</li>
</ul>

<p>Well-designed architecture minimizes these risks through smart system planning and hybrid processing strategies.</p>

<h3>Conclusion</h3>

<p>Cloud platforms form the intelligence layer that transforms IoT from a network of connected devices into smart, scalable systems. They provide storage, analytics, automation, AI capabilities, and seamless integration that are impossible to achieve at the device level alone.</p>

<p>As IoT continues to grow, the cloud remains the foundation for turning raw data into meaningful, actionable intelligence.</p>

      `
    },
    {
      id: 6,
      title: "Applications, Dashboards, and User Interfaces – Where IoT Meets Humans",
      image: article6,
      
      content: `
       <h2>Applications, Dashboards, and User Interfaces – Where IoT Meets Humans</h2>

<h3>Introduction</h3>

<p>All the intelligence in an IoT system—sensors, microcontrollers, connectivity, gateways, and cloud platforms—exists for one final purpose: to serve humans. That interaction happens through applications, dashboards, and user interfaces (UI).</p>

<p>If the interface is confusing, slow, or poorly designed, even the most advanced IoT system feels ineffective. A well-designed application, on the other hand, can transform complex sensor data into clear insights and simple actions.</p>

<p>In this article, we explore how IoT applications and dashboards work, key design principles, and why user experience is the final—and most visible—layer of IoT systems.</p>

<h3>What Are IoT Applications?</h3>

<p>An IoT application is the software layer that enables users to:</p>

<ul>
  <li>View real-time and historical device data</li>
  <li>Monitor overall system health</li>
  <li>Control devices remotely</li>
  <li>Receive alerts and notifications</li>
  <li>Analyze trends and performance metrics</li>
</ul>

<p>These applications may take different forms:</p>

<ul>
  <li>Mobile applications</li>
  <li>Web-based dashboards</li>
  <li>Desktop software</li>
  <li>Integrated enterprise systems</li>
</ul>

<p>They represent the human-facing interface of the IoT ecosystem.</p>

<h3>Role of Dashboards in IoT</h3>

<p>A dashboard is a visual interface that presents IoT data in a structured, organized, and meaningful way.</p>

<p>Typical dashboard components include:</p>

<ul>
  <li>Real-time sensor readings</li>
  <li>Historical trend charts</li>
  <li>Alerts and notifications</li>
  <li>Device connectivity status</li>
  <li>Control panels and configuration settings</li>
</ul>

<p>An effective dashboard allows users to understand the system state at a glance without digging into raw data.</p>

<h3>Types of IoT Applications</h3>

<ol>
  <li><strong>Monitoring Applications</strong><br><br>
  Designed primarily for observing system performance.
  <ul>
    <li>Temperature monitoring systems</li>
    <li>Energy consumption tracking</li>
    <li>Asset tracking dashboards</li>
  </ul>
  <strong>Focus:</strong> Data visibility, status tracking, and alerting.
  </li>

  <br>

  <li><strong>Control Applications</strong><br><br>
  Enable users to take direct actions on connected devices.
  <ul>
    <li>Turning devices ON/OFF remotely</li>
    <li>Adjusting threshold values</li>
    <li>Scheduling operations</li>
  </ul>
  <strong>Focus:</strong> Reliability, responsiveness, and safety.
  </li>

  <br>

  <li><strong>Analytics Applications</strong><br><br>
  Provide deeper insights and predictive intelligence.
  <ul>
    <li>Performance analysis reports</li>
    <li>Efficiency optimization tools</li>
    <li>Predictive maintenance systems</li>
  </ul>
  <strong>Focus:</strong> Decision-making and long-term optimization.
  </li>
</ol>

<h3>User Interfaces in IoT</h3>

<p>The user interface (UI) defines how users interact with IoT systems.</p>

<p>Common UI elements include:</p>

<ul>
  <li>Line graphs and bar charts</li>
  <li>Gauges and digital meters</li>
  <li>Geographical maps</li>
  <li>Buttons, toggles, and sliders</li>
  <li>Alerts and notification banners</li>
</ul>

<p>A well-designed UI minimizes cognitive load, reduces errors, and enhances user confidence.</p>

<h3>Design Principles for IoT Dashboards</h3>

<ol>
  <li><strong>Simplicity</strong><br><br>
  Avoid overwhelming users with excessive data. Highlight critical metrics first and allow deeper exploration when needed.
  </li>

  <br>

  <li><strong>Real-Time Feedback</strong><br><br>
  IoT interfaces must update instantly to reflect real-world changes. Delays reduce trust in the system.
  </li>

  <br>

  <li><strong>Context Awareness</strong><br><br>
  Data should always include:
  <ul>
    <li>Measurement units</li>
    <li>Threshold indicators</li>
    <li>Status labels (Normal, Warning, Critical)</li>
  </ul>
  Numbers without context can be misleading.
  </li>

  <br>

  <li><strong>Responsiveness</strong><br><br>
  Dashboards must function seamlessly across:
  <ul>
    <li>Mobile devices</li>
    <li>Tablets</li>
    <li>Desktop systems</li>
  </ul>
  Many users monitor IoT systems while on the move.
  </li>

  <br>

  <li><strong>Reliability and Fail-Safes</strong><br><br>
  Interfaces should:
  <ul>
    <li>Handle offline devices gracefully</li>
    <li>Display clear error messages</li>
    <li>Prevent unsafe or dangerous actions</li>
  </ul>
  </li>
</ol>

<h3>Data Visualization Techniques in IoT</h3>

<p>Effective visualization transforms raw data into actionable insights.</p>

<ul>
  <li><strong>Line charts:</strong> Ideal for time-based trends</li>
  <li><strong>Bar charts:</strong> Useful for comparisons</li>
  <li><strong>Heat maps:</strong> Show density and intensity patterns</li>
  <li><strong>Gauges:</strong> Highlight threshold levels</li>
  <li><strong>Maps:</strong> Display location-based information</li>
</ul>

<p>Selecting the appropriate visualization method is more important than adding complex graphics.</p>

<h3>Real-Time Alerts and Notifications</h3>

<p>Alerts keep users informed without requiring constant monitoring.</p>

<p>Common triggers include:</p>

<ul>
  <li>Temperature exceeding a safe limit</li>
  <li>Device going offline</li>
  <li>Abnormal energy consumption</li>
  <li>Security breach detection</li>
</ul>

<p>Notifications may be delivered through:</p>

<ul>
  <li>In-app notifications</li>
  <li>SMS messages</li>
  <li>Email alerts</li>
  <li>Messaging platforms</li>
</ul>

<p>An effective alert system minimizes false alarms while ensuring critical issues are never missed.</p>

<h3>Role of UX in IoT Adoption</h3>

<p>Many IoT solutions fail not because of weak technology, but due to poor user experience.</p>

<p>Strong UX design:</p>

<ul>
  <li>Builds user trust</li>
  <li>Reduces training requirements</li>
  <li>Encourages consistent usage</li>
  <li>Prevents costly operational mistakes</li>
</ul>

<p>In enterprise environments, poor dashboard design can lead to incorrect decisions with significant financial consequences.</p>

<h3>Security and Access Control in Applications</h3>

<p>IoT applications must implement strong security controls, including:</p>

<ul>
  <li>User authentication mechanisms</li>
  <li>Role-based access control (RBAC)</li>
  <li>Secure session management</li>
  <li>Audit logging and activity tracking</li>
</ul>

<p>Example access levels:</p>

<ul>
  <li><strong>Operator:</strong> View and monitor data</li>
  <li><strong>Administrator:</strong> Modify configurations and system settings</li>
  <li><strong>Viewer:</strong> Read-only access</li>
</ul>

<p>Security should remain robust yet unobtrusive to the user experience.</p>

<h3>Integration with Other Systems</h3>

<p>IoT applications frequently integrate with external systems such as:</p>

<ul>
  <li>ERP platforms</li>
  <li>CRM systems</li>
  <li>Mobile applications</li>
  <li>Third-party APIs</li>
</ul>

<p>This integration transforms IoT data into actionable business intelligence rather than isolated technical metrics.</p>

<h3>Real-World Example: Smart Building Dashboard</h3>

<p>Room temperature sensors transmit data → Dashboard displays live conditions → Energy usage is shown per floor → Remote HVAC control is available → Alerts notify abnormal patterns → Monthly efficiency reports are generated.</p>

<p>Building managers can optimize comfort and operational costs from a single, unified interface.</p>

<h3>Challenges in IoT Application Development</h3>

<ul>
  <li>Managing large volumes of real-time data</li>
  <li>Maintaining high performance and low latency</li>
  <li>Designing for diverse user roles</li>
  <li>Ensuring strong security measures</li>
  <li>Supporting multiple device types and screen sizes</li>
</ul>

<p>Successful IoT applications balance technical robustness, thoughtful design, and user-centric usability.</p>

<h3>Future of IoT Interfaces</h3>

<p>Emerging trends include:</p>

<ul>
  <li>Voice-controlled IoT systems</li>
  <li>AI-powered insights and recommendations</li>
  <li>Predictive and adaptive dashboards</li>
  <li>Augmented reality (AR) monitoring</li>
  <li>No-code and low-code dashboard builders</li>
</ul>

<p>Future interfaces will become more intelligent, adaptive, and proactive rather than simply visual displays.</p>

<h3>Conclusion</h3>

<p>Applications, dashboards, and user interfaces represent the final and most visible layer of IoT systems. They translate complex technical processes into human understanding and control.</p>

<p>Without intuitive and reliable interfaces, IoT remains underutilized. With strong design and thoughtful user experience, IoT becomes a powerful tool that enables smarter decisions, greater efficiency, and meaningful human interaction with connected systems.</p>

      `
    }
  ];

  return (
    <div className="article-page">
      <div className="learning-page-header article-page-header">
        <h1 className="learning-page-title">Articles</h1>
      </div>
      <div className="top-picks-container">
      <div className="bento-grid">
        {articles.map((article) => (
            <div 
            key={article.id} 
            className={`bento-item bento-item-${article.id}`}
            onClick={() => navigate(`/articles/${article.id}`, { state: { article } })}
            >
            <img src={article.image} alt={article.title} />
            <div className="bento-overlay">
              <h3>{article.title}</h3>
            </div>
            </div>
        ))}
      </div>
        </div>
    </div>
  );
};

export default ArticlePage;
