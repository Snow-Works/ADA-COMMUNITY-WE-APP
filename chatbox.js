
// THE CHATBOX SYSTEM

// 
// WAIT FOR HTML TO LOAD
// 

document.addEventListener("DOMContentLoaded", function () {


    // 
    // GETTING THE  HTML ELEMENTS
    //

    const chatArea =
        document.getElementById("chatArea");

    const textArea =
        document.getElementById("textArea");

    const sendButton =
        document.getElementById("sendButton");

    const typingIndicator =
        document.getElementById("typingIndicator");

    const sidebarNewChat =
        document.getElementById("sidebarNewChat");

    const conversationList =
        document.getElementById("conversationList");


    // 
    // STORAGE
    // 

    const STORAGE_KEY =
        "adaCommunityConversations";


    // 
    // CONVERSATION STATE (backend engine)
    // 

    let conversations = [];

    let activeConversationId = null;


    // 
    // CHECK REQUIRED THE HTML ELEMENTS
    // 
    if (!chatArea) {

        console.error(
            "ADA ERROR: #chatArea was not found."
        );

        return;
    }


    if (!textArea) {

        console.error(
            "ADA ERROR: #textArea was not found."
        );

        return;
    }


    if (!sendButton) {

        console.error(
            "ADA ERROR: #sendButton was not found."
        );

        return;
    }


    if (!typingIndicator) {

        console.error(
            "ADA ERROR: #typingIndicator was not found."
        );

        return;
    }


    // 
    // SAVE THE  CONVERSATIONS
    // 
    function saveConversations() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(conversations)
            );

            console.log(
                "ADA: conversations saved."
            );

        } catch (error) {

            console.error(
                "ADA ERROR: Could not save conversations.",
                error
            );

        }
    }


    // 
    // LOAD CONVERSATIONS
    // 

    function loadConversations() {

        try {

            const storedData =
                localStorage.getItem(
                    STORAGE_KEY
                );


            // No saved conversations

            if (!storedData) {

                conversations = [];

                return;

            }


            // Convert saved JSON back
            // into JavaScript data

            conversations =
                JSON.parse(storedData);


            // Make sure the result
            // is actually an array

            if (!Array.isArray(conversations)) {

                conversations = [];

            }


            console.log(
                "ADA: conversations loaded.",
                conversations
            );


        } catch (error) {

            console.error(
                "ADA ERROR: Unable to load conversations.",
                error
            );


            conversations = [];

        }
    }


    // =====================================
    // CREATE NEW CONVERSATION
    // =====================================

    function createConversation() {

        const conversation = {

            id:
                Date.now().toString(),

            title:
                "New Conversation",

            messages:
                [],

            createdAt:
                new Date().toISOString()

        };


        // Add newest conversation
        // to the beginning

        conversations.unshift(
            conversation
        );


        // Make it active

        activeConversationId =
            conversation.id;


        // Save

        saveConversations();


        // Update interface

        renderConversationHistory();

        renderConversation();


        return conversation;
    }


    // =====================================
    // GENERATE CONVERSATION TITLE
    // =====================================

    function generateConversationTitle(
        message
    ) {

        const cleanMessage =
            message.trim();


        const words =
            cleanMessage.split(/\s+/);


        // Short messages become
        // the conversation title

        if (words.length <= 6) {

            return cleanMessage;

        }


        // Long messages are shortened

        return (
            words
                .slice(0, 6)
                .join(" ") +
            "..."
        );
    }


    // =====================================
    // RENDER CONVERSATION HISTORY
    // =====================================

    function renderConversationHistory() {

        // If the history container
        // doesn't exist, stop here

        if (!conversationList) {

            return;

        }


        // Clear existing history

        conversationList.innerHTML = "";


        // Create a button for
        // every conversation

        conversations.forEach(
            function (conversation) {


                const button =
                    document.createElement("button");


                button.className =
                    "conversation-item";


                button.type =
                    "button";


                // Highlight active conversation

                if (
                    conversation.id ===
                    activeConversationId
                ) {

                    button.classList.add(
                        "active"
                    );

                }


                // Conversation title

                button.textContent =
                    conversation.title;


                // Open conversation
                // when clicked

                button.addEventListener(
                    "click",
                    function () {

                        openConversation(
                            conversation.id
                        );

                    }
                );


                conversationList.appendChild(
                    button
                );

            }
        );
    }


    // =====================================
    // OPEN EXISTING CONVERSATION
    // =====================================

    function openConversation(
        conversationId
    ) {

        const conversation =
            conversations.find(
                function (item) {

                    return (
                        item.id ===
                        conversationId
                    );

                }
            );


        // Conversation doesn't exist

        if (!conversation) {

            console.error(
                "ADA ERROR: Conversation not found."
            );

            return;

        }


        // Set active conversation

        activeConversationId =
            conversation.id;


        // Update interface

        renderConversationHistory();

        renderConversation();


        // Focus input

        textArea.focus();
    }


    // =====================================
    // RENDER CURRENT CONVERSATION
    // =====================================

    function renderConversation() {

        // Clear chat area

        chatArea.innerHTML = "";


        // Find active conversation

        const conversation =
            conversations.find(
                function (item) {

                    return (
                        item.id ===
                        activeConversationId
                    );

                }
            );


        // No conversation

        if (!conversation) {

            showEmptyChat();

            return;

        }


        // Conversation has no messages

        if (
            !conversation.messages ||
            conversation.messages.length === 0
        ) {

            showEmptyChat();

            return;

        }


        // Render every message

        conversation.messages.forEach(
            function (message) {

                renderMessage(
                    message.role,
                    message.content
                );

            }
        );


        // Scroll to bottom

        scrollChatToBottom();
    }


    // =====================================
    // RENDER INDIVIDUAL MESSAGE
    // =====================================

    function renderMessage(
        role,
        content
    ) {

        const messageWrapper =
            document.createElement("div");


        messageWrapper.className =
            `message ${role}`;


        const messageContent =
            document.createElement("div");


        messageContent.className =
            "message-content";


        messageContent.textContent =
            content;


        messageWrapper.appendChild(
            messageContent
        );


        chatArea.appendChild(
            messageWrapper
        );
    }


    // =====================================
    // EMPTY CHAT SCREEN
    // =====================================

    function showEmptyChat() {

        chatArea.innerHTML = `

            <div
                class="empty-chat"
                id="emptyChat"
            >

                <div class="empty-chat-icon">
                    ✦
                </div>

                <h1>
                    How can ADA help you?
                </h1>

                <p>
                    Start a conversation by
                    sending a message below.
                </p>

            </div>

        `;
    }


    // =====================================
    // SCROLL CHAT TO BOTTOM
    // =====================================

    function scrollChatToBottom() {

        chatArea.scrollTop =
            chatArea.scrollHeight;
    }


    // =====================================
    // SHOW TYPING INDICATOR
    // =====================================

    function showTypingIndicator() {

        if (!typingIndicator) {

            return;

        }


        typingIndicator.classList.add(
            "active"
        );
    }


    // =====================================
    // HIDE TYPING INDICATOR
    // =====================================

    function hideTypingIndicator() {

        if (!typingIndicator) {

            return;

        }


        typingIndicator.classList.remove(
            "active"
        );
    }


    // =====================================
    // ADA TEMPORARY RESPONSE
    // =====================================
    //
    // IMPORTANT:
    // This is currently a simulated response.
    //
    // Later we will replace this with:
    //
    // chatbox.js
    //      ↓
    // fetch()
    //      ↓
    // Node.js / Express
    //      ↓
    // AI API
    //
    // =====================================

    function simulateADAResponse(
        conversation
    ) {

        console.log(
            "ADA: preparing response..."
        );


        // Show typing indicator

        showTypingIndicator();


        // Wait 1.5 seconds

        setTimeout(
            function () {


                const response =
                    "Hello! I'm ADA. I received your message. How can I help you today?";


                console.log(
                    "ADA: response generated."
                );


                // ---------------------------------
                // SAVE ADA MESSAGE
                // ---------------------------------

                conversation.messages.push({

                    role:
                        "ai",

                    content:
                        response,

                    createdAt:
                        new Date().toISOString()

                });


                // ---------------------------------
                // SAVE CONVERSATION
                // ---------------------------------

                saveConversations();


                // ---------------------------------
                // HIDE TYPING INDICATOR
                // ---------------------------------

                hideTypingIndicator();


                // ---------------------------------
                // RENDER ADA RESPONSE
                // ---------------------------------

                renderConversation();


                console.log(
                    "ADA: response displayed."
                );


            },
            1500
        );
    }


    // =====================================
    // SEND MESSAGE
    // =====================================

    function sendMessage() {

        // Get text from textarea

        const message =
            textArea.value.trim();


        // Don't send empty messages

        if (message === "") {

            textArea.focus();

            return;

        }


        console.log(
            "USER MESSAGE:",
            message
        );


        // =================================
        // CREATE CONVERSATION IF NEEDED
        // =================================

        if (!activeConversationId) {

            createConversation();

        }


        // =================================
        // FIND ACTIVE CONVERSATION
        // =================================

        const conversation =
            conversations.find(
                function (item) {

                    return (
                        item.id ===
                        activeConversationId
                    );

                }
            );


        // Conversation wasn't found

        if (!conversation) {

            console.error(
                "ADA ERROR: Active conversation not found."
            );

            return;

        }


        // =================================
        // SAVE USER MESSAGE
        // =================================

        conversation.messages.push({

            role:
                "user",

            content:
                message,

            createdAt:
                new Date().toISOString()

        });


        // =================================
        // CREATE CONVERSATION TITLE
        // =================================

        if (
            conversation.title ===
            "New Conversation"
        ) {

            conversation.title =
                generateConversationTitle(
                    message
                );

        }


        // =================================
        // SAVE UPDATED CONVERSATION
        // =================================

        saveConversations();


        // =================================
        // CLEAR INPUT
        // =================================

        textArea.value = "";


        // =================================
        // DISPLAY USER MESSAGE
        // =================================

        renderConversation();


        // =================================
        // UPDATE CONVERSATION HISTORY
        // =================================

        renderConversationHistory();


        // =================================
        // ASK ADA FOR RESPONSE
        // =================================

        simulateADAResponse(
            conversation
        );


        // =================================
        // RETURN FOCUS TO TEXTAREA
        // =================================

        textArea.focus();
    }


    // =====================================
    // SEND BUTTON
    // =====================================

    sendButton.addEventListener(
        "click",
        function () {

            sendMessage();

        }
    );


    // =====================================
    // ENTER TO SEND
    // =====================================

    textArea.addEventListener(
        "keydown",
        function (event) {

            // Enter without Shift

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );


    // =====================================
    // NEW CHAT
    // =====================================

    function startNewChat() {

        console.log(
            "ADA: starting new chat..."
        );


        // Create conversation

        const conversation =
            createConversation();


        // Make sure it is active

        activeConversationId =
            conversation.id;


        // Clear input

        textArea.value = "";


        // Render empty conversation

        renderConversation();

        renderConversationHistory();


        // Focus textarea

        textArea.focus();


        console.log(
            "ADA: new chat created."
        );
    }


    // =====================================
    // SIDEBAR NEW CHAT BUTTON
    // =====================================

    if (sidebarNewChat) {

        sidebarNewChat.addEventListener(
            "click",
            function () {

                startNewChat();

            }
        );

    }


    // =====================================
    // INITIALIZE DASHBOARD
    // =====================================

    console.log(
        "ADA: loading conversations..."
    );


    loadConversations();


    // =====================================
    // RESTORE EXISTING CONVERSATIONS
    // =====================================

    if (
        conversations.length > 0
    ) {

        // Open most recent conversation

        activeConversationId =
            conversations[0].id;


        renderConversationHistory();

        renderConversation();


        console.log(
            "ADA: previous conversations restored."
        );


    } else {


        // =================================
        // CREATE FIRST CONVERSATION
        // =================================

        createConversation();


        console.log(
            "ADA: first conversation created."
        );

    }


    // =====================================
    // FINAL DEBUG MESSAGE
    // =====================================

    console.log(
        "ADA Community dashboard loaded successfully."
    );

});