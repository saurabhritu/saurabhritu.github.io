---
title: "Advanced Markdown Features"
description: "Demonstrating Syntax Highlighting, LaTeX, Diagrams, and Shortcodes inspired by Hextra."
date: 2024-03-17
---

## 1. Syntax Highlighting

```python {filename="inference.py" hl_lines=[3]}
import torch

def predict(model, input):
    # This line is highlighted
    return model(input)
```

## 2. LaTeX Mathematical Equations

Example of an inline equation: \( E = mc^2 \).

Example of a block equation:
$$
\int_{a}^{b} x^2 dx = \frac{1}{3}(b^3 - a^3)
$$

## 3. Diagrams with Mermaid.js

```mermaid
graph TD
    A[Start] --> B{Is it AI?}
    B -- Yes --> C[Edge Inference]
    B -- No --> D[Embedded Control]
    C --> E[AIoT Product]
    D --> E
```

## 4. Custom Shortcodes

### Callouts
{{% callout type="info" %}}
This is an information box. It uses a blue left border.
{{% /callout %}}

{{% callout type="warning" %}}
Be careful! This is a warning message.
{{% /callout %}}

{{% callout type="error" %}}
Critical failure! Something went wrong.
{{% /callout %}}

### Interactive Cards
{{< cards >}}
  {{< card title="Robotics" icon="🤖" link="/docs/robotics" >}}
  Learn about autonomous machines.
  {{< /card >}}
  {{< card title="AIoT" icon="⚡" link="/docs/aiot" >}}
  Explore the future of connected intelligence.
  {{< /card >}}
{{< /cards >}}

### Collapsible Details
{{% details title="Click to reveal technical details" %}}
Here is some hidden content that is only visible when expanded.
- Item 1
- Item 2
{{% /details %}}

## 5. Alerts

> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.

## Images

![protocols](/images/embedded_protocols.svg)

<img src="/images/embedded_protocols.svg" alt="protocols" width="400" height="400">

