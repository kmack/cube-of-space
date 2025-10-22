# Known Issues

This document tracks known console warnings and errors that are safe to ignore. These are primarily library compatibility issues that don't affect functionality.

## Console Warnings (Safe to Ignore)

### 1. OrbitControls Non-Passive Event Listener

**Message:**
```
[Violation] Added non-passive event listener to a scroll-blocking 'wheel' event.
Consider marking event handler as 'passive' to make the page more responsive.
```

**Source:** `@react-three/drei` OrbitControls component

**Impact:** None - this is a performance optimization suggestion from Chrome DevTools. The controls work correctly.

**Status:** This is a library-level issue in `@react-three/drei`. The warning is informational and doesn't affect functionality. Passive event listeners improve scroll performance, but OrbitControls needs to preventDefault() on wheel events to control zoom, which requires non-passive listeners.

**Fix:** Will be resolved when the upstream library updates to use passive listeners where appropriate.

---

### 2. React DevTools Semver Error

**Message:**
```
Uncaught Error: Invalid argument not valid semver ('' received)
    at validateAndParse (index.js:120:15)
    at esm_compareVersions (index.js:10:16)
    at gte (index.js:249:10)
    at registerRendererInterface (agent.js:960:24)
```

**Source:** React DevTools browser extension

**Impact:** None - React DevTools functionality is not affected, application runs normally.

**Status:** This is a compatibility issue between React 19.2 and certain versions of the React DevTools browser extension. The error occurs during DevTools initialization but doesn't prevent the extension from working.

**Fix:** This will be resolved when:
- React DevTools updates to handle React 19.x version strings correctly, or
- The browser extension is updated

**Workaround:** Can be safely ignored, or temporarily disable React DevTools browser extension if the error is bothersome.

---

### 3. RequestAnimationFrame Handler Performance

**Message:**
```
[Violation] 'requestAnimationFrame' handler took 60ms
```

**Source:** Three.js/React Three Fiber rendering loop during initial scene setup

**Impact:** Minimal - occurs primarily during initial load when setting up 3D geometry and textures.

**Status:** This warning appears when the browser's frame budget (typically 16ms for 60fps) is exceeded during scene initialization. This is expected during complex 3D scene setup.

**Optimization:** Already implemented:
- Mobile detection for reduced particle counts
- LOD (Level of Detail) for labels
- Texture caching
- Conditional rendering based on visibility

**Fix:** May improve with future Three.js performance optimizations. Currently optimized for mobile and desktop.

---

## Fixed Issues

### ✅ Edge Normal Vector Normalization

**Issue:** Edge normal vectors were not normalized (length was √2 ≈ 1.414 instead of 1.0)

**Fix:** Introduced `INV_SQRT2` constant and normalized all edge normal vectors in [geometry.ts:29-114](src/data/geometry.ts#L29-L114)

**Date Fixed:** 2025-10-22

---

## npm Audit Vulnerabilities (Safe to Ignore)

**Status:** 11 vulnerabilities (4 moderate, 7 high) in `npm audit`

**Affected Package:** `vercel` CLI tool (devDependency only)

**Vulnerabilities:**
- `esbuild` ≤0.24.2 - Development server request exploit
- `path-to-regexp` 4.0.0-6.2.2 - Regex backtracking DoS
- `undici` ≤5.28.5 - Insufficiently random values, certificate handling

**Why You Can Ignore:**
1. **Build Tool Only:** `vercel` is a devDependency used only for deployment, not included in production bundle
2. **No Runtime Risk:** These vulnerabilities don't affect your production application code
3. **Not User-Facing:** The vulnerable dependencies never run in the browser or serve users
4. **Active Maintenance:** Vercel team will address these in future CLI releases

**Suggested Fix Would Break Things:**
```bash
npm audit fix --force  # Would downgrade vercel 48.5.0 → 41.0.2 (7 major versions backward!)
```

**Production Bundle Status:** ✅ Clean - `dist/` contains only React, Three.js, and application code

**Package Organization:**
- Moved `vercel` from `dependencies` → `devDependencies` (2025-10-22) to clarify it's build tooling

---

## Contributing

If you encounter new console warnings or errors:

1. Check if they affect functionality
2. Note the source (which library/component)
3. Document impact and workarounds
4. Update this file if the issue is safe to ignore
