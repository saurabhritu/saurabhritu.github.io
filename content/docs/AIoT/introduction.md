---
title: "Introduction to AIoT"
date: 2025-01-15
draft: false
description: "What AIoT is, why it matters, and how edge AI changes the equation for embedded systems."
tags: ["aiot", "edge-ai", "iot"]
readingTime: 7
toc: true
---

## What is AIoT?

AIoT - Artificial Intelligence of Things is the convergence of AI algorithms with IoT infrastructure. Where traditional IoT devices collect data and send it to the cloud for processing, AIoT devices run inference locally, at the edge, on the device itself.

The shift matters for three reasons: **latency**, **bandwidth**, and **privacy**.

A cloud-dependent system must round-trip every inference. For a motion detection camera, that's hundreds of milliseconds too slow for real-time response. An edge model makes the decision in under 10ms, locally, with no network dependency.

## The Edge AI Stack

A typical AIoT device has four layers:

### 1. Sensors
Raw data comes from the physical world - cameras, microphones, IMUs, temperature sensors, radar modules (like the LD2420), gas sensors. The sensor layer determines what the system can perceive.

### 2. Microcontroller / SoC
The compute substrate. For lightweight inference, this might be an ESP32-S3 (with its vector instructions), a Cortex-M55 (with Helium SIMD), or a purpose-built NPU like the Kendryte K210. The MCU runs both the inference engine and the system firmware.

### 3. Inference Engine
The software layer that executes a trained neural network on the MCU. Common choices:

- **TensorFlow Lite for Microcontrollers** — Google's runtime, widely supported
- **Edge Impulse** — full pipeline from data collection to deployment
- **ONNX Runtime** — for larger Cortex-A class devices
- **Kenning** — Antmicro's open-source ML deployment framework

### 4. Application Logic
The firmware that acts on inference results - triggering actuators, sending alerts, logging events, managing power states.

## Model Quantization

Full-precision (float32) neural networks are too large and too slow for most microcontrollers. Quantization converts weights and activations to 8-bit integers (INT8), reducing model size by ~4x and inference time by 2–4x, with minimal accuracy loss.

```python
# TensorFlow Lite quantization example
converter = tf.lite.TFLiteConverter.from_saved_model(saved_model_dir)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.target_spec.supported_types = [tf.float16]
tflite_model = converter.convert()
```

For MCU deployment, full integer quantization (INT8 for both weights and activations) is usually required, since most Cortex-M cores lack hardware float support.

## A Practical Example: Presence Detection

The LD2420 radar sensor outputs raw I/Q data representing movement and presence. A traditional threshold-based approach works for simple cases but generates false positives from fans, HVAC airflow, and other non-human motion.

An AIoT approach trains a small classifier on labeled radar signatures - human presence, background motion, empty room - and runs it on the ESP32-S3. The result is dramatically fewer false positives, with inference running in under 5ms.

This is the core AIoT pattern: replace brittle threshold logic with a learned model, keep everything on-device, and use the cloud only for model updates and telemetry.

## Getting Started

The fastest path to a working AIoT prototype:

1. **Pick your hardware** — ESP32-S3 for WiFi-connected devices, Nordic nRF5340 for BLE, STM32H7 for higher-performance vision
2. **Collect labeled data** — Edge Impulse has a good data collection pipeline
3. **Train a small model** — start with a simple MLP or 1D CNN, not a transformer
4. **Quantize and deploy** — target INT8, verify accuracy doesn't degrade more than 2–3%
5. **Integrate with firmware** — wrap inference in a clean C API, call it from your application task

The barrier to entry has dropped dramatically in the last three years. A functional edge AI system is now a weekend project with the right tools.
