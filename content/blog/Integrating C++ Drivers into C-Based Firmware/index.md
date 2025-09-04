---
title: Integrating C++ Drivers into C-Based Firmware
date: 2025-09-04T12:00:00+05:30
# images: ["/images/temp/c_cpp_wrapper.png"]
# featured_image: ["/images/temp/c_cpp_wrapper.png"]
# thumbnail: ["/images/temp/c_cpp_wrapper.png"]
authors:
  - name: Saurabh Ritu
    link: https://github.com/saurabhritu
    image: https://github.com/saurabhritu.png

categories: ["c_cpp", "firmware", "driver"]
tags: ["c", "c++", "sesnor"]
genres: ["solution"]

excludeSearch: true
draft: false
---

<!-- ![images](/images/temp/c_cpp_wrapper.png) -->

<img src="/images/temp/c_cpp_wrapper.png" alt="C_CPP_Wrapper" height="50%" width="50%">

### Story
Imagine this scenario: you are working on a firmware project written entirely in C. Midway through development, your team finds a new sensor that is 10× cheaper than the current one. Naturally, management wants it integrated into the next hardware version.

Here’s the catch — the official driver for this sensor is only available in C++.

Now, instead of rewriting the entire driver in C (which is time-consuming and error-prone), you can integrate the C++ driver into your C-based firmware with minimal changes.

There are a couple of ways to achieve this quickly.

### 1. Expose C++ classes as a c API ( Recommended )
Since C does not understand C++ classes, we can build a C wrapper around the C++ code.

This approach works by providing extern "C" functions that operate on opaque pointers to C++ objects. Opaque pointers allow us to manage class instances in C without exposing their internal structure.

Let’s look at the project structure:

{{< filetree/container >}}
  {{< filetree/folder name="test_c_wrapper" >}}
    {{< filetree/file name="Driver.hpp" >}}
    {{< filetree/file name="Driver.cpp" >}}
    {{< filetree/file name="Driver_C_Wrapper.h" >}}
    {{< filetree/file name="Driver_C_Wrapper.cpp" >}}
    {{< filetree/file name="main.c" >}}
    {{< filetree/file name="CMakeLists.txt" >}}
  {{< /filetree/folder >}}
{{< /filetree/container >}}

This wrapper creates new C++ class instances, exposes them as opaque pointers, and provides simple C functions that forward calls to the underlying C++ methods.

below you can find the actual code related to all this files.

```cpp {filename=Driver.hpp}
#pragma once
#include <string>

class Driver {
public:
    Driver(const std::string &name);
    ~Driver();

    void sayHello();
private:
    std::string name_;
};
```

```cpp {filename=Driver.cpp}
#include "Driver.hpp"
#include <iostream>

Driver::Driver(const std::string &name) : name_(name) {}

Driver::~Driver() {}

void Driver::sayHello() {
    std::cout << "Hello, " << name_ << "!" << std::endl;
}
```

```c {filename=Driver_C_Wrapper.h}
#pragma once

#ifdef __cplusplus
extern "C" {
#endif

// Use opaque pointer for the class
typedef void* DriverHandle;

DriverHandle Driver_create(const char* name);
void Driver_destroy(DriverHandle obj);
void Driver_sayHello(DriverHandle obj);

#ifdef __cplusplus
}
#endif
```

```cpp {filename=Driver_C_Wrapper.cpp}
#include "Driver.hpp"
#include "Driver_C_Wrapper.h"

extern "C" {

DriverHandle Driver_create(const char* name) {
    return new Driver(name);
}

void Driver_destroy(DriverHandle obj) {
    delete static_cast<Driver*>(obj);
}

void Driver_sayHello(DriverHandle obj) {
    static_cast<Driver*>(obj)->sayHello();
}

}
```

```c {filename=main.c}
#include "Driver_C_Wrapper.h"

int main() {
    DriverHandle obj = Driver_create("Saurabh");
    Driver_sayHello(obj);
    Driver_destroy(obj);
    return 0;
}
```

```cmake {filename=CMakeLists.txt}
cmake_minimum_required(VERSION 3.10)
project(test C CXX)

set(CMAKE_C_STANDARD 99)
set(CMAKE_CXX_STANDARD 11)

# Create library from C++ code
add_library(Driver STATIC
    Driver.cpp
    Driver_C_Wrapper.cpp
)

# Main C program
add_executable(main main.c)

# Link C++ library into C program
target_link_libraries(main PRIVATE Driver)
```

### 2. Compile C code with a C++ Compiler

If your project is mostly C but you can switch the compiler (for example, .c files compiled as C++), then you don’t need wrappers.
Just rename .c files to .cpp (or use g++/clang++ with -x c++) and include your class directly.

> For example, you can rename .c files to .cpp (or tell the compiler to treat them as C++ using flags like -x c++) and then include the C++ driver headers directly.

> [!WARNING]
> But this can break compatibility if the C code uses constructs not valid in C++ (implicit void* conversions, different keywords, etc.).