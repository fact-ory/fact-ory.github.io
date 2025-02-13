document.addEventListener('DOMContentLoaded', function () {
    const postContainerElement = document.getElementById('post-container');
    const postTextElement = document.getElementById('post-text');
    const factIdElement = document.getElementById('fact-id');
    const factIdTextElement = document.getElementById('fact-id-text');
    const copyFactIdButton = document.getElementById('copy-fact-id');
    const addPostButton = document.getElementById('add-post-btn');
    const addPostForm = document.getElementById('add-post-form');
    const postInputElement = document.getElementById('post-input');
    const submitPostButton = document.getElementById('submit-post-btn');
    const searchInputElement = document.getElementById('search-input');
    const searchButton = document.getElementById('search-btn');
    const notificationElement = document.getElementById('notification');

    let facts = [];
    let currentIndex = 0;
    let isAnimating = false;

    window.facts = facts;
    window.showFact = showFact;


    const firebaseConfig = {
        apiKey: "AIzaSyA3Cgkok7Wft6IcP7r1yMCxojMTSLmU",
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

    copyFactIdButton.addEventListener('click', function() {
        const factId = factIdTextElement.textContent.replace('FactID: ', '');
        navigator.clipboard.writeText(factId)
            .then(() => showNotification('FactID copied to clipboard!'))
            .catch(err => console.error('Could not copy text: ', err));
    });

    addPostButton.addEventListener('click', function () {
        addPostForm.style.display = addPostForm.style.display === 'none' || addPostForm.style.display === '' ? 'flex' : 'none';
        if (addPostForm.style.display === 'flex') {
            postInputElement.focus();
        }
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
                showNotification(`Fact shared successfully! FactID: ${factID}`);
            } catch (error) {
                console.error("Error generating FactID: ", error);
                showNotification('Error sharing fact. Please try again.');
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
        
        setTimeout(() => {
            notificationElement.style.display = 'none';
        }, 3000);
    }

    async function showFact(index, direction = 'next') {
        if (isAnimating) return;
        if (facts.length === 0) {
            postTextElement.textContent = "No facts available.";
            factIdTextElement.textContent = "";
            return;
        }

        if (index < 0 || index >= facts.length) {
            postTextElement.textContent = "Invalid fact index.";
            factIdTextElement.textContent = "";
            return;
        }

        isAnimating = true;

        postContainerElement.className = 'post-container';

        postContainerElement.classList.add(direction === 'next' ? 'animate-next-out' : 'animate-prev-out');

        await new Promise(resolve => setTimeout(resolve, 300));

        postTextElement.textContent = facts[index].text;
        factIdTextElement.textContent = `FactID: ${facts[index].id}`;

        postContainerElement.className = 'post-container';
        postContainerElement.classList.add(direction === 'next' ? 'initial-next' : 'initial-prev');

        void postContainerElement.offsetWidth;

        postContainerElement.classList.add(direction === 'next' ? 'animate-next-in' : 'animate-prev-in');

        await new Promise(resolve => setTimeout(resolve, 300));

        postContainerElement.className = 'post-container';

        isAnimating = false;
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
        const foundFact = facts.find(post => post.id === searchFactID.toUpperCase());
        if (foundFact) {
            const index = facts.indexOf(foundFact);
            showFact(index);
            searchInputElement.value = '';
        } else {
            showNotification('Fact not found. Please check the FactID and try again.');
        }
    });

    function navigate(direction) {
        if (facts.length === 0 || isAnimating) return;

        let newIndex;
        if (direction === 'next') {
            newIndex = (currentIndex + 1) % facts.length;
        } else if (direction === 'prev') {
            newIndex = (currentIndex - 1 + facts.length) % facts.length;
        }
        showFact(newIndex, direction);
    }

    document.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowRight') {
            navigate('next');
        } else if (event.key === 'ArrowLeft') {
            navigate('prev');
        }
    });

    let startX, endX;
    let isSwiping = false;

    function handleTouchStart(e) {
        const touch = e.type === 'touchstart' ? e.touches[0] : e;
        startX = touch.pageX;
        isSwiping = true;
        
        postContainerElement.style.transform = 'translateX(0)';
    }

    function handleTouchMove(e) {
        if (!isSwiping) return;
        
        const touch = e.type === 'touchmove' ? e.touches[0] : e;
        endX = touch.pageX;
        const diff = endX - startX;

        const resistance = 0.4;
        const transform = Math.min(Math.max(diff * resistance, -100), 100);
        
        postContainerElement.style.transform = `translateX(${transform}px)`;

        if (Math.abs(diff) > 5) {
            e.preventDefault();
        }
    }

    function handleTouchEnd() {
        if (!isSwiping) return;
        
        const swipeThreshold = 50;
        const diff = endX - startX;

        postContainerElement.style.transform = '';

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                navigate('prev');
            } else {
                navigate('next');
            }
        }

        isSwiping = false;
        startX = undefined;
        endX = undefined;
    }

    postContainerElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    postContainerElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    postContainerElement.addEventListener('touchend', handleTouchEnd);

    postContainerElement.addEventListener('mousedown', handleTouchStart);
    postContainerElement.addEventListener('mousemove', handleTouchMove);
    document.addEventListener('mouseup', handleTouchEnd);

    postContainerElement.addEventListener('selectstart', (e) => {
        if (isSwiping) {
            e.preventDefault();
        }
    });

    postInputElement.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitPostButton.click();
        }
    });

    document.addEventListener('click', function(e) {
        if (!addPostForm.contains(e.target) && !addPostButton.contains(e.target)) {
            if (addPostForm.style.display === 'flex') {
                addPostForm.style.display = 'none';
            }
        }
    });

    searchInputElement.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            searchButton.click();
        }
    });

    postContainerElement.classList.add('slide-in-right');
});
