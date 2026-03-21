---
title: "Core Protocols in Embedded Systems"
date: 2026-03-19
index: 4
draft: false
description: "Protocols explained in Embedded Systems"
tags: ["embedded system", "protocols"]
readingTime: 5
toc: true
---

## The Core Embedded System Protocols

These protocols dictate how microcontrollers, sensors, and computers talk to one another.

### UART (Universal Asynchronous Receiver-Transmitter)
* **How it works:** One of the oldest and simplest methods. It uses just two wires (one to send, one to receive).
* **Timing:** Asynchronous. There is no shared clock. Instead, both devices must agree on a specific speed (baud rate) before they start talking—like two people agreeing to speak at the same pace.
* **Where you will find it:** Arduino boards, GPS modules, and Bluetooth adapters. It is not the fastest, but its simplicity keeps it everywhere.

### SPI (Serial Peripheral Interface)
* **How it works:** Faster than UART, SPI uses four wires: Clock, MOSI (Master Out Slave In), MISO (Master In Slave Out), and Chip Select.
* **Timing:** Synchronous. The Clock wire acts like a conductor leading an orchestra, keeping the Master device and all Slave devices perfectly in sync.
* **Where you will find it:** SD cards, display screens, and flash memory. It is incredibly fast, but the 4-wire requirement can get messy if you connect too many devices.

### I2C (Inter-Integrated Circuit)
* **How it works:** The smart middle ground. It uses only two wires (Data and Clock) but can connect up to 127 different devices.
* **Addressing:** Each device gets a unique address. It acts like a group chat where everyone is on the same line, but a device only responds when the Master calls its specific name.
* **Where you will find it:** Temperature sensors, OLED displays, and gyroscopes. It saves wiring space compared to SPI, though it operates at a slower speed.

### CAN (Controller Area Network)
* **How it works:** Invented by Bosch in 1983 specifically for cars. It allows dozens of computers (engine, brakes, airbags) to share just two wires (CAN High and CAN Low).
* **Conflict Resolution:** If two devices talk at the exact same time, CAN has a built-in priority system to decide who goes first without losing any data.
* **Where you will find it:** Every modern car, trucks, industrial robots, and medical equipment. It is heavily battle-tested for reliability.

### RS-232
* **How it works:** Defined in 1960, this is a point-to-point protocol designed to fight electrical noise over long cables. Unlike standard logic (0 to 3.3V), RS-232 uses massive voltage swings (+15V to -15V).
* **Where you will find it:** The old 9-pin DB9 connectors on vintage PCs. Today, it survives in industrial machines, factory equipment, and legacy point-of-sale terminals.

### 1-Wire
* **How it works:** As the name implies, it uses a single wire for both data communication and power. Devices come from the factory with a unique burned-in 64-bit ID.
* **Where you will find it:** The famous DS18B20 temperature sensor, laptop battery fuel gauges, and iButton security keys. It is very slow, but unbeatable when you absolutely must minimize wiring.

### Protocol Explorer

{{% details title="Click to reveal protocol explorer" %}}
![protocols](images/embedded_protocols.svg)
{{% /details %}}

