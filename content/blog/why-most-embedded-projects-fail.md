---
title: "Why Most Embedded Projects Fail Before the First Line of Code"
date: 2025-03-10
draft: false
description: "The real failures happen long before you open an IDE. Here's what to fix first."
image: "/images/system_fail.svg"
categories: ["Embedded Systems"]
tags: ["project-management"]
readingTime: 6
---

## The Real Problem Starts Before Coding

Let me paint a picture you’ve probably seen before: A project gets scoped out in an enthusiastic meeting. Someone draws a few neat, connected boxes on a whiteboard. Then, a developer is handed a fresh microcontroller and simply told to "make it work." 

Three months later? The hardware is missing its timing deadlines, the power budget is completely blown, and half the peripherals are ghosting each other on the I2C bus.

Most embedded project failures aren't actually firmware bugs. They're *requirements* bugs—decisions made (or totally ignored) weeks before anyone wrote a single line of C or C++. 

Here is what actually goes wrong in the wild, and how to catch it before it costs you your weekend.

### 1. Vague Requirements That Sound Precise

Saying "the device should respond quickly" is a wish, not a requirement. Saying "the device shall respond to a sensor trigger within 50ms, 99.9% of the time, under all operating temperatures" is a requirement.

I ran into exactly this kind of ambiguity while analyzing telemetry data for a water pump system. "Log the data fast" doesn't help you decide between a bare-metal ISR approach or setting up an RTOS task. You need hard numbers to know if your MCU is even up to the job.

**The Fix:** Write requirements with numbers. Every functional requirement needs a strictly measurable acceptance criterion. 

### 2. Skipping the Hardware-Software Interface Document

The HW/SW interface document (or hardware abstraction spec) is the ultimate source of truth. It defines exactly which GPIO pins do what, the expected voltage levels, and the timing diagrams. 

When I was building out an IoT framework utilizing both Wi-Fi mesh and LoRa protocols, managing those interfaces was critical. If the hardware designer and the firmware developer make different assumptions about which pin handles the radio interrupt, you won't find out until board bring-up. And fixing it then usually involves a scalpel, some magnet wire, and a lot of swearing.

**The Fix:** Write a one-page HW/SW interface doc *before* the PCB layout is frozen. Even a simple table mapping pin assignments to signal descriptions will save you days of agonizing debugging.

### 3. Ignoring the Boot Sequence

How does the system actually wake up? What happens if a peripheral takes too long to initialize? What's the watchdog timeout? 

These questions sound incredibly boring right up until your device ships with a silent boot failure. Think about building something like a low power long range lora device which wakes up from deep sleep every 15 minutes to send a message — if the primary sensors aren't fully awake and calibrated by the time the MCU asks for the first reading, what is the recovery path? Does it hang? Does it reboot? 

**The Fix:** Draw a boot sequence state machine before you ever type `int main(void)`. Every single state needs defined entry conditions, exit conditions, and explicit error paths.

### 4. No Power Budget

Power draw is additive, sneaky, and full of surprises. The MCU datasheet might proudly advertise a 10mA active current. But what about the flash memory? The sensor? The LED indicators? What about the massive transient spike when your LoRa module transmits? 

Ironically, working on Energy Management Systems makes you hyper-aware of this. Projects that skip the power budget inevitably discover the problem when their "3-day" battery dies in 3 hours.

**The Fix:** Build a spreadsheet. List every single component, its peak current, its average current at the expected duty cycle, and its sleep current. Sum them up, and then add a 20% margin because the real world is rarely ideal.

### 5. Assuming the Happy Path

What happens when the I2C sensor doesn't ACK? When the UART buffer overflows? When your network node drops connection right in the middle of a flash write? 

Embedded systems don't run in a simulator; they operate in the real world. And the real world is hostile. Hardware degrades, cables pick up noise, and users do things you never anticipated.

**The Fix:** For every single peripheral interaction, define exactly what happens on failure. Not what you *hope* happens—what your code *actually* does when the hardware inevitably misbehaves. 

### The Takeaway

Good embedded firmware starts with good requirements, a locked-down HW/SW interface, a bulletproof boot sequence, a mathematically sound power budget, and a deep pessimism about hardware reliability. Get these right, and the code almost writes itself. Skip them, and you'll spend the last two weeks before your ship date fighting fires that should have been put out in week one.

The best embedded engineers aren't the fastest coders. They're the ones who ask the most annoying questions before touching the keyboard.

***

### ---
Stay tuned & Be Curious!

> [!TIP]
> **Question for you:**  
> What’s the biggest firmware mistake you’ve made so far?
