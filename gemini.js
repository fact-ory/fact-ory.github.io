const apiKey = 'AIzaSyAZL6dmWDySSUf3wz84gglAIqS1obZcJFA';
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

function toggleDropdown() {
    const dropdownContent = document.getElementById('dropdown-content');
    dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
}

async function askFactAI() {
    const currentFact = document.getElementById('post-text').innerText;
    if (!currentFact.trim()) {
        alert('No fact is currently displayed.');
        return;
    }

    const prompt = `Tell me if this is a real fact:  "${currentFact}" Before explaining, state one of the following at the beginning: "Real" if the fact is true. "Not Real" if the fact is false. "Lack of Information" if the fact is true but missing important details. "Not a Fact" if the statement is not a fact at all.`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        // Check if the response contains valid data
        if (!data.candidates || data.candidates.length === 0) {
            throw new Error('No valid response from the API.');
        }

        const aiResponse = data.candidates[0].content.parts[0].text;
        const aiResponseText = "Hi! I'm FactAI. Let's see if this is real or not: \n\n" + aiResponse;
        document.getElementById('ai-response-text').innerText = aiResponseText;
        document.getElementById('ai-response-card').style.display = 'block';

        // Check the first 20 characters of the response for keywords
        const first20Chars = aiResponse.substring(0, 20).toLowerCase();
        const aiResponseCard = document.getElementById('ai-response-card');

        if (first20Chars.includes('Lack of Information')) {
            aiResponseCard.style.backgroundColor = '#fff3cc'; // Pastel yellow
        } else if (first20Chars.includes('not a fact')) {
            aiResponseCard.style.backgroundColor = '#fff3cc'; // Pastel yellow
        } else if (first20Chars.includes('not real')) {
            aiResponseCard.style.backgroundColor = '#ffcccc'; // Pastel red
        } else if (first20Chars.includes('real')) {
            aiResponseCard.style.backgroundColor = '#d1f7d1'; // Pastel green
        } else {
            aiResponseCard.style.backgroundColor = '#ffffff'; // Default white
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('ai-response-text').innerText = 'Sorry, something went wrong. Please try again later.';
        document.getElementById('ai-response-card').style.display = 'block';
        document.getElementById('ai-response-card').style.backgroundColor = '#ffffff'; // Default white
    }
}