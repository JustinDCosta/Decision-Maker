# 3D Lucky Decider

Welcome to the **Lucky Decider**, a beautifully designed, 3D interactive decision maker built entirely with HTML, CSS, and JavaScript.

If you ever find yourself struggling to make a choice, let the Lucky Decider take the wheel! With a satisfying pull of the virtual slot-machine lever, this web app uses true, cryptographically secure randomness to give you a definitive answer.

## ✨ Features

- **Modern Casino Vibe**: A sleek dark mode design with neon lights, glowing elements, and a classic scanline screen window.
- **3D Interactive Lever**: Click the animated slot machine lever on the right to spin the wheel. It pulls down and pops back up with a satisfying click!
- **Cryptographically Secure Randomness**: We don't rely on basic `Math.random()`. The Lucky Decider uses the `crypto.getRandomValues()` API to ensure the fairness of your results.
- **Customizable Options**: 
  - Choose between **2 Options** (Yes/No) or **3 Options** (Yes/No/Maybe).
- **Spin Modes**:
  - **Single Spin**: Quick, one-off answer.
  - **Best of 3**: Automatically spins three times and mathematically decides the overall winner based on the results.
- **History Tracker**: A handy ledger on the side keeps track of all past spins so you don't lose your previous results, complete with a "Clear History" button.

## 🛠️ Project Structure

The project has been separated into distinct files for easier maintenance and cleaner architecture:
- `index.html`: The structure and layout.
- `styles.css`: The 3D aesthetics, styling, and animations.
- `script.js`: The underlying logic, randomness generator, and interaction functions.

## 🚀 How to Run

1. Clone or download this repository.
2. Open `index.html` in your favorite modern web browser.
3. No build tools or servers are required!

Enjoy spinning the wheel, and good luck!
