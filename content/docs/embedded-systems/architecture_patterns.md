---
title: "Architecture Patterns in Embedded Systems"
date: 2026-03-19
index: 2
draft: false
description: "Architecture Patterns explained in Embedded Systems"
tags: ["embedded system", "architecture patterns", "rtos"]
readingTime: 5
toc: true
---

## Bulletproof Embedded Architecture: Essential Design Patterns

Writing embedded C code that works on your desk is easy. Writing code that survives sensor glitches, power fluctuations, and memory constraints in the real world is incredibly hard. 

Here are the structural design patterns that separate amateur scripts from production-ready industrial systems.

### 1. State Machines: Stop Using `if/else`
If your drone uses dozens of boolean flags (`is_flying`, `is_landing`) scattered throughout the code, a bug is inevitable. 

A formal **State Machine** defines exactly what the system is doing (`IDLE`, `FLYING`, `FAULT`) and explicit rules for how it transitions. If the drone is in the `LANDING` state due to low battery, and the pilot accidentally sends a `TAKE_OFF` command, the state machine simply ignores it because that transition isn't defined. The structure *is* the safety net.

### 2. Circular Buffers: The Endless Loop 
When high-speed sensors stream data faster than you can process it, a standard linear array will quickly overflow and crash your memory. 

A **Circular Buffer** solves this by wrapping the "write" pointer back to index 0 when it hits the end of the array. If the buffer gets completely full of live GPS data, it simply overwrites the oldest, stalest coordinates with the freshest ones. You never run out of memory, and you always have the latest data.

### 3. The Watchdog Manager 
A hardware watchdog timer will reboot your system if it counts down to zero, so your software must periodically "feed" it. 

But if you just let the main flight thread feed the watchdog, what happens if the sensor-reading thread freezes? The main thread keeps feeding the dog, and your drone flies blind! 
* **The Pattern:** Create a dedicated Watchdog Thread. It forces *every* critical thread to set an "I'm alive" flag. If any thread fails to check in, the manager refuses to feed the watchdog, forcing a safe reboot.

### 4. Memory Pools: Banishing `malloc()` 
In safety-critical systems, dynamically allocating memory with `malloc()` is usually forbidden because it causes memory fragmentation and unpredictable delays. 

Instead, use a **Memory Pool**. You pre-allocate a massive array of fixed-size blocks exactly once when the device boots. When a thread needs memory, it checks out a block instantly, and returns it when done. It's perfectly predictable and lightning fast. 

> [!NOTE] 
> **Takeaway:** 
> Good embedded architecture assumes hardware *will* fail and constraints *will* be pushed. Design your system to fail gracefully and recover automatically.