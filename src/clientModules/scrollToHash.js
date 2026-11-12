// Copyright (c) 2026 SAP SE or an SAP affiliate company and SapMachine contributors. Licensed under CC BY 4.0.

export function onRouteDidUpdate({ location, previousLocation }) {
  if (!previousLocation) return;
  if (location.pathname === previousLocation.pathname) return;

  const target = sessionStorage.getItem('scrollTarget');
  if (!target) return;
  sessionStorage.removeItem('scrollTarget');

  setTimeout(() => {
    const el = document.getElementById(target);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, 400);
}
