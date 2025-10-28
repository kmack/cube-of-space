# Cube of Space

An interactive 3D visualization of the Qabalistic "Cube of Space" - a geometric model mapping Hebrew letters, Tarot keys, and astrological correspondences onto a three-dimensional cube structure.

**Live Demo**: [https://cube-of-space.vercel.app/](https://cube-of-space.vercel.app/)

**Repository**: [https://github.com/kmack/cube-of-space](https://github.com/kmack/cube-of-space)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Project Structure](#project-structure)
- [Controls](#controls)
- [Contributing](#contributing)
- [License & Attribution](#license--attribution)

---

## Features

### Interactive 3D Visualization
- **Real-time 3D rendering** using React Three Fiber and Three.js
- **Interactive camera controls** with OrbitControls (rotate, pan, zoom)
- **Customizable UI** with Leva controls panel for toggling features

### Qabalistic Mapping
- **Hebrew Letters**: 22 Hebrew letters mapped to geometric elements
  - 3 Mother Letters (Aleph, Mem, Shin) → Axes (elemental)
  - 7 Double Letters → Faces (planetary)
  - 12 Simple Letters → Edges (zodiacal)
  - 4 Final Letters → Diagonals
- **Tarot Associations**: Each letter linked to corresponding Tarot keys
- **Astrological Correspondences**: Planetary and zodiacal symbols

### Visual Features
- **Color-coded faces** based on Tarot card associations
- **Animated energy flows** along edges, axes, and diagonals
- **Rich labels** with Hebrew characters, Tarot names, and astrological symbols
- **Double-sided labels** for better visibility from all angles
- **Responsive design** optimized for desktop and mobile devices

### Control Options
- **Mouse/Keyboard**: Standard 3D navigation controls
- **Touch**: Full touch gesture support (pinch, pan, rotate) for mobile/tablet
- **Gamepad**: Complete Xbox-style controller support for navigation and feature toggling
- **Double-click/tap**: Reset camera to default view

### Performance Optimizations
- **Mobile-aware rendering**: Reduced particle counts and DPI for mobile devices
- **Idle detection**: Pause animations when user is inactive
- **Page visibility API**: Stop animations when tab is in background
- **Frame rate limiting**: Configurable FPS caps for different platforms

---

## Tech Stack

### Core Technologies
- **[React](https://react.dev/) 19.2** - UI framework
- **[TypeScript](https://www.typescriptlang.org/) 5.9** - Type-safe development
- **[Vite](https://vite.dev/) 7.1** - Fast build tool and dev server
- **[Three.js](https://threejs.org/) 0.180** - 3D graphics library

### 3D Rendering
- **[@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) 9.3** - React renderer for Three.js
- **[@react-three/drei](https://github.com/pmndrs/drei) 10.7** - Useful helpers for React Three Fiber

### UI & Controls
- **[Leva](https://github.com/pmndrs/leva) 0.10** - GUI controls for React

### Code Quality
- **ESLint 9.38** - Linting with Google style guide
- **Prettier 3.6** - Code formatting
- **TypeScript ESLint 8.46** - TypeScript-aware linting

### Deployment
- **[Vercel](https://vercel.com/)** - Hosting and deployment platform

---

## Prerequisites

### Required
- **Node.js**: Version 20.x or 22.x (see `engines` in `package.json`)
- **npm**: Latest version (comes with Node.js)

### Recommended
- **Git**: For version control and contributing
- **Modern browser** with WebGL support (Chrome, Firefox, Safari, Edge)
- **Xbox controller** (optional): For gamepad navigation

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/kmack/cube-of-space.git
cd cube-of-space
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies and apply necessary overrides for React 19 compatibility with Radix UI components.

---

## Development

### Start Development Server

```bash
npm run dev
```

This starts the Vite development server with hot module replacement (HMR). Open [http://localhost:5173](http://localhost:5173) in your browser.

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Type check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run deploy` | Deploy to Vercel production |

### Development Workflow

1. **Make changes** to source files in `src/`
2. **See changes** automatically reflected in browser (HMR)
3. **Run linting** before committing:
   ```bash
   npm run lint
   npm run format
   ```
4. **Test build** before pushing:
   ```bash
   npm run build
   ```

---

## Building for Production

### 1. Build the Application

```bash
npm run build
```

This command:
1. Runs TypeScript type checking (`tsc --noEmit`)
2. Builds optimized production bundle with Vite
3. Outputs to `dist/` directory

### 2. Preview Production Build

```bash
npm run preview
```

Serves the production build locally for testing before deployment.

### 3. Deploy to Vercel

```bash
npm run deploy
```

Or connect your repository to Vercel for automatic deployments on push.

---

## Project Structure

```
cube-of-space/
├── public/                  # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── about-modal.tsx          # About dialog
│   │   ├── animated-gradient-background.tsx
│   │   ├── axis-energy-flows.tsx    # Animated particles on axes
│   │   ├── axis-lines.tsx           # Axis geometry
│   │   ├── camera-reset.tsx         # Double-click camera reset
│   │   ├── cube-of-space-scene.tsx  # Main 3D scene
│   │   ├── diagonal-energy-flows.tsx
│   │   ├── diagonal-labels.tsx
│   │   ├── diagonal-lines.tsx
│   │   ├── edge-energy-flows.tsx
│   │   ├── edge-labels.tsx
│   │   ├── edge-position-labels.tsx
│   │   ├── energy-flow.tsx          # Reusable energy flow component
│   │   ├── face-labels.tsx
│   │   ├── face-planes.tsx          # Colored cube faces
│   │   ├── gamepad-controls.tsx     # Xbox controller integration
│   │   ├── label3d.tsx              # 3D text labels
│   │   ├── mother-labels.tsx
│   │   ├── rich-label.tsx           # Labels with symbols
│   │   ├── scene-error-boundary.tsx
│   │   ├── standard-rich-label.tsx
│   │   └── wire-cube.tsx            # Cube wireframe
│   ├── config/
│   │   └── app-config.ts            # Application configuration
│   ├── data/
│   │   ├── axis-energy-flow-config.ts
│   │   ├── constants.ts             # Colors, dimensions, paths
│   │   ├── energy-flow-config.ts
│   │   ├── geometry.ts              # Cube geometry definitions
│   │   ├── label-spec.ts            # Hebrew/Tarot/Astrology mappings
│   │   └── label-styles.ts
│   ├── hooks/
│   │   └── use-gamepad.ts           # Gamepad state hook
│   ├── types/
│   │   └── component-props.ts       # Shared TypeScript types
│   ├── utils/
│   │   ├── canvas-texture.ts        # Canvas-based texture generation
│   │   ├── control-utils.ts         # Leva control helpers
│   │   ├── energy-flow-geometry.ts
│   │   ├── geometry-repository.ts
│   │   ├── geometry-validation.ts
│   │   ├── label-factory.ts
│   │   ├── label-positioning.ts
│   │   ├── label-utils.tsx
│   │   ├── mobile-detection.ts
│   │   ├── orientation.ts
│   │   ├── performance-hooks.ts     # Idle detection, visibility
│   │   ├── tarot-images.ts
│   │   ├── texture-atlas.ts
│   │   └── types.ts                 # Core geometry types
│   ├── app.tsx                      # Root component
│   ├── index.css                    # Global styles
│   ├── main.tsx                     # Entry point
│   └── vite-env.d.ts
├── CLAUDE.md               # Claude Code AI assistant guidance
├── KNOWN_ISSUES.md         # Known bugs and limitations
├── USER_GUIDE.md           # User documentation
├── eslint.config.js        # ESLint configuration
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── tsconfig.app.json       # App-specific TypeScript config
├── tsconfig.node.json      # Node-specific TypeScript config
├── vite.config.ts          # Vite build configuration
└── vercel.json             # Vercel deployment config
```

### Key Directories

- **`src/components/`**: All React components for 3D scene and UI
- **`src/data/`**: Geometric definitions and Qabalistic mappings
- **`src/utils/`**: Utility functions and custom hooks
- **`src/config/`**: Application-wide configuration

---

## Controls

### Mouse/Keyboard (Desktop)
| Action | Control |
|--------|---------|
| **Rotate** | Left-click + drag |
| **Pan** | Right-click + drag |
| **Zoom** | Mouse wheel |
| **Reset Camera** | Double-click |

### Touch (Mobile/Tablet)
| Action | Control |
|--------|---------|
| **Rotate** | One-finger drag |
| **Zoom** | Two-finger pinch |
| **Pan** | Two-finger drag |
| **Reset Camera** | Double-tap |

### Gamepad (Xbox Controller)
| Control | Function |
|---------|----------|
| **Right Stick** | Rotate camera (horizontal/vertical) |
| **Left Stick** | Pan view in screen space |
| **RT (Right Trigger)** | Zoom in |
| **LT (Left Trigger)** | Zoom out |
| **A Button** | Toggle energy flow |
| **B Button** | Toggle double-sided labels |
| **Y Button** | Cycle axis flow direction |
| **D-Pad Up** | Toggle Mother Letters |
| **D-Pad Right** | Toggle Double Letters |
| **D-Pad Down** | Toggle Simple Letters |
| **D-Pad Left** | Toggle Final Letters |
| **LB (Left Bumper)** | Toggle face visibility |
| **RB (Right Bumper)** | Toggle face opacity |
| **L3 (Left Stick Press)** | Reset pan position |
| **R3 (Right Stick Press)** | Reset camera view |

For detailed control information, see [USER_GUIDE.md](./USER_GUIDE.md).

---

## Contributing

We welcome contributions! Here's how to get started:

### 1. Fork and Clone

```bash
git clone https://github.com/YOUR_USERNAME/cube-of-space.git
cd cube-of-space
npm install
```

### 2. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 3. Make Your Changes

- Follow existing code style (enforced by ESLint/Prettier)
- Add TypeScript types for new code
- Test your changes thoroughly
- Update documentation if needed

### 4. Run Quality Checks

```bash
# Lint and format
npm run lint
npm run format

# Type check
npm run typecheck

# Build
npm run build
```

### 5. Commit and Push

```bash
git add .
git commit -m "Description of your changes"
git push origin feature/your-feature-name
```

### 6. Open a Pull Request

- Provide a clear description of changes
- Reference any related issues
- Ensure all CI checks pass

### Code Style Guidelines

- **ESLint**: Google style guide with TypeScript/React extensions
- **Prettier**: 2-space indentation, single quotes, trailing commas
- **TypeScript**: Strict mode enabled, explicit types preferred
- **Imports**: Sorted alphabetically with `simple-import-sort`
- **Components**: Functional components with hooks
- **File naming**: kebab-case for files, PascalCase for components

### Testing

Currently, the project does not have automated tests. Contributions that add test coverage are especially welcome!

---

## License & Attribution

### Author
**Kevin Mack**
Email: [kmack.lvx@proton.me](mailto:kmack.lvx@proton.me)
GitHub: [https://github.com/kmack/cube-of-space](https://github.com/kmack/cube-of-space)

### Tarot Illustrations
Illustrations of Paul Foster Case's B.O.T.A. Tarot Keys are reproduced by kind permission of Builders of the Adytum, Ltd., Los Angeles.

**Disclaimer**: B.O.T.A. does not in any way endorse the interpretation of the author by granting permission for the use of its materials. Those interested in pursuing the teachings of the B.O.T.A. may write to:

**BUILDERS OF THE ADYTUM, LTD.**
5105 N. Figueroa Street
Los Angeles, CA 90042
Website: [www.bota.org](https://www.bota.org)

### Technology Credits
Built with [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Three.js](https://threejs.org/), and [React Three Fiber](https://docs.pmnd.rs/react-three-fiber).

---

## Additional Resources

- **[USER_GUIDE.md](./USER_GUIDE.md)** - Comprehensive user documentation
- **[CLAUDE.md](./CLAUDE.md)** - AI assistant guidance for development
- **[KNOWN_ISSUES.md](./KNOWN_ISSUES.md)** - Known bugs and limitations

---

## Support

If you encounter issues or have questions:

1. Check [KNOWN_ISSUES.md](./KNOWN_ISSUES.md)
2. Review [USER_GUIDE.md](./USER_GUIDE.md)
3. Open an issue on [GitHub](https://github.com/kmack/cube-of-space/issues)

---

**Explore the sacred geometry and discover the relationships between the Hebrew alphabet, Tarot, astrology, and the structure of space itself.**
