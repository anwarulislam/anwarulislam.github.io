# Anwarul Islam

Senior Frontend Engineer

Dhaka, Bangladesh

[anwar.bd](https://anwar.bd)  |  [github.com/anwarulislam](https://github.com/anwarulislam)  |  [linkedin.com/in/anwaarulislaam](https://www.linkedin.com/in/anwaarulislaam/)

Frontend and product engineer with 8+ years of experience. Built a React and TypeScript editor for generative media at ImagineArt, refactored real-time workspace state at Hoppscotch, and published a native macOS utility for Raycast.

## Professional Experience

### [Hoppscotch](https://hoppscotch.com/) | Product Engineer | Mar 2022 - Present

Full-time Remote. Open-source API platform with [81K GitHub stars](https://github.com/hoppscotch/hoppscotch).

- Consolidated workspace sync for collections, environments, request history, and settings into a shared layer for the web and desktop clients. Removed duplicate platform code and wired the shared state to GraphQL queries, mutations, and subscriptions. [Sync refactor](https://github.com/hoppscotch/hoppscotch/pull/6334)
- Refactored the Vue and TypeScript real-time API workspace for WebSocket, SSE, Socket.IO, and MQTT, separating connection and message handling from the views. [Real-time refactor](https://github.com/hoppscotch/hoppscotch/pull/2228)
- Fixed a startup race where requests could run before proxy settings loaded, while preserving request cancellation. Added unit tests for authentication helpers covering API keys, OAuth 2.0, and other auth methods. [Startup fix](https://github.com/hoppscotch/hoppscotch/pull/6333)  |  [Unit tests](https://github.com/hoppscotch/hoppscotch/pull/5211)
- Implemented the initial client and server paths for mock servers as part of the team launch. Followed up with sample requests and the option to save mock URLs as environment variables. [Release notes](https://hoppscotch.com/releases/release-notes-v2025-11-0)

### [ImagineArt](https://www.imagine.art/) | Senior Frontend Engineer | 2025 - Jul 2026

Full-time, remote. Contractually consulting Hoppscotch during the concurrent role.

- Built the frontend for [ImagineArt Workflows](https://www.imagine.art/workflow), a node-based editor for building image and video generation pipelines, using React, Next.js, TypeScript, and React Flow.
- Implemented interactive crop, levels, and filter controls, video trimming and frame extraction, plus AI resize and relight nodes in the graph.
- Made video previews load on hover to avoid eagerly loading video assets across the canvas. Integrated Brand Kit and Moodboard references into the editor so creators could reuse assets in their workflows.
- Built a keyboard-first command palette with fuzzy search for finding and inserting nodes and presets without leaving the canvas.

### [10 Minute School](https://10minuteschool.com/) | Software Engineer (Full-time) | Apr 2018 - Mar 2022

- Led the move from WordPress to a modular Angular app with lazy-loaded routes and PWA support. Built server-rendered pages with Angular Universal and Next.js.
- Built live-class comments, interactive SmartBooks, and a Node.js and Puppeteer service for PDF course certificates.

## Selected Open Source Work

### [Raycast](https://www.raycast.com/anwarulislam) | Extension Creator and Contributor | macOS

- Built [Ruler](https://github.com/raycast/extensions/pull/7255/files), a screen-measurement tool with a magnifier and Swift/AppKit overlay invoked from React and TypeScript ([45K+ extension installs](https://www.raycast.com/anwarulislam/ruler)).
- Added a selected-text action to [Google Gemini](https://github.com/raycast/extensions/pull/16744/files) ([90K+ installs](https://www.raycast.com/EvanZhouDev/raycast-gemini)) and an opt-in clipboard setting with native temporary-file capture to [ScreenOCR](https://github.com/raycast/extensions/pull/12479/files) ([66K+ installs](https://www.raycast.com/huzef44/screenocr)).
- Co-developed a Swift and TypeScript command that extracts a palette from a selected image in [Color Picker](https://github.com/raycast/extensions/pull/17054) ([656K+ installs](https://www.raycast.com/thomas/color-picker)).

### [OpenCut](https://opencut.app/) | Contributor | Browser video editor

- Ranked [third on the official contributor roster](https://opencut.app/contributors) with 53 contributions. The [OpenCut repo](https://github.com/OpenCut-app/OpenCut) has 99.3K GitHub stars.
- Built [timeline snapping](https://github.com/OpenCut-app/OpenCut/pull/266) and [ripple editing](https://github.com/OpenCut-app/OpenCut/pull/279) in React and TypeScript; both merged into staging. [Track-label scroll sync](https://github.com/OpenCut-app/OpenCut/pull/188) and [timeline resizing](https://github.com/OpenCut-app/OpenCut/pull/220) merged into main.

### [Flameshot](https://github.com/flameshot-org/flameshot) | Contributor | Cross-platform screenshot tool

- Moved General to the first tab in the C++/Qt settings window. [Merged pull request](https://github.com/flameshot-org/flameshot/pull/3655)  |  [31.7K GitHub stars](https://github.com/flameshot-org/flameshot)

## Earlier Experience

### [10 Minute School](https://10minuteschool.com/) | Frontend Engineering Consultant | Mar 2022 - May 2024

- Advised engineers on frontend architecture, rendering performance, and component reuse after leaving the full-time role.

### [Codementor](https://www.codementor.io/) | Technical Mentor | Jul 2023 - Dec 2024

- Coached developers in TypeScript, React, Vue, and Angular, including sessions helping an AstroLabs cohort structure and debug an Angular application.

### [Banglalink](https://www.banglalink.net/en) | Contract Web Development

- Contributed to the public website for Banglalink, one of Bangladesh’s largest mobile network operators.

## Technical Skills

Frontend and state  TypeScript, JavaScript, React, Next.js, React Flow, Vue, Angular, Zustand, Redux, RxJS

Testing and APIs  Vitest, Jest, GraphQL, REST, WebSocket, SSE, Socket.IO, MQTT, Node.js

Desktop and media  Swift, AppKit, Raycast API, MediaStream, MediaRecorder, Web Audio API
