const apiKey = 'AIzaSyAZL6dmWDySSUf3wz84gglAIqS1obZcJFA';
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

function toggleDropdown() {
    const dropdownContent = document.getElementById('dropdown-content');
    dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
}

function askFactAI() {
    const currentFact = document.getElementById('post-text').innerText;
    if (!currentFact.trim()) {
        alert('No fact is currently displayed.');
        return;
    }

    const prompt = `Is this a real fact: ${currentFact}`;

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }]
        })
    })
    .then(response => response.json())
    .then(data => {
        const aiResponse = data.candidates[0].content.parts[0].text;
        document.getElementById('ai-response-text').innerText = aiResponse;
        document.getElementById('ai-response-card').style.display = 'block';
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('ai-response-text').innerText = 'Sorry, something went wrong. Please try again.';
        document.getElementById('ai-response-card').style.display = 'block';
    });
}