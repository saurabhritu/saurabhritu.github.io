---
title: "Introduction to Embedded Systems"
# date: 2025-03-17
weight: 10
draft: false
description: "Core principles of embedded development — from bare-metal register manipulation to RTOS task scheduling and embedded Linux. A ground-up guide for firmware engineers."
tags: ["embedded", "firmware", "rtos", "bare-metal", "freertos", "esp32"]
readingTime: 18
toc: true
---

## OK, So you don't know anything about embedded systems?

Embedded systems are everywhere — inside your microwave, your car's ABS controller, your Wi-Fi router, and the radar module on the shelf next to your desk oh sorry I mean my desk. They are not "small computers." They are dedicated machines built to do one thing, reliably, often forever, with the exact amount of hardware they need and nothing more.

This doc establishes the `uncomfortable foundation`. If you're coming from web or straight out of the university thinking `NVIDIA kya kahta tha kya ho tum... bla bla bla.` orrr who knows from where you are comming thinking `System par denge`, a lot of your mental models will need revision. If you're already writing firmware, this is a structured reference for the concepts you probably learned piecemeal.


## What are Embedded Systems?

An **embedded system** is a computing unit integrated into a larger mechanical or electrical system to perform a specific, well-defined function. The distinction from a general-purpose computer is intentional and architectural — not just a matter of form factor.

A laptop can run a browser, a game, a compiler, and a database simultaneously. An embedded controller running a brushless motor drive does one thing: it reads encoder feedback, computes a PID correction, and drives the PWM output — in under 50 microseconds, every cycle, without fail. If those technical words went over your head, that's the `uncomfortable foundation` you have to build over time.

That constraint is not a limitation. It's the design goal.

### Embedded vs. General-Purpose: The Practical Divide

| Property | General-Purpose | Embedded |
|---|---|---|
| Task scope | Broad, dynamic | Narrow, fixed |
| OS | Full OS (Linux, Windows) | RTOS or none |
| Boot time | Seconds to minutes | Milliseconds |
| RAM | GBs | KBs to MBs |
| Power budget | Watts to tens of watts | µW to mW (often) |
| Failure tolerance | Restart and recover | Must not fail |

The moment you accept that your system has a fixed job and a hard resource ceiling, every design decision follows from that.

---

## Key Characteristics

### Resource Constraints

You are not going to `malloc` your way through embedded development. On a typical microcontroller say, an ESP32 with 520 KB of SRAM and 4 MB of Flash, every byte has a cost. On an AVR ATmega328P, you have 2 KB of SRAM total. Two kilobytes. Not megabytes.

This changes how you write code:
```c
// Bad: dynamic allocation in an ISR or tight loop
uint8_t *buf = malloc(64);  // fragmentation, latency, potential NULL — avoid

// Good: static allocation with known lifetime
static uint8_t rx_buf[64];
```

Stack overflows don't throw exceptions in embedded, they corrupt memory silently, corrupt neighboring variables, and produce bugs that appear unrelated to the actual fault. You size stacks at design time and validate them with watermarking.

Flash is your program storage. Unlike RAM, writes are slow and the cell has a finite write endurance (typically 10,000–100,000 cycles). You don't write to flash arbitrarily or in simple terms cassually, you plan it. NVS (Non-Volatile Storage) abstractions like ESP-IDF's `nvs_flash` exist specifically to manage this.

### Real-Time Operation

"Real-time" does not mean fast. It means **deterministic** — the system must respond to an event within a guaranteed time window. Missing that window is a failure, even if the average response is excellent.

There are two classes:

- **Hard real-time**: Missing the deadline causes system failure. A pacemaker control loop, An anti-lock brake activation, A motor drive overcurrent cutoff, Airbag deployment systems in cars etc.
- **Soft real-time**: Missing the deadline degrades quality but doesn't fail the system. A display refresh, An MQTT keepalive, Audio playback buffering.

Most embedded systems you'll build are soft real-time in practice, but you should always reason about your worst-case latency — not your average.
```c
// FreeRTOS: fixed-period task using vTaskDelayUntil for deterministic timing
void sensor_task(void *pvParameters) {
    TickType_t xLastWakeTime = xTaskGetTickCount();
    const TickType_t xPeriod = pdMS_TO_TICKS(10); // 10 ms period

    while (1) {
        read_sensor_and_publish();
        vTaskDelayUntil(&xLastWakeTime, xPeriod); // deadline-aware delay
    }
}
```

`vTaskDelay` gives you "delay from now." `vTaskDelayUntil` gives you "delay until the next period boundary." The difference matters when your task body takes variable time.

### Peripherals: The Real Interface

Embedded code doesn't talk to files or sockets — it talks to **peripherals**. Peripherals are hardware blocks, either on the SoC itself or connected to it, that expose registers you read and write to control behavior.

The three communication buses you'll encounter constantly:

**I²C (Inter-Integrated Circuit)**
- Two wires: SDA (data), SCL (clock)
- Multi-device on a single bus via 7-bit addresses
- Slower (100 kHz standard, 400 kHz fast mode), but simple wiring
- Typical use: sensors (BME280, MPU6050), small displays (SSD1306)

```c
// ESP-IDF I2C read from a register
i2c_cmd_handle_t cmd = i2c_cmd_link_create();
i2c_master_start(cmd);
i2c_master_write_byte(cmd, (SENSOR_ADDR << 1) | I2C_MASTER_WRITE, true);
i2c_master_write_byte(cmd, REG_TEMP_MSB, true);
i2c_master_start(cmd);  // repeated start
i2c_master_write_byte(cmd, (SENSOR_ADDR << 1) | I2C_MASTER_READ, true);
i2c_master_read(cmd, data_buf, 2, I2C_MASTER_LAST_NACK);
i2c_master_stop(cmd);
i2c_master_cmd_begin(I2C_NUM_0, cmd, pdMS_TO_TICKS(100));
i2c_cmd_link_delete(cmd);
```

**SPI (Serial Peripheral Interface)**
- Four wires minimum: MOSI, MISO, SCLK, CS (chip select per device)
- Full-duplex, faster (up to tens of MHz)
- Typical use: flash chips, display controllers (ILI9341), high-speed ADCs, SD cards

```c
// ESP-IDF SPI write to a register
spi_transaction_t t;
memset(&t, 0, sizeof(t));
t.length = 8 * 2; // 2 bytes: register + value
t.tx_buffer = tx_buf; // tx_buf = {REG_TEMP_MSB, 0x01}
t.flags = SPI_TRANS_USE_DC; // data/command mode
spi_device_polling_transmit(spi, &t);
```

**UART (Universal Asynchronous Receiver/Transmitter)**
- Two wires: TX, RX
- Asynchronous — no shared clock, framing defined by baud rate
- Typical use: debug console, GPS modules, cellular modems, radar sensors like the LD2420
```c
// ESP-IDF UART read with timeout
uint8_t data[128];
int len = uart_read_bytes(UART_NUM_1, data, sizeof(data), pdMS_TO_TICKS(50));
if (len > 0) {
    process_frame(data, len);
}
```

Choosing the right bus is a hardware decision made at schematic time. By the time you're writing firmware, you're working with what's routed. Know the electrical constraints like pull-up resistor sizing on I²C, SPI mode (CPOL/CPHA), UART baud rate tolerance — before you debug a communication issue that's actually a hardware issue.

## Development Paradigms

### Bare-Metal

Bare-metal means no OS, no scheduler, no abstraction layer between your code and the hardware. You configure registers, handle interrupts directly, and write a main loop that runs forever.

```c
// Bare-metal GPIO toggle on an AVR (no HAL, no abstraction)
#include <avr/io.h>
#include <util/delay.h>

int main(void) {
    DDRB |= (1 << PB5);    // set PB5 as output via DDR register

    while (1) {
        PORTB |= (1 << PB5);   // set pin high
        _delay_ms(500);
        PORTB &= ~(1 << PB5);  // set pin low
        _delay_ms(500);
    }
}
```

No `digitalWrite`. No `pinMode`. You write to the Data Direction Register (`DDR`) and the Port register (`PORT`) directly. On ARM Cortex-M, you'd be writing to memory-mapped registers via addresses defined in vendor CMSIS headers.

Bare-metal is appropriate when:
- Your task is genuinely simple and single-threaded
- You need absolute determinism with no scheduler jitter
- You're on an 8-bit or 16-bit MCU too small for an RTOS
- You're writing a bootloader or startup code

The trade-off is that you write everything yourself — timing, state machines, debouncing, protocol parsing — without a framework catching your mistakes.

### RTOS (Real-Time Operating System)

An RTOS gives you a **preemptive scheduler** — a mechanism that interrupts running tasks and switches to higher-priority tasks on a fixed tick boundary. This is the mental model shift: instead of one big loop, you write independent tasks that each block on the thing they're waiting for.

```c
// FreeRTOS task structure — each task is its own thread of execution
void uart_rx_task(void *pvParameters) {
    uint8_t frame[256];

    while (1) {
        // Block here until data arrives — zero CPU usage while waiting
        int len = uart_read_bytes(UART_NUM_1, frame, sizeof(frame), portMAX_DELAY);
        if (len > 0) {
            xQueueSend(parse_queue, frame, 0);
        }
    }
}

void parse_task(void *pvParameters) {
    uint8_t frame[256];

    while (1) {
        // Block until the queue has an item
        if (xQueueReceive(parse_queue, frame, portMAX_DELAY) == pdTRUE) {
            parse_protocol_frame(frame);
        }
    }
}
```

Key RTOS primitives you'll use constantly:

| Primitive | Purpose |
|---|---|
| `xTaskCreate` / `xTaskCreatePinnedToCore` | Spawn a task with its own stack |
| `vTaskDelay` / `vTaskDelayUntil` | Yield CPU for a duration |
| `xQueueCreate` / `xQueueSend` / `xQueueReceive` | Pass data between tasks safely |
| `xSemaphoreCreateMutex` | Mutual exclusion for shared resources |
| `xSemaphoreCreateBinary` | Signal between a task and an ISR |
| `xEventGroupCreate` | Wait on combinations of events |

**Priority inversion** is the classic RTOS bug: a low-priority task holds a mutex that a high-priority task is waiting on, while a medium-priority task preempts the low-priority task, starving everyone. FreeRTOS's mutex implementation includes priority inheritance to mitigate this — understand it before you design your task graph.

On ESP32 specifically, `xTaskCreatePinnedToCore` lets you pin tasks to Core 0 or Core 1, which matters when you're sharing the radio stack (which runs on Core 0 by default) with your application logic or managing external rf module.

### Embedded Linux

Embedded Linux is a different category entirely. You're running a full Linux kernel — typically on application processors like the Allwinner A-series, NXP i.MX, or Raspberry Pi's BCM — with a proper MMU, virtual memory, and userspace.

This gives you:
- Full POSIX APIs, pthreads, standard C library
- Existing drivers for complex peripherals (USB, PCIe, GPU, camera ISP)
- Python, Node.js, containers — the whole userspace software stack
- Significantly longer boot times (seconds, not milliseconds)

The trade-off is real-time performance. The Linux kernel is not a real-time kernel by default. Interrupt latency is non-deterministic. For hard real-time workloads on Linux, you use the `PREEMPT_RT` patch or offload real-time tasks to a separate MCU co-processor (a common pattern in industrial systems — Linux handles the UI and cloud connectivity, an STM32 handles the control loop i.e. Arudno Uno Q). Well `ESP32-S3` can run embedded linux but with a massive asterisk: it’s a "because we can," not a "because we should" kind of project.

You choose Embedded Linux when your system needs to process significant data volumes, run ML inference, host a web interface, or integrate with complex software ecosystems that simply don't exist in the RTOS world.

## How to Think About All Three

The question is not "which paradigm is best?" — it's always about "what does my system actually need?"

A simple, single-sensor data logger on an ATtiny85: bare-metal, No question on why you should not consider Raspberry Pi 4/5, RTOS, or even ESP32  or whatever.

A multi-sensor IoT node doing MQTT, Wi-Fi, and local data buffering on an ESP32: FreeRTOS. The concurrency complexity of managing all of that in a superloop would be unmaintainable.

A vision-based inspection system running YOLOv8 on a Raspberry Pi CM4/Halio HAT and streaming results over Ethernet: Embedded Linux with userspace inference, and possibly an RP2040 co-processor handling the real-time I/O.

The paradigms exist on a spectrum. In practice, many systems combine them — a Linux host CPU communicating with a bare-metal or RTOS microcontroller over SPI, UART, or USB to handle the parts of the system that need determinism.
Over the upcomming years you will see that the line between embedded linux and RTOS is blurring with the advent of micro-linux distributions and real-time patches for linux kernel, more boards like Ventuno Q, Uno Q with STM32 on board.

## Where to Go From Here

This concludes the conceptual overview. From here, the rest of the Embedded Systems section dives deeper into the technical weeds.
If you're ready to start building, which you clearly are, having made it this far, I recommend spending some time with the ESP32 and FreeRTOS. It’s a fantastic entry point before you pivot to industrial heavyweights like the STM32, nRF52, or RP2040.
> Continue to this document to start building that `uncomfortable foundation`:
<br> **[How a digital signal actually travels from your C code to the physical world.](/docs/embedded-systems/gpio-from-code-to-cmos-voltage/)**.

<!-- - **[Memory Architecture in Microcontrollers](/docs/embedded/memory-architecture/)** — Flash, SRAM, stack vs. heap, linker scripts
- **[Interrupt Handling and ISR Design](/docs/embedded/interrupts/)** — NVIC, ISR constraints, deferred processing patterns
- **[FreeRTOS Task Design](/docs/embedded/freertos-tasks/)** — Stack sizing, priority assignment, watchdog integration
- **[UART Protocol Parsing](/docs/embedded/uart-parsing/)** — Frame detection, circular buffers, state machine parsers
- **[Peripheral Driver Architecture](/docs/embedded/driver-design/)** — Layered driver design, handle-based APIs, thread safety -->

> [!NOTE] The best embedded engineers are not the ones who memorize the most register names. They're the ones who understand the constraints, reason about failure modes, and write code that behaves correctly on the first power cycle and the ten-thousandth.

> Stay tuned & Be Curious!
