// Copyright (c) 2026 SAP SE or an SAP affiliate company and SapMachine contributors. Licensed under CC BY 4.0.

import React from 'react';
import BackToTopButton from '@theme/BackToTopButton';

/**
 * Custom DocRoot/Layout - removes all default Docusaurus layout wrappers
 * Our custom DocPage in DocItem/Layout handles its own sidebar and grid layout
 * This just renders children directly with BackToTopButton
 */
export default function DocRootLayout({children}) {
  return (
    <>
      <BackToTopButton />
      {children}
    </>
  );
}