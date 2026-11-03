// Copyright (c) 2026 SAP SE or an SAP affiliate company and SapMachine contributors. Licensed under CC BY 4.0.

import React, { useEffect } from 'react';
import { ThemeProvider } from '@ui5/webcomponents-react';

// Import UI5 Web Components styles
import '@ui5/webcomponents-react/styles.css';

// Default implementation, that you can customize
export default function Root({ children }) {
  useEffect(() => {
    const onMouse = () => document.body.classList.remove('kb-nav');
    const onKey = (e) => {
      if (e.key === 'Tab') document.body.classList.add('kb-nav');
    };
    document.addEventListener('mousedown', onMouse);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouse);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return <ThemeProvider>{children}</ThemeProvider>;
}