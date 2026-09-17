/* =========================================
   ADA COMMUNITY — CHATBOX (ADA AI)
   Handles:
     · Auth guard
     · Conversation persistence (localStorage)
     · Drawer open/close
     · Message rendering
     · Typing indicator
     · Keyword-aware mock AI responses
     · Suggested prompts derived from user's roadmap
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* ========== GUARDS ========== */

    if (!window.adaAuth) {
        console.error("ADA: auth.js must load before chatbox.js.");
        return;
    }

    const currentUser = window.adaAuth.getCurrentUser();

    if (!currentUser) {
        window.location.href = "signin.html";
        return;
    }


    /* ========== DOM REFERENCES ========== */

    const chatArea        = document.getElementById("chatArea");
    const composerInput   = document.getElementById("composerInput");
    const composerSend    = document.getElementById("composerSend");

    const menuBtn         = document.getElementById("chatboxMenuBtn");
    const drawer          = document.getElementById("chatboxDrawer");
    const drawerClose     = document.getElementById("chatboxDrawerClose");
    const overlay         = document.getElementById("chatboxOverlay");

    const avatarEl        = document.getElementById("chatboxAvatar");
    const conversationList = document.getElementById("conversationList");
    const newChatBtn      = document.getElementById("newChatBtn");


    /* ========== STORAGE ========== */

    const STORAGE_KEY = "adaCommunityConversations";

    let conversations = [];
    let activeConversationId = null;


    /* =========================================
       HELPERS
       ========================================= */

    function getInitials(user) {
        const first = (user.firstName || "").trim();
        const last  = (user.surname   || "").trim();
        const f = first ? first.charAt(0) : "";
        const l = last  ? last.charAt(0)  : "";
        return (f + l).toUpperCase() || "··";
    }

    function loadConversations() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    function saveConversations() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
        } catch (error) {
            console.error("ADA: could not save conversations.", error);
        }
    }

    function generateTitle(text) {
        const clean = String(text || "").trim();
        const words = clean.split(/\s+/);
        if (words.length <= 6) return clean || "New Conversation";
        return words.slice(0, 6).join(" ") + "…";
    }


    /* =========================================
       MOCK AI RESPONSES
       Keyword matching → then generic pool → random delay
       ========================================= */

    const KEYWORD_REPLIES = [
        { match: /\b(prompt|prompting|prompt engineering)\b/i,
          reply: "Prompting is the skill of giving clear, structured instructions to an AI. The pattern that works best: role → task → context → format. Tell it who it should be, what you want, why, and how the answer should look. Want me to show an example?" },

        { match: /\b(learn|learning|study|start|begin|beginner)\b/i,
          reply: "Learning AI is a path, not a sprint. My suggestion: pick one tool, one niche, and one small project to build this week. Depth beats breadth early on. What's the first thing you'd like to make?" },

        { match: /\b(engineer|coding|code|developer|programming)\b/i,
          reply: "Engineering with AI means using the model as a thinking partner — not a code machine. Ask it to critique your design, explore tradeoffs, or spot edge cases. That's where the leverage lives." },

        { match: /\b(roadmap|path|career|niche)\b/i,
          reply: "Your roadmap is a compass, not a checklist. Revisit it every few weeks and adjust as your skills grow. The goal is momentum, not perfect planning." },

        { match: /\b(chatgpt|gpt|openai)\b/i,
          reply: "GPT-4o is a strong all-rounder — great for reasoning, drafting, and iterating. Try giving it a role in the system prompt for noticeably sharper output." },

        { match: /\b(claude|anthropic)\b/i,
          reply: "Claude excels at long-context reasoning and clean writing. If you're working with big documents or careful editing, it's a great first pick." },

        { match: /\b(gemini|google)\b/i,
          reply: "Gemini's strength is multimodal — combining text, images, and native tools. Useful for research and cross-format work." },

        { match: /\b(hello|hi|hey|yo|start)\b/i,
          reply: "Hey! What are you working on today? I can help with prompts, roadmaps, tool selection, or just thinking through an idea." },

        { match: /\b(thank|thanks|cheers)\b/i,
          reply: "Anytime. If you want to go deeper on anything, just ask." }
    ];

    const GENERIC_REPLIES = [
        "That's a good question. Here's how I'd think about it: split the problem into what you already know, what you need to learn, and what you can test today. Momentum beats planning.",
        "Interesting. Could you tell me a bit more? I'll give you a sharper answer once I understand the context.",
        "Noted. One approach worth trying: start with the smallest useful version of this, ship it, and iterate. Progress compounds.",
        "Good direction. My take: reach for the tools you already have before adding new ones. Depth is underrated right now.",
        "I hear you. Let me offer one angle — what would success look like in a week? Work backwards from there.",
        "Here's a thought: the best AI users aren't the ones who know every tool. They're the ones who know which tool to reach for and when."
    ];

    function pickMockReply(message) {
        const clean = String(message || "").trim();
        for (const rule of KEYWORD_REPLIES) {
            if (rule.match.test(clean)) return rule.reply;
        }
        return GENERIC_REPLIES[Math.floor(Math.random() * GENERIC_REPLIES.length)];
    }


    /* =========================================
       USER-FACING GREETING + SUGGESTIONS
       ========================================= */

    function getFirstName() {
        return (currentUser.firstName || "").trim() || "there";
    }

    function getUserNiches() {
        return (currentUser.roadmap && currentUser.roadmap.niches) || [];
    }

    function buildSuggestions() {
        const niches = getUserNiches();
        const prompts = [];

        if (niches[0]) prompts.push(`How do I get started with ${niches[0]}?`);
        if (niches[1]) prompts.push(`What should I focus on first in ${niches[1]}?`);
        prompts.push("What is prompt engineering?");

        return prompts.slice(0, 3);
    }


    /* =========================================
       EMPTY STATE
       ========================================= */

    function renderEmptyState() {
        const initials = getInitials(currentUser);
        const niches = getUserNiches();
        const suggestions = buildSuggestions();

        const pathsHtml = niches.length
            ? `<div class="chat-empty-paths">
                 ${niches.map(n => `<span class="chat-empty-path-chip">${escapeHtml(n)}</span>`).join("")}
               </div>`
            : "";

        chatArea.innerHTML = `
            <div class="chat-empty">
                <div class="chat-empty-icon" aria-hidden="true">✦</div>

                <h1 class="chat-empty-greeting">
                    Hi <span>${escapeHtml(getFirstName())}</span>, I'm ADA
                </h1>

                <p class="chat-empty-sub">
                    Ask me anything about AI tools, prompts, or your learning path.
                </p>

                ${pathsHtml}

                <div class="chat-suggestions" role="list">
                    ${suggestions.map(text => `
                        <button class="suggestion-btn" type="button" role="listitem"
                                data-prompt="${escapeAttr(text)}">
                            <span class="suggestion-icon" aria-hidden="true">✦</span>
                            <span>${escapeHtml(text)}</span>
                        </button>
                    `).join("")}
                </div>
            </div>
        `;

        chatArea.querySelectorAll(".suggestion-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const prompt = btn.getAttribute("data-prompt");
                if (!prompt) return;
                composerInput.value = prompt;
                resizeComposer();
                sendMessage();
            });
        });
    }

    function escapeHtml(s) {
        return String(s ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    function escapeAttr(s) { return escapeHtml(s); }


    /* =========================================
       MESSAGE RENDERING
       ========================================= */

    function appendMessage(role, content) {
        const wrap = document.createElement("div");
        wrap.className = `message ${role}`;

        const bubble = document.createElement("div");
        bubble.className = "message-content";
        bubble.textContent = content;

        wrap.appendChild(bubble);
        chatArea.appendChild(wrap);
    }

    function showTyping() {
        const row = document.createElement("div");
        row.className = "typing-row";
        row.id = "typingRow";

        row.innerHTML = `
            <div class="typing-bubble">
                <div class="typing-dots">
                    <span></span><span></span><span></span>
                </div>
                <span class="typing-label">ADA is thinking…</span>
            </div>
        `;
        chatArea.appendChild(row);
        scrollToBottom();
    }

    function hideTyping() {
        const row = document.getElementById("typingRow");
        if (row) row.remove();
    }

    function scrollToBottom() {
        chatArea.scrollTop = chatArea.scrollHeight;
    }


    /* =========================================
       CONVERSATION — CREATE / OPEN / RENDER
       ========================================= */

    function createConversation(firstMessage) {
        const conversation = {
            id: Date.now().toString(),
            title: generateTitle(firstMessage),
            messages: [],
            createdAt: new Date().toISOString()
        };
        conversations.unshift(conversation);
        activeConversationId = conversation.id;
        saveConversations();
        renderConversationList();
        return conversation;
    }

    function getActiveConversation() {
        return conversations.find(c => c.id === activeConversationId) || null;
    }

    function openConversation(id) {
        activeConversationId = id;
        renderConversationList();
        renderActiveConversation();
        closeMenu();
    }

    function renderActiveConversation() {
        const conv = getActiveConversation();

        if (!conv || !conv.messages || conv.messages.length === 0) {
            renderEmptyState();
            return;
        }

        chatArea.innerHTML = "";
        conv.messages.forEach((m) => appendMessage(m.role, m.content));
        scrollToBottom();
    }

    function renderConversationList() {
        if (!conversationList) return;

        conversationList.innerHTML = "";

        if (conversations.length === 0) {
            const empty = document.createElement("div");
            empty.className = "conversation-empty";
            empty.textContent = "No conversations yet.";
            conversationList.appendChild(empty);
            return;
        }

        conversations.forEach((c) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "conversation-item";
            if (c.id === activeConversationId) btn.classList.add("active");
            btn.textContent = c.title || "Untitled";
            btn.addEventListener("click", () => openConversation(c.id));
            conversationList.appendChild(btn);
        });
    }


    /* =========================================
       SEND MESSAGE
       ========================================= */

    function sendMessage() {
        const text = composerInput.value.trim();
        if (!text) return;

        /* Ensure there's an active conversation */
        let conversation = getActiveConversation();
        const isNew = !conversation;

        if (!conversation) {
            conversation = createConversation(text);
        }

        /* Save user message */
        conversation.messages.push({
            role: "user",
            content: text,
            createdAt: new Date().toISOString()
        });
        saveConversations();

        /* Render immediately */
        if (isNew) {
            chatArea.innerHTML = "";
        }
        appendMessage("user", text);
        scrollToBottom();

        /* Clear composer */
        composerInput.value = "";
        resizeComposer();
        updateSendButton();

        /* Ask "ADA" */
        respondTo(conversation, text);
    }

    function respondTo(conversation, userMessage) {
        showTyping();

        const reply = pickMockReply(userMessage);
        const delay = 800 + Math.random() * 1400; /* 0.8s – 2.2s */

        setTimeout(() => {
            hideTyping();

            conversation.messages.push({
                role: "ai",
                content: reply,
                createdAt: new Date().toISOString()
            });
            saveConversations();

            appendMessage("ai", reply);
            scrollToBottom();
        }, delay);
    }


    /* =========================================
       COMPOSER AUTO-RESIZE + SEND STATE
       ========================================= */

    function resizeComposer() {
        composerInput.style.height = "auto";
        composerInput.style.height = Math.min(composerInput.scrollHeight, 180) + "px";
    }

    function updateSendButton() {
        composerSend.disabled = composerInput.value.trim().length === 0;
    }


    /* =========================================
       DRAWER
       ========================================= */

    function openMenu() {
        drawer.classList.add("open");
        overlay.classList.add("active");
        document.body.classList.add("menu-lock");
        menuBtn.setAttribute("aria-expanded", "true");
    }

    function closeMenu() {
        drawer.classList.remove("open");
        overlay.classList.remove("active");
        document.body.classList.remove("menu-lock");
        menuBtn.setAttribute("aria-expanded", "false");
    }

    function toggleMenu() {
        if (drawer.classList.contains("open")) closeMenu();
        else openMenu();
    }


    /* =========================================
       WIRING
       ========================================= */

    menuBtn.addEventListener("click", toggleMenu);
    drawerClose.addEventListener("click", closeMenu);
    overlay.addEventListener("click", closeMenu);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && drawer.classList.contains("open")) closeMenu();
    });

    newChatBtn.addEventListener("click", () => {
        activeConversationId = null;
        renderConversationList();
        renderActiveConversation();
        closeMenu();
        composerInput.focus();
    });

    composerInput.addEventListener("input", () => {
        resizeComposer();
        updateSendButton();
    });

    composerInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    composerSend.addEventListener("click", sendMessage);


    /* =========================================
       INITIAL RENDER
       ========================================= */

    avatarEl.textContent = getInitials(currentUser);

    conversations = loadConversations();

    /* Open the most recent conversation if one exists */
    if (conversations.length > 0) {
        activeConversationId = conversations[0].id;
        renderActiveConversation();
    } else {
        renderEmptyState();
    } 

    renderConversationList();
    resizeComposer();
    updateSendButton();

});





