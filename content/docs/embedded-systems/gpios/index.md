---
title: "GPIO: From Code to CMOS Voltage"
# date: 2026-03-22T16:32:00+05:30
draft: false
description: "A detailed step-by-step guide explaining how a line of code translates into physical voltage through a microcontroller's GPIO pin."
tags: ["GPIO", "Microcontrollers", "Embedded Systems", "Hardware", "Electronics"]
categories: ["Embedded Systems"]
toc: true
weight: 20
readingTime: 10
---

A **`GPIO`** (General Purpose Input/Output) pin is the ultimate bridge between the digital brain of a microcontroller (like an Arduino or Raspberry Pi) and the physical world. It allows software to control hardware (like turning on an LED) or read from hardware (like checking if a button is pressed).

But how does typing `digitalWrite(pin, HIGH)` actually result in 3.3 or 5 volts coming out of a piece of metal? *(Note: GPIO pins are strictly digital, meaning they only output full voltage or zero volts. To get intermediate voltages, like for dimming an LED, you use a technique called PWM, or Pulse Width Modulation.)*

Let's follow the journey step-by-step.

## Step 1: The Software and The Register

It all starts in your code. When you tell a microcontroller to set a pin `HIGH`, the CPU doesn't physically reach out to the pin. Instead, it writes a number to a specific location in its memory.

Inside the microcontroller, there are special memory locations called **Registers**. You can think of a register as a tiny bank of light switches, where each switch is a "bit" (a 1 or a 0).

* **Memory-Mapped I/O:** The hardware is designed so that specific memory addresses are hard-wired to physical circuits (e.g., writing to memory address `0x40020000` might directly control Port A).
* **The Action:** When you command a pin to go `HIGH`, the CPU finds the specific register assigned to that GPIO port (often called the `PORT` or `OUT` register) and flips the specific bit for your pin from `0` to `1`.

**Current Status:** A microscopic memory cell inside the chip is now holding an electrical charge representing a `1`.

## Step 2: The Internal Logic (The Flip-Flop)

That bit in the register is connected to a circuit called a **D Flip-Flop** or a **Latch**.

A latch is a simple memory circuit that "holds" a state. Because the CPU is constantly doing millions of things a second, it can't sit there holding the pin high itself. The CPU flips the bit in the register, the latch "catches" that `1`, and remembers it indefinitely until the CPU tells it to change back to a `0`.

**Current Status:** The latch is outputting a steady internal digital `1` signal deep inside the silicon chip.

## Step 3: The CMOS Output Stage (The Heavy Lifting)

This internal digital `1` is very weak. It doesn't have enough power to light up an LED or drive a motor. It needs to be amplified. This brings us to the actual physical pin output stage, which uses **CMOS** technology.

**`CMOS`** stands for *Complementary Metal-Oxide-Semiconductor*. `Complementary` means it uses two different types of microscopic electronic switches (transistors) that work as a team:

* **`PMOS` Transistor (The Pull-Up Switch):** Connects the physical pin to the power supply (VCC, usually 3.3V or 5V).
* **`NMOS` Transistor (The Pull-Down Switch):** Connects the physical pin to Ground (0V).

These two transistors are arranged in a `Push-Pull` configuration. They are connected to the physical metal leg of the chip.

### The Push-Pull Wiring Diagram

Here is a simplified diagram of how these transistors are wired together inside the chip:

![GPIO CMOS Diagram](/docs/embedded-systems/gpios/images/gpio_cmos.svg)

### How the Internal Logic Controls the Wiring

The term `Push-Pull` comes from how these two transistors act on the physical pin:

* **Push (`PMOS`):** When activated, it connects VCC to the pin, "pushing" current out to the external circuit.
* **Pull (`NMOS`):** When activated, it connects Ground to the pin, "pulling" the pin's voltage down to 0V and sinking any incoming current.

The **`Internal Logic`** acts as the traffic controller. It receives the weak `1` or `0` from the D Flip-Flop (Step 2) and guarantees that only one transistor is active at any given moment. It contains logic gates (like inverters) to split the single latch signal into two distinct, opposite control signals—one for the PMOS gate and one for the NMOS gate. This translation is needed because PMOS transistors actually turn ON when their control gate receives a LOW (0V) signal, while NMOS transistors turn ON with a HIGH signal. The internal logic handles this translation.

### What happens when you set the pin HIGH?

1.  The internal logic sees the `1` from the latch.
2.  It sends a signal to the **PMOS** transistor to turn **ON** (close the switch).
3.  Simultaneously, it sends a signal to the **NMOS** transistor to turn **OFF** (open the switch).

**Result:** The physical pin is now directly connected to the internal VCC power line. Current flows out of the pin to your LED. The pin is `HIGH`.

### What happens when you set the pin LOW?

1.  The CPU writes a `0` to the register. The latch outputs a `0`.
2.  The internal logic sends a signal to the **PMOS** transistor to turn **OFF**.
3.  Simultaneously, it sends a signal to the **NMOS** transistor to turn **ON**.

**Result:** The physical pin is disconnected from power and directly connected to Ground. Any leftover electricity is drained away. The pin is `LOW` (0 Volts).

> **Crucial Rule:** The PMOS and NMOS are NEVER turned on at the same time. If they were, power would flow directly from VCC to ground, creating a short circuit (known as "shoot-through") that would instantly melt the chip!

## What about INPUT mode?

For completeness, what happens if you configure the pin as an `INPUT`?

The internal logic turns **BOTH** the PMOS and NMOS transistors **OFF**. 

This state is called **High Impedance** (or High-Z). The pin is effectively disconnected from the chip's internal power and ground. It just "floats", acting like a tiny antenna waiting to feel voltage from the outside world. Because a floating pin can cause erratic readings, microcontrollers often include internal pull-up or pull-down resistors (activated via software, like `INPUT_PULLUP`). These lightly tie the pin to VCC or Ground to stabilize the input. An internal sensing circuit (a buffer) watches the pin and updates a different register (the `PIN` or `IN` register) with a `1` or `0` depending on the voltage it senses, which your software can then read.

## Summary of the Journey

1.  **Software:** You write `Pin = HIGH`.
2.  **CPU:** Translates this to writing a `1` to a specific memory address.
3.  **Register/Latch:** A microscopic memory cell catches and holds that `1`.
4.  **Logic:** The circuit translates that `1` into transistor control signals.
5.  **CMOS:** The PMOS switch closes, connecting the pin to 5V. The NMOS switch opens, blocking Ground.
6.  **Physical Pin:** 5 Volts appears on the metal leg of the microcontroller!