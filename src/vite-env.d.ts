/// <reference types="vite/client" />

export {};

declare global {
  interface Window {
    DarkReader: {
      auto: (options?: {
        brightness?: number;
        contrast?: number;
        sepia?: number;
      }) => void;
      enable: (options?: {
        brightness?: number;
        contrast?: number;
        sepia?: number;
      }) => void;
      disable: () => void;
    };
  }
}
