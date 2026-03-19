---
title: "Core Concepts of Concurrency in Embedded Systems"
date: 2026-03-19
draft: false
description: "Concurrency explained in Embedded Systems"
tags: ["embedded system", "concurrency", "rtos"]
readingTime: 5
toc: true
---

# Taming the Chaos: A Practical Guide to Concurrency in Embedded C

When you are building a flight controller for a drone, your microcontroller has to juggle a lot. It’s reading gyroscope data thousands of times a second, updating motor speeds, and logging telemetry to an SD card—all seemingly at the exact same time. 

If these independent threads try to talk over each other, your drone crashes. Here is the concurrency toolbox we use to keep the system flying safely.

## 1. The Mutex & Lock Ordering
Imagine a global `GPS_Data` structure. If the math thread tries to read it while the sensor thread is only halfway through updating it, the drone might get the latitude from the new reading, but the longitude from the old one. 

A **Mutex** fixes this by acting as a room key. Only one thread can lock the mutex and access the data at a time. 
* **The Catch:** If Thread A locks GPS and waits for Radio, but Thread B locks Radio and waits for GPS, your system freezes forever (a Deadlock). 
* **The Fix:** Enforce strict **Lock Ordering** across your codebase. Always lock GPS *before* Radio.

## 2. Spinlocks for the Need for Speed 
Mutexes are great, but if a thread can't get the lock, the OS puts it to sleep. Waking it up later takes precious CPU cycles. 

If we are inside a hardware Interrupt Service Routine (ISR), we *cannot* go to sleep. Instead, we use a **Spinlock**. The ISR just actively loops (spins) for a few micro-seconds until the lock is free. It burns a tiny bit of CPU to guarantee zero latency.

## 3. Atomics: Hardware-Level Magic 
What if we want to increment a `total_packets_sent` counter 10,000 times a second? Mutexes and spinlocks are too slow for that volume. 

By defining the variable as an **Atomic** (using `stdatomic.h`), we tell the silicon hardware itself to ensure the increment operation is indivisible. No software locks required!

## 4. `eventfd`: The Linux Whisperer 
If your high-speed math thread needs to wake up your SD card logging thread, you don't need a heavy message queue. In embedded Linux, you can use `eventfd`. 

It creates a lightweight event counter that Linux treats exactly like a standard file. Your math thread uses the standard C `write()` function to trigger the event, and your logging thread uses `read()` to wait for it. Simple, elegant, and blazing fast.

***

**Takeaway:** Concurrency isn't about running things at the same time; it's about managing *access*. Choose the lightest tool necessary for the job to keep your system responsive!