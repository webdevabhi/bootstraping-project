import '@testing-library/jest-dom';
import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// Mock style injection
const originalCreateElement = document.createElement;
document.createElement = function(tagName: string) {
  if (tagName === 'style') {
    const element = originalCreateElement.call(document, tagName);
    Object.defineProperty(element, 'textContent', {
      set() { /* no-op */ },
      get() { return ''; }
    });
    return element;
  }
  return originalCreateElement.call(document, tagName);
} as typeof document.createElement;

expect.extend(matchers); 