// Copyright (c) 2026 SAP SE or an SAP affiliate company and SapMachine contributors. Licensed under CC BY 4.0.

/**
 * Initialize the forward page with a fixed 5-second delay
 * @param {string} targetUrl - The target URL to redirect to
 */
function initForward(targetUrl) {
    var DELAY_SECONDS = 5;
    var countdown = DELAY_SECONDS;

    // Set the target URL in the page
    var locationLink = document.getElementById('l');
    locationLink.textContent = targetUrl;
    locationLink.href = targetUrl;

    var linkElement = document.getElementById('a');
    if (linkElement) {
        linkElement.href = targetUrl;
    }

    function tick() {
        document.getElementById('c').textContent = countdown;
        document.getElementById('s').textContent = countdown === 1 ? 'second' : 'seconds';

        if (countdown <= 0) {
            location.replace(targetUrl);
        } else {
            countdown--;
            setTimeout(tick, 1000);
        }
    }

    // Start the countdown immediately
    tick();
}
