---
title: "C and C++ Coexist in ESP-IDF"
date: 2025-03-19
draft: false
description: "Mixing C and C++ in ESP-IDF is not required but necessity sometimes forces you to do it. Here's how to do it cleanly."
image: "/images/c_cpp_coexist_v2.svg"
categories: ["Embedded Systems"]
tags: ["cpp", "firmware", "compilation"]
readingTime: 8
---

## The Problem

You found a sensor driver written in C++. Your firmware is C. ESP-IDF supports both. Surely it just works?

Sometimes it does. Often it doesn't - and when it fails, the error messages are cryptic enough to send you down a two-hour rabbit hole.

This guide covers the practical patterns for mixing C and C++ in embedded firmware, with examples from ESP-IDF projects.

## Why the Mismatch Happens

C and C++ handle symbols differently. In C, a function called `sensor_init` becomes the symbol `sensor_init` in the object file. In C++, the same function becomes something like `_Z11sensor_initv` — this is called **name mangling**, and it exists to support function overloading.

When your C code tries to call a C++ function, the linker looks for `sensor_init` but finds `_Z11sensor_initv`. Linker error. Same problem in reverse.

## The Fix: `extern "C"`

The solution is the `extern "C"` linkage specifier. It tells the C++ compiler to use C-style naming (no mangling) for the wrapped declarations.

### Exposing a C++ driver to C code

In your C++ driver header (`sensor.h`):

```cpp
#ifdef __cplusplus
extern "C" {
#endif

// These functions can be called from C
void sensor_init(void);
int  sensor_read(float *temperature, float *humidity);
void sensor_deinit(void);

#ifdef __cplusplus
}
#endif
```

The `#ifdef __cplusplus` guards make the header valid in both C and C++ compilation units. When compiled as C++, `extern "C"` suppresses name mangling. When compiled as C, the guard is stripped and the declarations are plain C.

Your C++ implementation file (`sensor.cpp`) implements these normally:

```cpp
#include "sensor.h"
#include "MyDriverClass.hpp"

static MyDriverClass *driver = nullptr;

void sensor_init(void) {
    driver = new MyDriverClass();
    driver->begin();
}

int sensor_read(float *temperature, float *humidity) {
    if (!driver) return -1;
    *temperature = driver->getTemperature();
    *humidity    = driver->getHumidity();
    return 0;
}

void sensor_deinit(void) {
    delete driver;
    driver = nullptr;
}
```

Your C firmware calls it like any other C function:

```c
#include "sensor.h"

void app_main(void) {
    sensor_init();

    float temp, hum;
    if (sensor_read(&temp, &hum) == 0) {
        printf("Temp: %.1f°C  Humidity: %.1f%%\n", temp, hum);
    }

    sensor_deinit();
}
```

## ESP-IDF CMake Setup

In ESP-IDF, you need to tell CMake which files are C++ so they get compiled with `g++` instead of `gcc`.

In your component's `CMakeLists.txt`:

```cmake
idf_component_register(
    SRCS
        "sensor.cpp"       # C++ file
        "main.c"           # C file
    INCLUDE_DIRS
        "."
)

# Tell CMake that sensor.cpp is C++
set_source_files_properties(sensor.cpp PROPERTIES LANGUAGE CXX)
```

## Handling C++ Exceptions

By default, ESP-IDF disables C++ exceptions to save code space. If your C++ driver uses exceptions internally, you need to enable them in `sdkconfig`:

```
CONFIG_COMPILER_CXX_EXCEPTIONS=y
```

Or via `menuconfig`:
```
Compiler Options → Enable C++ Exceptions
```

If you can't enable exceptions (flash size constraints), wrap any exception-throwing code in a try/catch inside your `extern "C"` wrapper and convert to error codes:

```cpp
int sensor_init_safe(void) {
    try {
        driver = new MyDriverClass();
        driver->begin();
        return 0;
    } catch (const std::exception &e) {
        ESP_LOGE(TAG, "Init failed: %s", e.what());
        return -1;
    }
}
```

## Static Initialization Order

One subtle issue: C++ global objects (those constructed before `main()`) can have undefined initialization order across translation units. In embedded systems, this can mean a peripheral gets used before its constructor runs.

**Avoid global C++ objects with complex constructors.** Use the pattern shown above — a static pointer initialized explicitly in an `init` function. This gives you full control over construction order.

## The Golden Rule

Keep the C/C++ boundary as thin as possible. Write a clean C API (`init`, `read`, `deinit`) in `extern "C"` wrappers, implement the C++ complexity behind that wall, and let your C firmware remain blissfully unaware that there's a class hierarchy on the other side.

The thinner the boundary, the fewer surprises.

> Stay tuned & Be Curious!
