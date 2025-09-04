---
title: sample
date: 2025-08-06T11:49:46-07:00
authors:
  - name: Saurabh Ritu
    link: https://github.com/saurabhritu
    image: https://github.com/saurabhritu.png

categories: ["example"]
tags: ["ref"]
genres: ["tutorial"]
series: ["get-started"]

excludeSearch: true
draft: true
---

In this blog, I am going to show you sample examples for adding content. </br>
These are the basic and generic method whcih is frequently used by most blog contents. </br>

These are code snipet format.

>[!NOTE]
> use index.md in place of _index.md to render toc in blogs and other content.

<code> pkg update && pkg upgrade </code>

``` g++ main.cpp -o main ```

```cpp {filename=main.cpp}
    int main(){
        cout<<"Hello World!"<<endl;
        return 0;
    }
```

> Helllo World!

{{% steps %}}

### Step 1

This is the first step.

### Step 2

This is the second step.

### Step 3

This is the third step.

{{% /steps %}}

{{% details title="Details" closed="true" %}}

This is the content of the details.

Markdown is **supported**.

{{% /details %}}

{{< tabs items="JSON,YAML,TOML" >}}

  {{< tab >}}**JSON**: JavaScript Object Notation (JSON) is a standard text-based format for representing structured data based on JavaScript object syntax.{{< /tab >}}
  {{< tab >}}**YAML**: YAML is a human-readable data serialization language.{{< /tab >}}
  {{< tab >}}**TOML**: TOML aims to be a minimal configuration file format that's easy to read due to obvious semantics.{{< /tab >}}

{{< /tabs >}}

> [!TIP]
> Useful Information

> [!WARNING]
> this is warning

<br>

{{< callout type="info" >}}
  Callout is used to grab attention.
{{< /callout >}}

{{% jupyter "test.ipynb" %}}

| Syntax    | Description |
| --------- | ----------- |
| Header    | Title       |
| Paragraph | Text        |

