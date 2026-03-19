---
title: "Introduction to Drones"
date: 2025-03-17
draft: false
description: "Aerial autonomy, flight dynamics, and the telemetry stack."
tags: ["drones", "uav", "mavlink"]
readingTime: 6
toc: true
---

## The UAV Ecosystem

Unmanned Aerial Vehicles (UAVs), commonly known as drones, involve complex flight dynamics and sophisticated telemetry systems.

### Flight Stack
- **Flight Controller**: The hardware (Pixhawk, Orange Cube).
- **Firmware**: PX4 or ArduPilot.
- **Communication Protocol**: MAVLink for telemetry and control.

## Key Challenges
- **Stability**: High-frequency PID loops for altitude and position hold.
- **Autonomy**: GPS-denied navigation using optical flow or VIO (Visual Inertial Odometry).
- **Power Management**: Optimizing thrust-to-weight ratios for longer flight times.
