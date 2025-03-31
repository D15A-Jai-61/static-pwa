// date-time.js
function displayCurrentTime() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(function(registration) {
            caches.match('current-time.json').then(function(response) {
                if (response) {
                    response.json().then(function(data) {
                        const timeElement = document.getElementById('current-time');
                        timeElement.textContent = `Current Date and Time: ${data.currentTime}`;
                    });
                } else {
                    console.log('No time data found in cache');
                }
            });
        });
    }
}

// Call the function to display the time when the page loads
displayCurrentTime();
