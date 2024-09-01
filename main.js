document.addEventListener('DOMContentLoaded', function () {
    const postContainerElement = document.getElementById('post-container');
    const postTextElement = document.getElementById('post-text');
    const factIdElement = document.getElementById('fact-id');
    const addPostButton = document.getElementById('add-post-btn');
    const addPostForm = document.getElementById('add-post-form');
    const postInputElement = document.getElementById('post-input');
    const submitPostButton = document.getElementById('submit-post-btn');
    const searchInputElement = document.getElementById('search-input');
    const searchButton = document.getElementById('search-btn');
    const notificationElement = document.getElementById('notification');
    const copyButton = document.createElement('button');

    let facts = [];
    let currentIndex = 0;

    const firebaseConfig = {
        apiKey: "AIzaSyA3Cgkok7Wft6IcP7r1yMCxojMnhmTSLmU",
        authDomain: "fact-ory-test1.firebaseapp.com",
        projectId: "fact-ory-test1",
        storageBucket: "fact-ory-test1.appspot.com",
        messagingSenderId: "212086686201",
        appId: "1:212086686201:web:2a328bdc76cc0483e6fd28",
        measurementId: "G-SERTCMFWNJ"
    };

    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();

    loadFacts();

    addPostButton.addEventListener('click', function () {
        addPostForm.style.display = addPostForm.style.display === 'none' || addPostForm.style.display === '' ? 'flex' : 'none';
    });

    submitPostButton.addEventListener('click', async function () {
        const newPostText = postInputElement.value.trim();
        if (newPostText !== "") {
            try {
                const factID = await generateRandomFactID();
                const newFact = { text: newPostText, id: factID };
                database.ref('facts').push(newFact);
                postInputElement.value = "";
                addPostForm.style.display = 'none';
                showNotification(`Fact shared. Your FactID: ${factID}`);
            } catch (error) {
                console.error("Error generating FactID: ", error);
            }
        }
    });

    function generateRandomFactID() {
        return new Promise((resolve, reject) => {
            const generateID = () => Math.random().toString(36).substring(2, 8).toUpperCase();
            const newID = generateID();
            database.ref('facts').orderByChild('id').equalTo(newID).once('value', snapshot => {
                if (snapshot.exists()) {
                    resolve(generateID());
                } else {
                    resolve(newID);
                }
            }).catch(error => reject(error));
        });
    }

    function showNotification(message) {
        notificationElement.textContent = message;
        notificationElement.style.display = 'block';
        notificationElement.appendChild(copyButton);

        copyButton.textContent = 'Copy';
        copyButton.style.marginLeft = '10px';

        copyButton.addEventListener('click', () => {
            const factID = message.match(/FactID: (\w+)/)[1];
            navigator.clipboard.writeText(factID)
                .then(() => {
                    alert('FactID copied to clipboard!');
                })
                .catch(err => {
                    console.error('Could not copy text: ', err);
                });
        });

        setTimeout(() => {
            notificationElement.style.display = 'none';
            notificationElement.removeChild(copyButton);
        }, 4000);
    }

    function showFact(index) {
        if (facts.length === 0) {
            postTextElement.textContent = "No facts available.";
            factIdElement.textContent = "";
            return;
        }

        if (index < 0 || index >= facts.length) {
            postTextElement.textContent = "Invalid fact index.";
            factIdElement.textContent = "";
            return;
        }

        postContainerElement.classList.add('slide-right');
        setTimeout(() => {
            postContainerElement.classList.remove('slide-right');
            postTextElement.textContent = facts[index].text;
            factIdElement.textContent = `FactID: ${facts[index].id}`;
        }, 400);

        currentIndex = index;
    }

    function loadFacts() {
        database.ref('facts').once('value', function(snapshot) {
            facts = [];
            snapshot.forEach(function(childSnapshot) {
                facts.push(childSnapshot.val());
            });
            if (facts.length > 0) {
                showFact(0);
            }
        });
    }

    searchButton.addEventListener('click', function () {
        const searchFactID = searchInputElement.value.trim();
        const foundFact = facts.find(post => post.id === searchFactID);
        if (foundFact) {
            const index = facts.indexOf(foundFact);
            showFact(index);
        } else {
            postTextElement.textContent = "Fact not found.";
            factIdElement.textContent = "";
        }
    });

    function navigate(direction) {
        if (facts.length === 0) return;

        if (direction === 'next') {
            currentIndex = (currentIndex + 1) % facts.length;
        } else if (direction === 'prev') {
            currentIndex = (currentIndex - 1 + facts.length) % facts.length;
        }
        showFact(currentIndex);
    }

    document.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowRight') {
            navigate('next');
        } else if (event.key === 'ArrowLeft') {
            navigate('prev');
        }
    });

    let startX, endX;
    postContainerElement.addEventListener('mousedown', (e) => {
        startX = e.pageX;
        postContainerElement.addEventListener('mousemove', onMouseMove);
    });

    document.addEventListener('mouseup', () => {
        if (startX !== undefined) {
            postContainerElement.removeEventListener('mousemove', onMouseMove);
            if (endX - startX > 50) {
                navigate('prev');
            } else if (startX - endX > 50) {
                navigate('next');
            }
            startX = undefined;
        }
    });

    function onMouseMove(e) {
        endX = e.pageX;
    }

    postContainerElement.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX;
    });

    postContainerElement.addEventListener('touchmove', (e) => {
        endX = e.touches[0].pageX;
    });

    postContainerElement.addEventListener('touchend', () => {
        if (startX !== undefined) {
            if (endX - startX > 50) {
                navigate('prev');
            } else if (startX - endX > 50) {
                navigate('next');
            }
            startX = undefined;
        }
    });
});
