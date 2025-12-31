## 1. What this app is (AutoCodeGen-AI-SDV-Architect)

**AutoCodeGen-AI-SDV-Architect** is a **web-based Generative AI demo** designed for **Software Defined Vehicles (SDV)**.

### Purpose

The app demonstrates how **Generative AI can accelerate SDV software development** by:

* Generating **system requirements**
* Creating **SoA / SDV architecture designs**
* Producing **source code stubs**
* Visualizing **system diagrams**
* Simulating SDV behavior (conceptually)

It aligns with your **GenAI for SDV case study** and is suitable for demos using simulators like **CARLA** (conceptually).

---

## 2. Tech Stack Used

From the project structure:

* **Frontend Framework:** React + TypeScript
* **Build Tool:** Vite
* **AI Integration:** Google Gemini API
* **UI Components:**

  * `DiagramViewer.tsx` → Architecture / flow visualization
  * `SimulationView.tsx` → SDV behavior simulation view
* **Service Layer:**

  * `geminiService.ts` → Handles GenAI calls
* **Config Files:**

  * `vite.config.ts`
  * `tsconfig.json`
  * `package.json`

This is a **frontend-only AI demo app** (no backend server required).

---

## 3. Folder Structure (Simplified)

```
AutoCodeGen-AI-SDV-Architect-main/
│
├── components/
│   ├── DiagramViewer.tsx
│   └── SimulationView.tsx
│
├── services/
│   └── geminiService.ts
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── types.ts
```

---

## 4. How to Run This App (Step-by-Step)

### Step 1: Extract the ZIP

Unzip the file:

```
AutoCodeGen-AI-SDV-Architect-main.zip
```

Open the extracted folder in **VS Code**.

---

### Step 2: Install Node.js (if not installed)

Check version:

```bash
node -v
npm -v
```

Required:

* Node.js **v18 or above**

Download if needed:
[https://nodejs.org](https://nodejs.org)

---

### Step 3: Install Dependencies

Open **VS Code Terminal** (`Ctrl + ~`) and run:

```bash
npm install
```

This installs React, Vite, TypeScript, etc.

---

### Step 4: Configure Gemini API Key

Open:

```
services/geminiService.ts
```

Look for something like:

```ts
const API_KEY = "YOUR_API_KEY";
```

Replace with your **Google Gemini API key**:

```ts
const API_KEY = "AIzaSyXXXXXX";
```

⚠️ For production, use `.env`, but this is fine for a demo.

---

### Step 5: Start the Development Server

Run:

```bash
npm run dev
```

You’ll see output like:

```
Local: http://localhost:5173/
```

---

### Step 6: Open in Browser

Open:

```
http://localhost:5173
```

🎉 Your SDV GenAI app is now running.

---

## 5. What You Can Demo in This App

* Enter **SDV feature prompts** (e.g., ACC, Pedestrian Detection)
* Generate **architecture diagrams**
* Visualize **SoA components**
* Simulate SDV workflows
* Show **AI-generated design + logic**

Example prompt:

```
Generate Level 3 Adaptive Cruise Control with Pedestrian Detection
```

---

## 6. Common Errors & Fixes

### ❌ `npm not recognized`

✔ Install Node.js and restart VS Code

### ❌ Blank screen

✔ Check browser console
✔ Verify Gemini API key

### ❌ Port already in use

✔ Run:

```bash
npm run dev -- --port 3000
```

---

## 7. Perfect Use Case for You

Given your background in:

* Web development
* GenAI
* SDV / Automotive case studies

👉 This app is **ideal for hackathons, academic demos, and interviews**.

---

If you want, I can:

* Add **CARLA integration**
* Convert this into a **desktop app**
* Add **code generation for C++ / AUTOSAR**
* Create **test-case generation**

Just tell me 👍

