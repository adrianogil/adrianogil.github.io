document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const inputSection = document.getElementById('input-section');
    const jsonInput = document.getElementById('json-input');
    const loadButton = document.getElementById('load-button');
    const toggleButton = document.getElementById('toggle-input');
    const errorMessage = document.getElementById('error-message');
    const storyContainer = document.getElementById('story-container');
    const storyTitle = document.getElementById('story-title');
    const storyContent = document.getElementById('story-content');
    const choicesContainer = document.getElementById('choices-container');
    const shareButton = document.getElementById('share-button');
    const shareUrlContainer = document.getElementById('share-url-container');
    const shareUrl = document.getElementById('share-url');
    const copyUrlButton = document.getElementById('copy-url-button');

    // Story data
    let storyData = null;
    let currentPassage = null;

    // Toggle input section visibility
    toggleButton.addEventListener('click', function() {
        inputSection.classList.toggle('collapsed');
        updateToggleIcons();
    });

    // Update all toggle icons to match collapsed state
    function updateToggleIcons() {
        const isCollapsed = inputSection.classList.contains('collapsed');
        const icons = inputSection.querySelectorAll('.toggle-icon');
        icons.forEach(icon => {
            icon.textContent = isCollapsed ? '►' : '▼';
        });
    }

    // Make the header clickable to toggle as well
    inputSection.querySelector('.header-row').addEventListener('click', function() {
        inputSection.classList.toggle('collapsed');
        updateToggleIcons();
    });

    // Convert JSON to base64 string
    function jsonToBase64(json) {
        if (typeof json === 'object') {
            // You could use JSON.stringify with no extra spaces if you prefer a shorter URL,
            // but to preserve formatting in the editor, stringify it as-is:
            json = JSON.stringify(json);
        }
        const formattedJson = json;
        return btoa(encodeURIComponent(formattedJson));
    }


    // Convert base64 to JSON
    function base64ToJson(base64Str) {
        try {
            // Decode from base64 and parse as JSON
            return JSON.parse(decodeURIComponent(atob(base64Str)));
        } catch (error) {
            console.error('Error decoding base64 to JSON:', error);
            return null;
        }
    }

    // Check URL for story data when page loads
    function checkUrlForStory() {
        const urlParams = new URLSearchParams(window.location.search);
        const storyParam = urlParams.get('story');

        if (storyParam) {
            try {
                // Decode the story from URL
                const decodedStory = base64ToJson(storyParam);

                if (decodedStory) {
                    // Place story in the JSON input field
                    jsonInput.value = JSON.stringify(decodedStory, null, 4);

                    // Load the story
                    loadStory(decodedStory);
                }
            } catch (error) {
                errorMessage.textContent = 'Invalid story data in URL.';
                errorMessage.style.display = 'block';
            }
        }
    }

    // Generate shareable URL
    function generateShareableUrl() {
        if (!storyData) return null;

        // Convert story data to base64
        const storyBase64 = jsonToBase64(storyData);

        // Create URL
        const url = new URL(window.location.href);
        url.search = ''; // Clear existing query parameters
        url.searchParams.set('story', storyBase64);

        return url.toString();
    }

    // Copy URL to clipboard
    copyUrlButton.addEventListener('click', function() {
        shareUrl.select();
        document.execCommand('copy');

        // Visual feedback
        const originalText = copyUrlButton.textContent;
        copyUrlButton.textContent = 'Copied!';
        setTimeout(() => {
            copyUrlButton.textContent = originalText;
        }, 2000);
    });

    // Share button click handler
    shareButton.addEventListener('click', function() {
        if (!storyData) {
            errorMessage.textContent = 'No story loaded to share.';
            errorMessage.style.display = 'block';
            return;
        }

        const url = generateShareableUrl();
        if (url) {
            shareUrl.value = url;
            shareUrlContainer.style.display = 'flex';

            // Select the URL text for easy copying
            shareUrl.select();
        }
    });

    // Load story from JSON
    loadButton.addEventListener('click', function() {
        try {
            // Parse JSON
            storyData = JSON.parse(jsonInput.value);
            loadStory(storyData);
        } catch (error) {
            // Display error message
            errorMessage.textContent = error.message || 'Invalid JSON. Please check your input.';
            errorMessage.style.display = 'block';
            storyContainer.style.display = 'none';

            // Expand input section to show the error
            inputSection.classList.remove('collapsed');
            updateToggleIcons();
        }
    });

    // Load story function (separated for reuse)
    function loadStory(data) {
        try {
            // Validate story data
            if (!data.story_name || !Array.isArray(data.passages) || data.passages.length === 0) {
                throw new Error('Invalid story format. Story should have a name and passages array.');
            }

            // Set story data
            storyData = data;

            // Clear error message and hide it
            errorMessage.textContent = '';
            errorMessage.style.display = 'none';

            // Load the first passage (usually named "Start")
            let startPassage = storyData.passages.find(p => p.name === "Start");

            // If no passage named "Start", use the first passage
            if (!startPassage && storyData.passages.length > 0) {
                startPassage = storyData.passages[0];
            }

            if (startPassage) {
                // Show story container
                storyContainer.style.display = 'block';

                // Collapse input section to focus on story
                inputSection.classList.add('collapsed');
                updateToggleIcons();

                // Display the start passage
                displayPassage(startPassage);

                // Scroll to story section
                document.getElementById('story-section').scrollIntoView({ behavior: 'smooth' });
            } else {
                throw new Error('No passages found in the story.');
            }
        } catch (error) {
            // Display error message
            errorMessage.textContent = error.message || 'Invalid story data.';
            errorMessage.style.display = 'block';
            storyContainer.style.display = 'none';

            // Expand input section to show the error
            inputSection.classList.remove('collapsed');
            updateToggleIcons();
        }
    }

    // Display a passage
    function displayPassage(passage) {
        // Store current passage
        currentPassage = passage;

        // Set story title
        storyTitle.textContent = storyData.story_name;

        // Clear previous content
        storyContent.innerHTML = '';
        choicesContainer.innerHTML = '';

        // Hide share URL if visible
        shareUrlContainer.style.display = 'none';

        // Display passage content
        passage.content.forEach(item => {
            if (typeof item === 'string') {
                // Text paragraph
                const paragraph = document.createElement('p');
                paragraph.className = 'story-paragraph';
                paragraph.textContent = item;
                storyContent.appendChild(paragraph);
            } else if (item.choices) {
                // Choices
                for (const [choiceText, targetPassageName] of Object.entries(item.choices)) {
                    const choiceButton = document.createElement('button');
                    choiceButton.className = 'choice-button';
                    choiceButton.textContent = choiceText;

                    // Handle choice click
                    choiceButton.addEventListener('click', function() {
                        // Find target passage
                        const targetPassage = storyData.passages.find(p => p.name === targetPassageName);

                        if (targetPassage) {
                            // Display target passage
                            displayPassage(targetPassage);

                            // Scroll choices into view smoothly
                            setTimeout(() => {
                                choicesContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                            }, 100);
                        } else {
                            errorMessage.textContent = `Passage "${targetPassageName}" not found!`;
                            errorMessage.style.display = 'block';
                        }
                    });

                    choicesContainer.appendChild(choiceButton);
                }
            }
        });
    }

    // Load sample story
    const sampleStory = {
        "story_name": "Echoes of the Dragon",
        "passages": [
            {
                "name": "Start",
                "content": [
                    "You find yourself standing at the entrance of a dark forest.",
                    "The path splits into two: one leading deeper into the woods, and the other leading to a nearby village.",
                    {
                        "choices": {
                            "Enter the forest": "Forest",
                            "Go to the village": "Village"
                        }
                    }
                ]
            },
            {
                "name": "Forest",
                "content": [
                    "The trees are dense and the path is overgrown. As you walk, you hear a faint crying sound.",
                    "Following the sound, you come across a baby dragon, trapped under some fallen branches.",
                    {
                        "choices": {
                            "Help the dragon": "HelpDragon",
                            "Leave the forest": "Start"
                        }
                    }
                ]
            },
            {
                "name": "Village",
                "content": [
                    "You arrive at a small village. The villagers seem nervous and on edge.",
                    "An old man approaches you and warns about a dragon that has been terrorizing the area.",
                    {
                        "choices": {
                            "Offer to help": "OfferHelp",
                            "Go back to the forest entrance": "Start"
                        }
                    }
                ]
            },
            {
                "name": "HelpDragon",
                "content": [
                    "You carefully remove the branches, freeing the baby dragon.",
                    "It looks at you gratefully and nuzzles against your hand. You've made a friend!",
                    {
                        "choices": {
                            "Take the dragon with you": "DragonFriend",
                            "Leave the dragon and go to the village": "Village"
                        }
                    }
                ]
            },
            {
                "name": "OfferHelp",
                "content": [
                    "The villagers thank you and give you a sword to fight the dragon.",
                    "They point you toward a cave in the mountains where the dragon lives.",
                    {
                        "choices": {
                            "Go to the cave": "DragonCave",
                            "Head to the forest instead": "Forest"
                        }
                    }
                ]
            },
            {
                "name": "DragonFriend",
                "content": [
                    "The baby dragon follows you. As you walk through the forest, it grows rapidly.",
                    "By the time you reach the village, it's the size of a horse. The villagers are terrified!",
                    {
                        "choices": {
                            "Explain that the dragon is friendly": "DragonPeace",
                            "Leave the village with your dragon": "DragonAdventure"
                        }
                    }
                ]
            },
            {
                "name": "DragonCave",
                "content": [
                    "You reach the cave and find an enormous dragon sleeping on a pile of gold.",
                    "As you approach, you notice something around its neck - it looks like a collar with strange markings.",
                    {
                        "choices": {
                            "Attack the dragon": "DragonFight",
                            "Try to remove the collar": "DragonCollar"
                        }
                    }
                ]
            },
            {
                "name": "DragonPeace",
                "content": [
                    "You convince the villagers that your dragon means no harm. They're skeptical but agree to a truce.",
                    "Over time, the dragon helps protect the village, and peace is established.",
                    {
                        "choices": {
                            "Start a new adventure": "Start"
                        }
                    }
                ]
            },
            {
                "name": "DragonAdventure",
                "content": [
                    "You and your dragon companion leave the village behind, embarking on a journey of adventure.",
                    "Who knows what exciting challenges await you both in the wide world?",
                    {
                        "choices": {
                            "Start a new adventure": "Start"
                        }
                    }
                ]
            },
            {
                "name": "DragonFight",
                "content": [
                    "You attack the dragon, but your sword barely scratches its scales.",
                    "The dragon awakens, angry and confused. It breathes fire in your direction!",
                    {
                        "choices": {
                            "Try to dodge": "DragonDodge",
                            "Run away": "Forest"
                        }
                    }
                ]
            },
            {
                "name": "DragonCollar",
                "content": [
                    "You carefully approach and manage to cut the collar off without waking the dragon.",
                    "The dragon's demeanor instantly changes. It wakes up calmly, looks at you gratefully, and flies away.",
                    "When you return to the village, you're celebrated as a hero.",
                    {
                        "choices": {
                            "Start a new adventure": "Start"
                        }
                    }
                ]
            },
            {
                "name": "DragonDodge",
                "content": [
                    "You narrowly avoid the dragon's fire breath!",
                    "In the chaos, you notice that the collar seems to be controlling the dragon, making it aggressive.",
                    {
                        "choices": {
                            "Try to remove the collar": "DragonCollar",
                            "Continue fighting": "DragonDefeat"
                        }
                    }
                ]
            },
            {
                "name": "DragonDefeat",
                "content": [
                    "The battle is fierce, but ultimately, you're outmatched by the dragon's power.",
                    "Before the dragon can deliver a final blow, a baby dragon - the one you saved earlier - flies in and distracts it.",
                    "This gives you a chance to escape.",
                    {
                        "choices": {
                            "Return to the forest": "Forest",
                            "Go back to the village": "Village"
                        }
                    }
                ]
            }
        ]
    };

    // Add sample story to textarea
    jsonInput.value = JSON.stringify(sampleStory, null, 4);

    // Check for story in URL when page loads
    checkUrlForStory();
});