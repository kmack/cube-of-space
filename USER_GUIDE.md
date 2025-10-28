# Cube of Space - User Guide

Welcome to the **Cube of Space**, an interactive 3D visualization of the Qabalistic/Tarot geometric model. This guide will help you navigate and interact with the application using various input methods.

**Access the application at:** [https://cube-of-space.vercel.app/](https://cube-of-space.vercel.app/)

---

## Table of Contents

1. [Overview](#overview)
2. [Desktop Controls (Mouse & Keyboard)](#desktop-controls-mouse--keyboard)
3. [Touch Controls (Mobile/Tablet)](#touch-controls-mobiletablet)
4. [Gamepad Controls](#gamepad-controls)
5. [Interactive Controls Panel](#interactive-controls-panel)
6. [Understanding the Visualization](#understanding-the-visualization)

---

## Overview

The Cube of Space is a 3D interactive model that maps:
- **Faces** - The 6 "Double" letters (planetary associations)
- **Edges** - The 12 "Simple" letters (zodiacal associations)
- **Axes** - The 3 "Mother" letters (elemental associations)
- **Diagonals** - The 4 "Final" letters
- **Center** - Tav/Saturn/The World

You can rotate, zoom, pan, and customize the visualization using mouse, touch, or gamepad controls.

---

## Desktop Controls (Mouse & Keyboard)

### Mouse Controls

| Action | Control |
|--------|---------|
| **Rotate View** | Left-click and drag |
| **Pan (Move)** | Right-click and drag |
| **Zoom In/Out** | Mouse scroll wheel |
| **Reset Camera** | Double-click anywhere on the canvas |

### Keyboard Controls

Currently, the application uses an interactive control panel (Leva controls) for toggling features. Access the control panel by clicking the controls icon in the top-right corner of the screen.

---

## Touch Controls (Mobile/Tablet)

### Single Touch
| Action | Control |
|--------|---------|
| **Rotate View** | Single-finger drag |
| **Reset Camera** | Double-tap anywhere on the canvas |

### Two-Finger Gestures
| Action | Control |
|--------|---------|
| **Zoom In/Out** | Pinch gesture (two-finger spread/pinch) |
| **Pan (Move)** | Two-finger drag |

**Note:** Touch controls use the same OrbitControls system as desktop, optimized for mobile performance with reduced particle counts and appropriate device pixel ratios.

---

## Gamepad Controls

The application fully supports Xbox-style gamepad controllers (Xbox, PlayStation, or compatible gamepads using standard button mapping).

### Analog Sticks

| Control | Function |
|---------|----------|
| **Left Stick (Horizontal/Vertical)** | Pan the view in screen space |
| **Right Stick (Horizontal/Vertical)** | Rotate the camera around the cube |
| **Left Stick Press (L3)** | Reset pan position (target returns to origin) |
| **Right Stick Press (R3)** | Reset entire camera view to default position |

### Triggers

| Control | Function |
|---------|----------|
| **Left Trigger (LT)** | Zoom out |
| **Right Trigger (RT)** | Zoom in |

### Face Buttons

| Button | Function |
|--------|----------|
| **A Button** | Toggle energy flow visibility on/off |
| **B Button** | Toggle double-sided labels on/off |
| **Y Button** | Cycle axis flow direction (center-to-faces ↔ directional) |

### D-Pad

| Direction | Function |
|-----------|----------|
| **D-Pad Up** | Toggle Mother Letters (elemental axes) visibility |
| **D-Pad Right** | Toggle Double Letters (face labels) visibility |
| **D-Pad Down** | Toggle Simple Letters (edge labels) visibility |
| **D-Pad Left** | Toggle Final Letters (diagonal labels) visibility |

### Bumper Buttons

| Button | Function |
|--------|----------|
| **Left Bumper (LB)** | Toggle face visibility on/off |
| **Right Bumper (RB)** | Toggle face opacity (transparent ↔ opaque) |

### Gamepad Settings

The control panel includes adjustable gamepad settings:
- **Rotation Speed** (1.0 - 20.0): How fast the camera rotates with right stick
- **Zoom Speed** (0.5 - 10.0): How fast the camera zooms with triggers
- **Pan Speed** (0.5 - 8.0): How fast the view pans with left stick
- **Rotation Curve** (1.0 - 4.0): Response curve for rotation (higher = more exponential feel)

**Note:** Gamepad controls feature exponential response curves for precise small movements and fast large movements, with automatic deadzone handling for stick drift prevention.

---

## Interactive Controls Panel

Click the **controls icon** (top-right corner) to open the interactive control panel. This panel allows you to customize the visualization:

### Letters Section

| Control | Description |
|---------|-------------|
| **Mother Letters** | Show/hide the 3 elemental axis labels (Aleph, Mem, Shin) |
| **Double Letters** | Show/hide the 6 planetary face labels |
| **Simple Letters** | Show/hide the 12 zodiacal edge labels |
| **Final Letters** | Show/hide the 4 diagonal labels |
| **Double-Sided Labels** | Toggle whether labels are visible from both sides |
| **Show Color Borders** | Toggle colored borders around labels based on Tarot associations |

### Faces Section

| Control | Description |
|---------|-------------|
| **Show Faces** | Toggle visibility of colored cube faces |
| **Opaque Faces** | Switch between transparent (0.8 opacity) and fully opaque faces |

### Axes Section

| Control | Description |
|---------|-------------|
| **Show Axis Lines** | Display the three elemental axis lines |
| **Show Diagonal Lines** | Display the four diagonal lines through the cube |
| **Show Edge Positions** | Display position labels for the 12 edges |

### Energy Flow Section

| Control | Description |
|---------|-------------|
| **Show Energy Flow** | Toggle animated particle effects along edges and axes |
| **Axis Flow Direction** | Choose between "Center to Faces" or "Directional Flow" |

#### Energy Flow Effects (Sub-section)

| Control | Range | Description |
|---------|-------|-------------|
| **Speed** | 0.1 - 3.0 | Animation speed of energy particles |
| **Opacity** | 0.1 - 1.0 | Visibility strength of energy particles |
| **Particles** | 10 - 50 | Number of particles per flow path |

### Gamepad Section

Customize gamepad sensitivity and behavior (see [Gamepad Controls](#gamepad-controls) for details).

### Debug Section

| Control | Description |
|---------|-------------|
| **Show Ground Grid** | Display a grid plane below the cube for spatial reference |
| **Show Axes Helper** | Display RGB axes helper (X=red, Y=green, Z=blue) |

---

## Understanding the Visualization

### Hebrew Letters and Tarot Associations

The cube maps the 22 Hebrew letters to geometric elements:

- **3 Mother Letters** (Elemental): Aleph (Air), Mem (Water), Shin (Fire) - shown as three perpendicular axes
- **7 Double Letters** (Planetary): Mapped to the 6 cube faces plus the center (Saturn/Tav)
- **12 Simple Letters** (Zodiacal): Mapped to the 12 edges of the cube
- **4 Final Letters**: Mapped to the 4 body diagonals through the cube's interior

### Color System

Each element is color-coded based on its Tarot card association (defined in the Rider-Waite-Smith tradition). Face colors correspond to planetary Tarot cards, and label borders reflect these associations.

### Energy Flows

Animated particles show energy movement through the geometric structure:
- **Edge flows**: Travel along the 12 edges
- **Axis flows**: Travel along the 3 elemental axes (configurable direction)
- **Diagonal flows**: Travel along the 4 body diagonals

### Performance Optimizations

The application automatically adjusts for device capabilities:
- **Mobile devices**: Reduced particle counts and lower DPI for better performance
- **Idle detection**: Animations pause when you're inactive to save resources
- **Page visibility**: Animations pause when the tab is in the background

---

## Tips for Best Experience

1. **Start with a reset**: Double-click/double-tap to reset the camera to the default view
2. **Explore layer by layer**: Toggle different letter groups on/off to study each layer independently
3. **Energy flow study**: Turn off faces and enable energy flows to see the geometric patterns clearly
4. **Mobile performance**: If experiencing lag on mobile, reduce the particle count in Energy Flow > Effects
5. **Gamepad precision**: Adjust the Rotation Curve setting to find your preferred balance between precision and speed
6. **Learn the structure**: Use the edge position labels and axes helper while learning the cube's geometry

---

## Troubleshooting

**Issue**: Gamepad not working
**Solution**: Ensure your gamepad is connected before opening the application. Press any button to wake it if needed.

**Issue**: Performance is slow on mobile
**Solution**: Open the controls panel and reduce the particle count in Energy Flow > Effects. You can also disable energy flows entirely for maximum performance.

**Issue**: Labels are hard to read
**Solution**: Toggle "Double-Sided Labels" on, or rotate the view so labels face toward you. You can also disable "Show Color Borders" for cleaner text.

**Issue**: Camera is stuck or behaving strangely
**Solution**: Double-click (or double-tap on mobile) to reset the camera, or press the Right Stick (R3) on your gamepad.

---

## Technical Requirements

- **Modern web browser** with WebGL support (Chrome, Firefox, Safari, Edge)
- **JavaScript enabled**
- **For gamepad support**: HTML5 Gamepad API compatible browser
- **Mobile**: iOS Safari, Chrome for Android, or other modern mobile browsers

---

## Credits

Built with React, TypeScript, Three.js, React Three Fiber, and Leva controls.

Based on the traditional Qabalistic "Cube of Space" model with Tarot and Hebrew letter correspondences.

---

**Explore the sacred geometry and discover the relationships between the Hebrew alphabet, Tarot, astrology, and the structure of space itself.**

Visit: [https://cube-of-space.vercel.app/](https://cube-of-space.vercel.app/)
