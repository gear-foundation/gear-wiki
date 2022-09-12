---
sidebar_label: WebAssembly (WASM)
sidebar_position: 6
---

# What is WebAssembly (WASM)

WebAssembly is a way to run applications in programming languages other than JavaScript as web pages. Essentially, WASM is just a virtual machine that runs on all modern browsers, but whereas in the past you were required to use JavaScript to run code in a web page, WASM makes it possible to run code in browsers with programming languages other than JavaScript.

The WebAssembly Virtual Machine, or WASM for short, is proven to be faster than any alternative virtual machine because of technology peculiarities. The use of WebAssembly enables Gear’s smart contracts to compile directly into machine code and run at near-native speeds. Higher speeds means lower transaction costs and higher efficiency.

All Gear programs and smart-contract are run as WebAssembly programs. This means for example, that developers can bring their applications to the web and achieve full performance with the apps’ full set of capabilities - that they’d typically have when running native on Windows or Mac - in a web browser. The developers won’t actually have to write the WASM code directly either. Instead, they’d use WASM as a compilation target for programs written in other languages.

The main problem that WASM solves is the inability to use programming languages other than JavaScript on the web. Although JavaScript is a great programming language, it wasn’t designed to be super fast in large applications. What’s game changing about WASM is that it brings the performance of native applications, written in other programming languages,  to the web in a way that's completely secure.

WASM should give significant speed increases in two main areas. First, it should significantly increase application start up speed. In fact, applications that are already using WASM have been able to cut application start up time in half, and as more optimizations are made, it will only continue to increase startup speed further. This will allow huge applications to load up very, very quickly. Secondly, WASM enables significant benefits in throughput too, which means that once code is compiled, it will run much faster - making applications more efficient and responsive which will significantly improve user experience.

WebAssembly has the following advantages:

 - WASM is extremely fast, efficient and portable. Code can be executed at near-native speed across different platforms.

 - WASM is also readable and debuggable. Although WebAssembly is a low-level language, it does have a human-readable text format that allows code to be written, viewed and debugged by hand.

 - It’s also extremely secure as it’s run in a safe, sandboxed environment and like other web code, it will enforce the browsers same-origin and permissionless security policies.

WASM format allows Gear’s developers write applications in Rust today along with C#/C++, Go, and Javascript in the future.