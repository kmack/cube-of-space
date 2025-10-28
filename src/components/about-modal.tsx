// src/components/about-modal.tsx
import './about-modal.css';

import * as React from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({
  isOpen,
  onClose,
}: AboutModalProps): React.JSX.Element | null {
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (
    event: React.MouseEvent<HTMLDivElement>
  ): void => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="about-modal-backdrop"
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleBackdropClick(e as unknown as React.MouseEvent<HTMLDivElement>);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Close modal by clicking backdrop"
    >
      <div className="about-modal-content">
        <button
          className="about-modal-close"
          onClick={onClose}
          aria-label="Close about dialog"
        >
          ×
        </button>

        <h2 className="about-modal-title">Cube of Space</h2>

        <div className="about-modal-description">
          <p>
            An interactive 3D visualization of the Qabalistic/Tarot geometric
            model, mapping the 22 Hebrew letters to the structure of space.
          </p>
        </div>

        <div className="about-modal-info">
          <div className="about-modal-section">
            <h3>Author</h3>
            <p>Kevin Mack</p>
          </div>

          <div className="about-modal-section">
            <h3>Contact</h3>
            <p>
              <a href="mailto:kmack.lvx@proton.me">kmack.lvx@proton.me</a>
            </p>
          </div>

          <div className="about-modal-section">
            <h3>Source Code</h3>
            <p>
              <a
                href="https://github.com/kmack/cube-of-space.git"
                target="_blank"
                rel="noopener noreferrer"
              >
                github.com/kmack/cube-of-space
              </a>
            </p>
          </div>
        </div>

        <div className="about-modal-attribution">
          <h3>Tarot Illustrations</h3>
          <p>
            Illustrations of Paul Foster Case&apos;s B.O.T.A. Tarot Keys are
            reproduced by kind permission of Builders of the Adytum, Ltd., Los
            Angeles.
          </p>
          <p className="about-modal-disclaimer">
            B.O.T.A. does not in any way endorse the interpretation of the
            author by granting permission for the use of its materials. Those
            interested in pursuing the teachings of the B.O.T.A. may write to:
          </p>
          <address className="about-modal-address">
            BUILDERS OF THE ADYTUM, LTD.
            <br />
            5105 N. Figueroa Street
            <br />
            Los Angeles, CA 90042
          </address>
          <p>
            <a
              href="https://www.bota.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.bota.org
            </a>
          </p>
        </div>

        <div className="about-modal-footer">
          <p>Built with React, TypeScript, Three.js, and React Three Fiber</p>
        </div>
      </div>
    </div>
  );
}
