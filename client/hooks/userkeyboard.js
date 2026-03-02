// hooks/useKeyboard.js
import { useState, useEffect } from 'react';

export const useKeyboard = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const visualViewport = window.visualViewport;

    if (!visualViewport) return;

    const handleResize = () => {
      // Get the window height and visual viewport height
      const windowHeight = window.innerHeight;
      const visualViewportHeight = visualViewport.height;

      // Calculate the difference (keyboard height)
      const heightDiff = windowHeight - visualViewportHeight;

      // If difference is more than 150px, keyboard is likely open
      const isOpen = heightDiff > 150;

      setIsKeyboardOpen(isOpen);
      setKeyboardHeight(isOpen ? heightDiff : 0);
    };

    visualViewport.addEventListener('resize', handleResize);
    visualViewport.addEventListener('scroll', handleResize);

    // Initial check
    handleResize();

    return () => {
      visualViewport.removeEventListener('resize', handleResize);
      visualViewport.removeEventListener('scroll', handleResize);
    };
  }, []);

  return { isKeyboardOpen, keyboardHeight };
};
