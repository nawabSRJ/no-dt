# no-dt

![npm version](https://img.shields.io/npm/v/no-dt)
![license](https://img.shields.io/npm/l/no-dt)
![downloads](https://img.shields.io/npm/dm/no-dt)

A lightweight JavaScript library that detects and blocks browser developer tools access to enhance security for sensitive web pages.

## Why no-dt?

Web applications handling sensitive operations like payments, authentication, or confidential data are vulnerable to client-side manipulation through browser developer tools. While dev tools are essential for development, they can be exploited by malicious users to:

- Modify payment amounts or transaction data
- Bypass client-side authentication checks
- Manipulate form submissions and API requests
- Extract sensitive information from the DOM
- Reverse engineer application logic

**no-dt** provides an additional security layer by detecting when users attempt to access developer tools and taking preventive actions.

## Key Features

- 🛡️ **Real-time Detection** - Monitors for dev tools opening attempts
- ⚡ **Lightweight** - Minimal performance impact on your application
- 🔧 **Framework Agnostic** - Works with vanilla JS, React, Next.js, and more
- 📱 **Cross-Browser** - Compatible with Chrome, Firefox, Safari, and Edge
- 🎯 **Configurable** - Customizable detection sensitivity and response actions
- 📦 **TypeScript Ready** - Full TypeScript support with type definitions

## Security Notice

> **Important**: This library provides client-side protection and should be used as part of a layered security approach. Always implement proper server-side validation and security measures as your primary defense.

## Getting Started

First, install the package:

```bash
npm install no-dt
# or
yarn add no-dt
# or
pnpm add no-dt
# or
bun add no-dt