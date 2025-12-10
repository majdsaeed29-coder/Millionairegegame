/**
 * Millionaire Game Engine - Main Game Controller
 * Complete game logic, state management, and flow control
 */

class GameEngine {
    constructor(config, questionBank, securityManager) {
        // ========== DEPENDENCIES ==========
        this.config = config;
        this.questionBank = questionBank;
        this.security = securityManager;
        
        // ========== GAME STATE ==========
        this.state = {
            // Current screen
            screen: 'start',
            
            // Player data
            player: {
                name: 'المتنافس',
                avatar: '👤',
                score: 0,
                level: 1,
                xp: 0,
                xpToNext: 1000,
                streak: 0,
                stats: {
                    gamesPlayed: 0,
                    totalCorrect: 0,
                    totalQuestions: 0,
                    totalMoney: 0,
                    bestScore: 0,
                    avgTime: 0,
                    highestStreak: 0,
                    perfectGames: 0
                }
            },
            
            // Game session data
            game: {
                currentQuestion: 0,
                selectedAnswer: null,
                isAnswered: false,
                timeLeft: 45,
                timer: null,
                lifelinesUsed: [],
                questions: [],
                startTime: null,
                correctAnswers: 0,
                totalTime: 0,
                difficultyLevel: 'easy',
                category: 'عام',
                isPaused: false,
                safeHavenReached: false
            },
            
            // User settings
            settings: {
                sound: true,
                vibration: true,
                animations: true,
                autoNext: false,
                timerEnabled: true,
                showHints: true,
                theme: 'default'
            },
            
            // Premium status
            isPremium: false,
            
            // Session tracking
            sessionId: null
        };
        
        // ========== DOM ELEMENTS CACHE ==========
        this.elements = {};
        
        // ========== INITIALIZATION ==========
        this.init();
    }
    
    /**
     * Initialize the game engine
     */
    async init() {
        console.log('🎮 Game Engine Initializing...');
        
        try {
            // Generate session ID
            this.state.sessionId = this.security.generateSessionId();
            
            // Cache DOM elements
            this.cacheElements();
            
            // Load saved data
            this.loadSavedData();
            
            // Initialize UI
            this.initializeUI();
            
            // Bind events
            this.bindEvents();
            
            // Start background tasks
            this.startBackgroundTasks();
            
            console.log('✅ Game Engine Ready');
            
            // Welcome message
            setTimeout(() => {
                this.showNotification('مرحباً بك في من سريع المليون! 🎮', 'info');
            }, 1500);
            
        } catch (error) {
            console.error('❌ Game Engine Initialization Failed:', error);
            this.showFatalError(error.message);
        }
    }
    
    /**
     * Cache DOM elements for performance
     */
    cacheElements() {
        // Screens
        this.elements.screens = {
            start: document.getElementById('start-screen'),
            game: document.getElementById('game-screen'),
            results: document.getElementById('results-screen')
        };
        
        // Player elements
        this.elements.player = {
            name: document.getElementById('player-name'),
            avatar: document.getElementById('player-avatar'),
            currentName: document.getElementById('current-player'),
            currentAvatar: document.getElementById('current-avatar'),
            level: document.getElementById('player-level')
        };
        
        // Game info elements
        this.elements.gameInfo = {
            timeLeft: document.getElementById('time-left'),
            currentScore: document.getElementById('current-score'),
            streakCount: document.getElementById('streak-count'),
            questionNumber: document.getElementById('q-number'),
            questionsLeft: document.getElementById('questions-left'),
            currentCategory: document.getElementById('current-category'),
            questionValue: document.getElementById('question-value'),
            questionText: document.getElementById('question-text'),
            questionHint: document.getElementById('question-hint')
        };
        
        // Containers
        this.elements.containers = {
            categories: document.getElementById('categories-container'),
            answers: document.getElementById('answers-container'),
            prizeTrack: document.getElementById('prize-track-container'),
            leaderboard: document.getElementById('leaderboard'),
            notifications: document.getElementById('notification-container')
        };
        
        // Buttons
        this.elements.buttons = {
            start: document.getElementById('start-game'),
            quickPlay: document.getElementById('quick-play'),
            next: document.getElementById('next-btn'),
            quit: document.getElementById('quit-btn'),
            playAgain: document.getElementById('play-again-btn'),
            share: document.getElementById('share-result-btn'),
            mainMenu: document.getElementById('main-menu-btn'),
            stats: document.getElementById('stats-btn'),
            sound: document.getElementById('sound-btn'),
            help: document.getElementById('help-btn'),
            subscribe: document.getElementById('subscribe-btn')
        };
        
        // Lifelines
        this.elements.lifelines = {
            '5050': document.getElementById('lifeline-5050'),
            'call': document.getElementById('lifeline-call'),
            'audience': document.getElementById('lifeline-audience'),
            'skip': document.getElementById('lifeline-skip')
        };
        
        // Results elements
        this.elements.results = {
            icon: document.getElementById('result-icon'),
            title: document.getElementById('result-title'),
            subtitle: document.getElementById('result-subtitle'),
            finalAmount: document.getElementById('final-amount'),
            prizeConversion: document.getElementById('prize-conversion'),
            correctCount: document.getElementById('correct-count'),
            totalTime: document.getElementById('total-time'),
            avgTime: document.getElementById('avg-time'),
            accuracy: document.getElementById('accuracy')
        };
        
        // Audio elements
        this.elements.audio = {
            correct: document.getElementById('sound-correct'),
            wrong: document.getElementById('sound-wrong'),
            click: document.getElementById('sound-click'),
            win: document.getElementById('sound-win')
        };
        
        // Modals container
        this.elements.modalsContainer = document.getElementById('modals-container') || document.body;
    }
    
    /**
     * Load saved data from localStorage
     */
    loadSavedData() {
        try {
            // Load player data
            const savedPlayer = localStorage.getItem('millionaire_player_data');
            if (savedPlayer) {
                const playerData = this.security.decrypt(savedPlayer);
                if (playerData) {
                    this.state.player = { ...this.state.player, ...playerData };
                }
            }
            
            // Load settings
            const savedSettings = localStorage.getItem('millionaire_settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                this.state.settings = { ...this.state.settings, ...settings };
            }
            
            // Load subscription
            const savedSubscription = localStorage.getItem('millionaire_subscription');
            if (savedSubscription) {
                const subscription = this.security.decrypt(savedSubscription);
                this.state.isPremium = this.security.validateSubscription(subscription);
            }
            
            console.log('📂 Game data loaded');
            
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }
    
    /**
     * Save game data to localStorage
     */
    saveGameData() {
        try {
            // Encrypt and save player data
            const encryptedPlayer = this.security.encrypt(this.state.player);
            if (encryptedPlayer) {
                localStorage.setItem('millionaire_player_data', encryptedPlayer);
            }
            
            // Save settings
            localStorage.setItem('millionaire_settings', JSON.stringify(this.state.settings));
            
            // Save high scores
            this.saveHighScores();
            
            // Save game statistics
            this.saveGameStats();
            
        } catch (error) {
            console.error('Error saving game data:', error);
        }
    }
    
    /**
     * Save high scores
     */
    saveHighScores() {
        try {
            const scores = JSON.parse(localStorage.getItem('millionaire_high_scores') || '[]');
            
            const newScore = {
                name: this.state.player.name,
                avatar: this.state.player.avatar,
                score: this.state.player.score,
                level: this.state.player.level,
                category: this.state.game.category,
                date: new Date().toISOString(),
                correctAnswers: this.state.game.correctAnswers,
                totalTime: this.state.game.totalTime,
                sessionId: this.state.sessionId
            };
            
            scores.push(newScore);
            
            // Sort by score (descending)
            scores.sort((a, b) => b.score - a.score);
            
            // Keep only top 100 scores
            const topScores = scores.slice(0, 100);
            
            // Encrypt scores
            const encryptedScores = this.security.encrypt(topScores);
            if (encryptedScores) {
                localStorage.setItem('millionaire_high_scores', encryptedScores);
            }
            
        } catch (error) {
            console.error('Error saving high scores:', error);
        }
    }
    
    /**
     * Save game statistics
     */
    saveGameStats() {
        try {
            const stats = JSON.parse(localStorage.getItem('millionaire_game_stats') || '{}');
            
            stats.totalGamesPlayed = (stats.totalGamesPlayed || 0) + 1;
            stats.totalCorrectAnswers = (stats.totalCorrectAnswers || 0) + this.state.game.correctAnswers;
            stats.totalMoneyWon = (stats.totalMoneyWon || 0) + this.state.player.score;
            stats.totalPlayTime = (stats.totalPlayTime || 0) + this.state.game.totalTime;
            
            if (this.state.player.score > (stats.bestScore || 0)) {
                stats.bestScore = this.state.player.score;
                stats.bestScoreDate = new Date().toISOString();
            }
            
            localStorage.setItem('millionaire_game_stats', JSON.stringify(stats));
            
        } catch (error) {
            console.error('Error saving game stats:', error);
        }
    }
    
    /**
     * Initialize UI components
     */
    initializeUI() {
        // Set player name and avatar
        if (this.elements.player.name) {
            this.elements.player.name.value = this.state.player.name;
        }
        
        if (this.elements.player.avatar) {
            this.elements.player.avatar.value = this.state.player.avatar;
        }
        
        // Update player info display
        this.updatePlayerInfo();
        
        // Load categories
        this.loadCategories();
        
        // Update settings UI
        this.updateSettingsUI();
        
        // Check premium status
        this.checkPremiumStatus();
    }
    
    /**
     * Update player info display
     */
    updatePlayerInfo() {
        // Update name
        if (this.elements.player.currentName) {
            this.elements.player.currentName.textContent = this.state.player.name;
        }
        
        // Update avatar
        if (this.elements.player.currentAvatar) {
            this.elements.player.currentAvatar.textContent = this.state.player.avatar;
        }
        
        // Update level
        if (this.elements.player.level) {
            this.elements.player.level.textContent = `المستوى ${this.state.player.level}`;
        }
        
        // Update score
        if (this.elements.gameInfo.currentScore) {
            this.elements.gameInfo.currentScore.textContent = this.state.player.score.toLocaleString();
        }
        
        // Update streak
        if (this.elements.gameInfo.streakCount) {
            this.elements.gameInfo.streakCount.textContent = this.state.player.streak;
        }
    }
    
    /**
     * Load categories to UI
     */
    loadCategories() {
        if (!this.elements.containers.categories) return;
        
        const categories = this.questionBank.getAllCategories();
        
        this.elements.containers.categories.innerHTML = '';
        
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'category-btn';
            
            if (category.id === this.state.game.category) {
                button.classList.add('selected');
            }
            
            button.dataset.category = category.id;
            button.innerHTML = `
                <div class="category-icon">${category.icon}</div>
                <div class="category-name">${category.name}</div>
                <div class="category-desc">${category.description}</div>
                <div class="category-stats">
                    <span>${category.questionCount.total} سؤال</span>
                </div>
            `;
            
            button.addEventListener('click', () => this.selectCategory(category.id));
            
            this.elements.containers.categories.appendChild(button);
        });
    }
    
    /**
     * Select category
     */
    selectCategory(categoryId) {
        this.state.game.category = categoryId;
        
        // Update UI
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.category === categoryId) {
                btn.classList.add('selected');
            }
        });
        
        this.playSound('click');
        this.showNotification(`تم اختيار فئة: ${this.getCategoryName(categoryId)}`);
    }
    
    /**
     * Get category name by ID
     */
    getCategoryName(categoryId) {
        const category = Object.values(this.config.CATEGORIES).find(
            cat => cat.id === categoryId
        );
        
        return category ? category.name : 'عام';
    }
    
    /**
     * Update settings UI
     */
    updateSettingsUI() {
        // Update sound button
        if (this.elements.buttons.sound) {
            const icon = this.elements.buttons.sound.querySelector('i');
            if (icon) {
                icon.className = this.state.settings.sound ? 
                    'fas fa-volume-up' : 'fas fa-volume-mute';
            }
        }
        
        // Update timer settings
        this.updateTimerSettings();
    }
    
    /**
     * Update timer settings UI
     */
    updateTimerSettings() {
        const timerOptions = document.querySelectorAll('.timer-option');
        
        timerOptions.forEach(option => {
            option.classList.remove('active');
            
            const isActive = (option.dataset.timer === 'true') === this.state.settings.timerEnabled;
            if (isActive) {
                option.classList.add('active');
            }
        });
    }
    
    /**
     * Check and update premium status
     */
    checkPremiumStatus() {
        if (this.state.isPremium) {
            const badge = document.getElementById('premium-indicator');
            if (badge) {
                badge.style.display = 'inline-flex';
            }
            
            // Update subscribe button
            if (this.elements.buttons.subscribe) {
                this.elements.buttons.subscribe.innerHTML = '<i class="fas fa-crown"></i>';
                this.elements.buttons.subscribe.title = 'مشترك مميز';
            }
        }
    }
    
    /**
     * Start a new game
     */
    async startGame(options = {}) {
        try {
            // Reset game state
            this.resetGameState();
            
            // Apply options
            if (options.category) {
                this.state.game.category = options.category;
            }
            
            if (options.difficulty) {
                this.state.game.difficultyLevel = options.difficulty;
            }
            
            // Generate questions
            await this.generateQuestions();
            
            // Check if we have enough questions
            if (this.state.game.questions.length < this.config.MAX_QUESTIONS) {
                this.showNotification('لا يمكن تحميل الأسئلة حالياً', 'error');
                return;
            }
            
            // Switch to game screen
            this.switchScreen('game');
            
            // Update prize track
            this.updatePrizeTrack();
            
            // Display first question
            this.displayCurrentQuestion();
            
            // Start timer
            this.startTimer();
            
            // Record start time
            this.state.game.startTime = Date.now();
            
            // Play sound
            this.playSound('click');
            
            // Show notification
            this.showNotification('بدأت اللعبة! حظاً موفقاً 🚀', 'success');
            
            // Log game start
            this.security.logSecurityEvent('game_start', {
                category: this.state.game.category,
                difficulty: this.state.game.difficultyLevel
            });
            
        } catch (error) {
            console.error('Error starting game:', error);
            this.showNotification('حدث خطأ في بدء اللعبة', 'error');
        }
    }
    
    /**
     * Start quick play game
     */
    startQuickPlay() {
        const categories = this.questionBank.getAllCategories();
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        
        this.startGame({
            category: randomCategory.id,
            difficulty: 'easy'
        });
    }
    
    /**
     * Reset game state
     */
    resetGameState() {
        // Calculate initial difficulty based on player level
        let initialDifficulty = 'easy';
        if (this.state.player.level > 10) initialDifficulty = 'medium';
        if (this.state.player.level > 20) initialDifficulty = 'hard';
        
        this.state.game = {
            currentQuestion: 0,
            selectedAnswer: null,
            isAnswered: false,
            timeLeft: this.config.TIME_PER_QUESTION[initialDifficulty.toUpperCase()],
            timer: null,
            lifelinesUsed: [],
            questions: [],
            startTime: null,
            correctAnswers: 0,
            totalTime: 0,
            difficultyLevel: initialDifficulty,
            category: this.state.game.category || 'عام',
            isPaused: false,
            safeHavenReached: false
        };
        
        this.state.player.score = 0;
        this.state.player.streak = 0;
        
        // Reset lifelines
        this.resetLifelines();
        
        // Reset question bank usage
        this.questionBank.resetUsedQuestions(this.state.game.category, initialDifficulty);
    }
    
    /**
     * Reset lifelines
     */
    resetLifelines() {
        Object.keys(this.elements.lifelines).forEach(key => {
            const lifeline = this.elements.lifelines[key];
            if (lifeline) {
                lifeline.disabled = false;
                lifeline.style.opacity = '1';
            }
        });
    }
    
    /**
     * Generate questions for the game
     */
    async generateQuestions() {
        this.state.game.questions = [];
        
        // Get questions from question bank
        const questions = this.questionBank.getGameQuestions(
            this.state.game.category,
            false
        );
        
        // Validate questions
        const validQuestions = questions.filter(q => q && q.id);
        
        // Add fallback questions if needed
        if (validQuestions.length < this.config.MAX_QUESTIONS) {
            const needed = this.config.MAX_QUESTIONS - validQuestions.length;
            for (let i = 0; i < needed; i++) {
                validQuestions.push(this.questionBank.getFallbackQuestion());
            }
        }
        
        this.state.game.questions = validQuestions.slice(0, this.config.MAX_QUESTIONS);
    }
    
    /**
     * Display current question
     */
    displayCurrentQuestion() {
        const question = this.state.game.questions[this.state.game.currentQuestion];
        
        if (!question) {
            console.error('No question found');
            this.showNotification('خطأ في تحميل السؤال', 'error');
            return;
        }
        
        // Update question number
        if (this.elements.gameInfo.questionNumber) {
            this.elements.gameInfo.questionNumber.textContent = this.state.game.currentQuestion + 1;
        }
        
        // Update question value
        if (this.elements.gameInfo.questionValue) {
            const prize = this.config.PRIZES[this.state.game.currentQuestion];
            this.elements.gameInfo.questionValue.textContent = `${prize.toLocaleString()} دينار`;
        }
        
        // Update category
        if (this.elements.gameInfo.currentCategory) {
            const category = this.getCategoryName(question.category);
            this.elements.gameInfo.currentCategory.textContent = category;
            
            // Set category color
            const categoryObj = Object.values(this.config.CATEGORIES).find(
                cat => cat.id === question.category
            );
            
            if (categoryObj && categoryObj.color) {
                this.elements.gameInfo.currentCategory.style.backgroundColor = categoryObj.color;
            }
        }
        
        // Update question text
        if (this.elements.gameInfo.questionText) {
            this.elements.gameInfo.questionText.textContent = question.question;
        }
        
        // Update questions left
        if (this.elements.gameInfo.questionsLeft) {
            const questionsLeft = this.config.MAX_QUESTIONS - this.state.game.currentQuestion - 1;
            this.elements.gameInfo.questionsLeft.textContent = `${questionsLeft} أسئلة متبقية`;
        }
        
        // Hide hint initially
        if (this.elements.gameInfo.questionHint) {
            this.elements.gameInfo.questionHint.style.display = 'none';
        }
        
        // Display answers
        this.displayAnswers(question.answers);
        
        // Reset answer selection
        this.state.game.selectedAnswer = null;
        this.state.game.isAnswered = false;
        
        // Update timer
        this.updateQuestionTimer();
        
        // Update lifelines state
        this.updateLifelinesState();
        
        // Disable next button
        if (this.elements.buttons.next) {
            this.elements.buttons.next.disabled = true;
        }
        
        // Schedule hint display
        if (this.state.settings.showHints && question.hint) {
            setTimeout(() => {
                this.showQuestionHint(question.hint);
            }, 10000); // 10 seconds
        }
    }
    
    /**
     * Display answers
     */
    displayAnswers(answers) {
        if (!this.elements.containers.answers || !Array.isArray(answers)) {
            return;
        }
        
        this.elements.containers.answers.innerHTML = '';
        const letters = ['أ', 'ب', 'ج', 'د'];
        
        answers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.dataset.index = index;
            button.innerHTML = `
                <div class="answer-letter">${letters[index]}</div>
                <div class="answer-text">${answer}</div>
            `;
            
            button.addEventListener('click', () => this.selectAnswer(index));
            
            this.elements.containers.answers.appendChild(button);
        });
    }
    
    /**
     * Show question hint
     */
    showQuestionHint(hint) {
        if (!this.elements.gameInfo.questionHint || this.state.game.isAnswered) {
            return;
        }
        
        this.elements.gameInfo.questionHint.innerHTML = `
            <i class="fas fa-lightbulb"></i>
            <span>${hint}</span>
        `;
        
        this.elements.gameInfo.questionHint.style.display = 'flex';
        this.elements.gameInfo.questionHint.style.animation = 'fadeIn 0.5s ease';
    }
    
    /**
     * Update question timer
     */
    updateQuestionTimer() {
        const time = this.getTimeForCurrentQuestion();
        this.state.game.timeLeft = time;
        
        if (this.elements.gameInfo.timeLeft) {
            this.elements.gameInfo.timeLeft.textContent = time;
            this.elements.gameInfo.timeLeft.style.color = 'white';
        }
    }
    
    /**
     * Get time for current question based on difficulty
     */
    getTimeForCurrentQuestion() {
        const questionIndex = this.state.game.currentQuestion;
        
        if (questionIndex < 5) {
            return this.config.TIME_PER_QUESTION.EASY;
        } else if (questionIndex < 10) {
            return this.config.TIME_PER_QUESTION.MEDIUM;
        } else {
            return this.config.TIME_PER_QUESTION.HARD;
        }
    }
    
    /**
     * Update lifelines state
     */
    updateLifelinesState() {
        const lifelineCount = this.config.LIFELINES_PER_DIFFICULTY[this.getCurrentDifficulty()];
        const usedCount = this.state.game.lifelinesUsed.length;
        
        Object.keys(this.elements.lifelines).forEach(key => {
            const lifeline = this.elements.lifelines[key];
            
            if (!lifeline) return;
            
            if (usedCount >= lifelineCount) {
                // All lifelines used
                lifeline.disabled = true;
                lifeline.style.opacity = '0.5';
            } else if (this.state.game.lifelinesUsed.includes(key)) {
                // This lifeline used
                lifeline.disabled = true;
                lifeline.style.opacity = '0.6';
            } else {
                // Lifeline available
                lifeline.disabled = false;
                lifeline.style.opacity = '1';
            }
        });
    }
    
    /**
     * Get current difficulty based on question number
     */
    getCurrentDifficulty() {
        const questionIndex = this.state.game.currentQuestion;
        
        if (questionIndex < 5) return 'easy';
        if (questionIndex < 10) return 'medium';
        return 'hard';
    }
    
    /**
     * Select answer
     */
    selectAnswer(index) {
        if (this.state.game.isAnswered || this.state.game.isPaused) {
            return;
        }
        
        // Record selection
        this.state.game.selectedAnswer = index;
        this.state.game.isAnswered = true;
        
        // Stop timer
        this.stopTimer();
        
        // Disable all answer buttons
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.disabled = true;
        });
        
        // Highlight selected answer
        const selectedBtn = document.querySelector(`.answer-btn[data-index="${index}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
        }
        
        // Check answer
        const question = this.state.game.questions[this.state.game.currentQuestion];
        const isCorrect = index === question.correct;
        
        // Apply visual effect
        this.applyFlashEffect(isCorrect);
        
        // Handle answer
        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
        
        // Enable next button
        if (this.elements.buttons.next) {
            this.elements.buttons.next.disabled = false;
        }
        
        // Play sound
        this.playSound(isCorrect ? 'correct' : 'wrong');
        
        // Log answer
        this.security.logSecurityEvent('answer_selected', {
            questionId: question.id,
            selectedAnswer: index,
            isCorrect: isCorrect,
            timeSpent: this.getTimeForCurrentQuestion() - this.state.game.timeLeft
        });
    }
    
    /**
     * Handle correct answer
     */
    handleCorrectAnswer() {
        const question = this.state.game.questions[this.state.game.currentQuestion];
        const prize = this.config.PRIZES[this.state.game.currentQuestion];
        
        // Update score
        this.state.player.score += prize;
        this.state.game.correctAnswers++;
        
        // Update streak
        this.state.player.streak++;
        if (this.state.player.streak > this.state.player.stats.highestStreak) {
            this.state.player.stats.highestStreak = this.state.player.streak;
        }
        
        // Update UI
        if (this.elements.gameInfo.currentScore) {
            this.elements.gameInfo.currentScore.textContent = this.state.player.score.toLocaleString();
        }
        
        if (this.elements.gameInfo.streakCount) {
            this.elements.gameInfo.streakCount.textContent = this.state.player.streak;
        }
        
        // Highlight correct answer
        const correctBtn = document.querySelector(`.answer-btn[data-index="${question.correct}"]`);
        if (correctBtn) {
            correctBtn.classList.add('correct');
        }
        
        // Check for safe haven
        this.checkSafeHaven();
        
        // Update prize track
        this.updatePrizeTrack();
        
        // Show notification
        this.showNotification('إجابة صحيحة! مبروك 🎉', 'success');
        
        // Log correct answer
        this.security.logSecurityEvent('correct_answer', {
            questionId: question.id,
            prize: prize,
            newScore: this.state.player.score,
            streak: this.state.player.streak
        });
    }
    
    /**
     * Handle wrong answer
     */
    handleWrongAnswer() {
        const question = this.state.game.questions[this.state.game.currentQuestion];
        
        // Reset streak
        this.state.player.streak = 0;
        
        if (this.elements.gameInfo.streakCount) {
            this.elements.gameInfo.streakCount.textContent = '0';
        }
        
        // Highlight wrong and correct answers
        const wrongBtn = document.querySelector(`.answer-btn[data-index="${this.state.game.selectedAnswer}"]`);
        if (wrongBtn) {
            wrongBtn.classList.add('wrong');
        }
        
        const correctBtn = document.querySelector(`.answer-btn[data-index="${question.correct}"]`);
        if (correctBtn) {
            correctBtn.classList.add('correct');
        }
        
        // Show notification
        this.showNotification('إجابة خاطئة! حاول مرة أخرى ❌', 'error');
        
        // End game after delay
        setTimeout(() => {
            this.endGame(false);
        }, 3000);
        
        // Log wrong answer
        this.security.logSecurityEvent('wrong_answer', {
            questionId: question.id,
            selectedAnswer: this.state.game.selectedAnswer,
            correctAnswer: question.correct
        });
    }
    
    /**
     * Check if safe haven reached
     */
    checkSafeHaven() {
        const currentQuestion = this.state.game.currentQuestion + 1;
        
        if (this.config.SAFE_HAVENS.includes(currentQuestion)) {
            this.state.game.safeHavenReached = true;
            
            this.showNotification(
                `🎉 وصلت إلى الملاذ الآمن! مبلغك مضمون: ${this.state.player.score.toLocaleString()} دينار`,
                'success'
            );
        }
    }
    
    /**
     * Move to next question
     */
    nextQuestion() {
        this.state.game.currentQuestion++;
        
        // Check if game is finished
        if (this.state.game.currentQuestion >= this.config.MAX_QUESTIONS) {
            this.endGame(true);
            return;
        }
        
        // Reset answer state
        this.state.game.selectedAnswer = null;
        this.state.game.isAnswered = false;
        
        // Update timer
        this.updateQuestionTimer();
        
        // Disable next button
        if (this.elements.buttons.next) {
            this.elements.buttons.next.disabled = true;
        }
        
        // Display next question
        this.displayCurrentQuestion();
        
        // Start timer
        this.startTimer();
    }
    
    /**
     * Start timer
     */
    startTimer() {
        // Clear any existing timer
        this.stopTimer();
        
        if (!this.state.settings.timerEnabled) {
            if (this.elements.gameInfo.timeLeft) {
                this.elements.gameInfo.timeLeft.textContent = '∞';
                this.elements.gameInfo.timeLeft.style.color = '#00b894';
            }
            return;
        }
        
        if (this.elements.gameInfo.timeLeft) {
            this.elements.gameInfo.timeLeft.textContent = this.state.game.timeLeft;
            this.elements.gameInfo.timeLeft.style.color = 'white';
        }
        
        // Start countdown
        this.state.game.timer = setInterval(() => {
            this.state.game.timeLeft--;
            
            if (this.elements.gameInfo.timeLeft) {
                this.elements.gameInfo.timeLeft.textContent = this.state.game.timeLeft;
                
                // Change color when time is running out
                if (this.state.game.timeLeft <= 10) {
                    this.elements.gameInfo.timeLeft.style.color = '#e17055';
                }
            }
            
            // Time's up
            if (this.state.game.timeLeft <= 0) {
                this.handleTimeUp();
            }
        }, 1000);
    }
    
    /**
     * Stop timer
     */
    stopTimer() {
        if (this.state.game.timer) {
            clearInterval(this.state.game.timer);
            this.state.game.timer = null;
        }
    }
    
    /**
     * Handle time up
     */
    handleTimeUp() {
        this.stopTimer();
        this.state.game.isAnswered = true;
        
        // Disable all answer buttons
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.disabled = true;
        });
        
        // Show correct answer
        const question = this.state.game.questions[this.state.game.currentQuestion];
        const correctBtn = document.querySelector(`.answer-btn[data-index="${question.correct}"]`);
        if (correctBtn) {
            correctBtn.classList.add('correct');
        }
        
        // Enable next button
        if (this.elements.buttons.next) {
            this.elements.buttons.next.disabled = false;
        }
        
        // Apply flash effect
        this.applyFlashEffect(false);
        
        // Show notification
        this.showNotification('انتهى الوقت! ⏰', 'error');
        
        // Play sound
        this.playSound('wrong');
        
        // Log timeout
        this.security.logSecurityEvent('time_up', {
            questionId: question.id,
            questionIndex: this.state.game.currentQuestion
        });
    }
    
    /**
     * Apply flash effect
     */
    applyFlashEffect(isCorrect) {
        const flashOverlay = document.getElementById('flash-overlay');
        
        if (!flashOverlay) return;
        
        flashOverlay.className = 'flash-overlay';
        void flashOverlay.offsetWidth; // Trigger reflow
        
        flashOverlay.classList.add(isCorrect ? 'flash-green' : 'flash-red');
        
        setTimeout(() => {
            flashOverlay.className = 'flash-overlay';
        }, 1000);
    }
    
    /**
     * End game
     */
    endGame(isWin) {
        // Stop timer
        this.stopTimer();
        
        // Calculate statistics
        const totalTime = Math.floor((Date.now() - this.state.game.startTime) / 1000);
        const avgTime = Math.floor(totalTime / (this.state.game.currentQuestion + 1));
        const accuracy = Math.floor(
            (this.state.game.correctAnswers / (this.state.game.currentQuestion + 1)) * 100
        );
        
        // Update game time
        this.state.game.totalTime = totalTime;
        
        // Update results screen
        this.updateResultsScreen(isWin, totalTime, avgTime, accuracy);
        
        // Update player statistics
        this.updatePlayerStats(isWin, totalTime, avgTime, accuracy);
        
        // Calculate and add XP
        this.calculateAndAddXP(isWin, accuracy);
        
        // Save game data
        this.saveGameData();
        
        // Update leaderboard
        this.updateLeaderboard();
        
        // Switch to results screen
        this.switchScreen('results');
        
        // Play sound
        this.playSound(isWin ? 'win' : 'wrong');
        
        // Show notification
        const message = isWin ? 
            '🎉 فوز رائع! تهانينا!' : 
            '💪 حاول مرة أخرى، ستنجح!';
        
        this.showNotification(message, isWin ? 'success' : 'info');
        
        // Log game end
        this.security.logSecurityEvent('game_end', {
            isWin: isWin,
            score: this.state.player.score,
            correctAnswers: this.state.game.correctAnswers,
            totalTime: totalTime,
            accuracy: accuracy
        });
    }
    
    /**
     * Update results screen
     */
    updateResultsScreen(isWin, totalTime, avgTime, accuracy) {
        if (!this.elements.results) return;
        
        // Update icon and title
        if (this.elements.results.icon) {
            this.elements.results.icon.textContent = isWin ? '🏆' : '💡';
        }
        
        if (this.elements.results.title) {
            this.elements.results.title.textContent = isWin ? 
                'لقد فزت! مبروك' : 'انتهت اللعبة';
        }
        
        if (this.elements.results.subtitle) {
            this.elements.results.subtitle.textContent = isWin ? 
                'إنجاز رائع يستحق الاحتفال 🎊' : 
                'حاول مرة أخرى لتحقيق نتيجة أفضل 💪';
        }
        
        // Update prize amounts
        if (this.elements.results.finalAmount) {
            this.elements.results.finalAmount.textContent = `${this.state.player.score.toLocaleString()} دينار`;
        }
        
        if (this.elements.results.prizeConversion) {
            this.elements.results.prizeConversion.textContent = `≈ ${Math.floor(this.state.player.score / 1000)} دولار`;
        }
        
        // Update statistics
        if (this.elements.results.correctCount) {
            this.elements.results.correctCount.textContent = this.state.game.correctAnswers;
        }
        
        if (this.elements.results.totalTime) {
            this.elements.results.totalTime.textContent = totalTime;
        }
        
        if (this.elements.results.avgTime) {
            this.elements.results.avgTime.textContent = avgTime;
        }
        
        if (this.elements.results.accuracy) {
            this.elements.results.accuracy.textContent = `${accuracy}%`;
        }
    }
    
    /**
     * Update player statistics
     */
    updatePlayerStats(isWin, totalTime, avgTime, accuracy) {
        const stats = this.state.player.stats;
        
        stats.gamesPlayed++;
        stats.totalCorrect += this.state.game.correctAnswers;
        stats.totalQuestions += this.state.game.currentQuestion + 1;
        stats.totalMoney += this.state.player.score;
        
        // Update average time
        if (stats.avgTime === 0) {
            stats.avgTime = avgTime;
        } else {
            stats.avgTime = Math.floor((stats.avgTime + avgTime) / 2);
        }
        
        // Update best score
        if (this.state.player.score > stats.bestScore) {
            stats.bestScore = this.state.player.score;
        }
        
        // Check for perfect game
        if (isWin && this.state.game.correctAnswers === this.config.MAX_QUESTIONS) {
            stats.perfectGames++;
        }
    }
    
    /**
     * Calculate and add XP
     */
    calculateAndAddXP(isWin, accuracy) {
        let xp = this.config.XP_SYSTEM.BASE_XP;
        
        // Win bonus
        if (isWin) {
            xp += this.config.XP_SYSTEM.WIN_BONUS;
            
            // Perfect game bonus
            if (this.state.game.correctAnswers === this.config.MAX_QUESTIONS) {
                xp += this.config.XP_SYSTEM.PERFECT_GAME_BONUS;
            }
        }
        
        // Correct answers bonus
        xp += this.state.game.correctAnswers * this.config.XP_SYSTEM.CORRECT_ANSWER_XP;
        
        // Streak bonus
        xp += this.state.player.streak * this.config.XP_SYSTEM.STREAK_BONUS;
        
        // Accuracy bonus
        xp += Math.floor(accuracy / 10) * 10;
        
        // Level multiplier
        xp = Math.floor(xp * (1 + (this.state.player.level - 1) * 0.1));
        
        // Add XP
        this.state.player.xp += xp;
        
        // Check for level up
        this.checkLevelUp();
        
        // Log XP gain
        this.security.logSecurityEvent('xp_gained', {
            xpGained: xp,
            totalXP: this.state.player.xp,
            newLevel: this.state.player.level
        });
    }
    
    /**
     * Check for level up
     */
    checkLevelUp() {
        let leveledUp = false;
        
        while (this.state.player.xp >= this.state.player.xpToNext) {
            this.state.player.xp -= this.state.player.xpToNext;
            this.state.player.level++;
            this.state.player.xpToNext = Math.floor(
                this.state.player.xpToNext * this.config.XP_SYSTEM.LEVEL_MULTIPLIER
            );
            
            leveledUp = true;
            
            // Show level up notification
            this.showNotification(
                `مبروك! لقد ارتفع مستواك إلى ${this.state.player.level} ⭐`,
                'success'
            );
            
            // Log level up
            this.security.logSecurityEvent('level_up', {
                newLevel: this.state.player.level,
                xpToNext: this.state.player.xpToNext
            });
        }
        
        if (leveledUp) {
            this.updatePlayerInfo();
        }
    }
    
    /**
     * Update prize track
     */
    updatePrizeTrack() {
        if (!this.elements.containers.prizeTrack) return;
        
        this.elements.containers.prizeTrack.innerHTML = '';
        
        this.config.PRIZES.forEach((prize, index) => {
            const prizeItem = document.createElement('div');
            prizeItem.className = 'prize-item';
            
            // Add classes based on current position
            if (index === this.state.game.currentQuestion) {
                prizeItem.classList.add('current');
            } else if (index < this.state.game.currentQuestion) {
                prizeItem.classList.add('passed');
            }
            
            // Mark safe havens
            if (this.config.SAFE_HAVENS.includes(index + 1)) {
                prizeItem.style.borderStyle = 'dashed';
            }
            
            prizeItem.innerHTML = `
                <div class="prize-level">${index + 1}</div>
                <div class="prize-amount">${prize.toLocaleString()}</div>
            `;
            
            this.elements.containers.prizeTrack.appendChild(prizeItem);
        });
    }
    
    /**
     * Update leaderboard
     */
    updateLeaderboard() {
        if (!this.elements.containers.leaderboard) return;
        
        try {
            // Get high scores
            const encryptedScores = localStorage.getItem('millionaire_high_scores');
            if (!encryptedScores) {
                this.elements.containers.leaderboard.innerHTML = 
                    '<p class="empty-leaderboard">لا توجد نتائج سابقة</p>';
                return;
            }
            
            const scores = this.security.decrypt(encryptedScores) || [];
            
            // Sort by score (descending)
            scores.sort((a, b) => b.score - a.score);
            
            // Take top 10
            const top10 = scores.slice(0, 10);
            
            this.elements.containers.leaderboard.innerHTML = '';
            
            if (top10.length === 0) {
                this.elements.containers.leaderboard.innerHTML = 
                    '<p class="empty-leaderboard">لا توجد نتائج سابقة</p>';
                return;
            }
            
            top10.forEach((player, index) => {
                const isCurrent = player.sessionId === this.state.sessionId;
                
                const item = document.createElement('div');
                item.className = `leaderboard-item ${isCurrent ? 'current' : ''}`;
                item.innerHTML = `
                    <div class="leaderboard-rank">${index + 1}</div>
                    <div class="leaderboard-avatar">${player.avatar || '👤'}</div>
                    <div class="leaderboard-name">${player.name}</div>
                    <div class="leaderboard-score">${player.score.toLocaleString()}</div>
                `;
                
                this.elements.containers.leaderboard.appendChild(item);
            });
            
        } catch (error) {
            console.error('Error updating leaderboard:', error);
            this.elements.containers.leaderboard.innerHTML = 
                '<p class="error-message">خطأ في تحميل الترتيب</p>';
        }
    }
    
    /**
     * Switch screen
     */
    switchScreen(screenName) {
        // Hide all screens
        Object.values(this.elements.screens).forEach(screen => {
            if (screen) {
                screen.classList.remove('active');
            }
        });
        
        // Show target screen
        if (this.elements.screens[screenName]) {
            this.elements.screens[screenName].classList.add('active');
            this.state.screen = screenName;
        }
        
        // Handle screen-specific actions
        switch (screenName) {
            case 'start':
                this.onStartScreen();
                break;
                
            case 'game':
                this.onGameScreen();
                break;
                
            case 'results':
                this.onResultsScreen();
                break;
        }
    }
    
    /**
     * Actions when switching to start screen
     */
    onStartScreen() {
        // Reset game state
        this.resetGameState();
        
        // Update categories
        this.loadCategories();
        
        // Update player info
        this.updatePlayerInfo();
    }
    
    /**
     * Actions when switching to game screen
     */
    onGameScreen() {
        // Focus on game area
        if (this.elements.containers.answers) {
            this.elements.containers.answers.focus();
        }
    }
    
    /**
     * Actions when switching to results screen
     */
    onResultsScreen() {
        // Update leaderboard
        this.updateLeaderboard();
    }
    
    /**
     * Play sound
     */
    playSound(type) {
        if (!this.state.settings.sound || !this.elements.audio[type]) {
            return;
        }
        
        try {
            const audio = this.elements.audio[type];
            audio.currentTime = 0;
            audio.play().catch(e => {
                console.log('Error playing sound:', e);
            });
        } catch (error) {
            console.error('Sound play error:', error);
        }
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        if (!this.elements.containers.notifications) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        notification.innerHTML = `
            <div class="notification-icon">${icons[type] || icons.info}</div>
            <div class="notification-message">${message}</div>
        `;
        
        this.elements.containers.notifications.appendChild(notification);
        
        // Remove after timeout
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    /**
     * Bind events
     */
    bindEvents() {
        // Player name input
        if (this.elements.player.name) {
            this.elements.player.name.addEventListener('input', (e) => {
                const validation = this.security.validateInput(e.target.value, 'name');
                
                if (validation.isValid) {
                    this.state.player.name = validation.sanitized;
                    this.updatePlayerInfo();
                }
            });
        }
        
        // Player avatar change
        if (this.elements.player.avatar) {
            this.elements.player.avatar.addEventListener('change', (e) => {
                const validation = this.security.validateInput(e.target.value, 'avatar');
                
                if (validation.isValid) {
                    this.state.player.avatar = e.target.value;
                    this.updatePlayerInfo();
                }
            });
        }
        
        // Start game button
        if (this.elements.buttons.start) {
            this.elements.buttons.start.addEventListener('click', () => {
                this.startGame();
            });
        }
        
        // Quick play button
        if (this.elements.buttons.quickPlay) {
            this.elements.buttons.quickPlay.addEventListener('click', () => {
                this.startQuickPlay();
            });
        }
        
        // Next button
        if (this.elements.buttons.next) {
            this.elements.buttons.next.addEventListener('click', () => {
                this.nextQuestion();
            });
        }
        
        // Quit button
        if (this.elements.buttons.quit) {
            this.elements.buttons.quit.addEventListener('click', () => {
                if (confirm('هل تريد الانسحاب والحصول على المبلغ الحالي؟')) {
                    this.endGame(false);
                }
            });
        }
        
        // Play again button
        if (this.elements.buttons.playAgain) {
            this.elements.buttons.playAgain.addEventListener('click', () => {
                this.switchScreen('start');
                this.showNotification('استعد للجولة القادمة! 🚀', 'info');
            });
        }
        
        // Share button
        if (this.elements.buttons.share) {
            this.elements.buttons.share.addEventListener('click', () => {
                this.shareResults();
            });
        }
        
        // Main menu button
        if (this.elements.buttons.mainMenu) {
            this.elements.buttons.mainMenu.addEventListener('click', () => {
                this.switchScreen('start');
                this.showNotification('العودة للقائمة الرئيسية 🏠', 'info');
            });
        }
        
        // Stats button
        if (this.elements.buttons.stats) {
            this.elements.buttons.stats.addEventListener('click', () => {
                this.showStatistics();
            });
        }
        
        // Sound button
        if (this.elements.buttons.sound) {
            this.elements.buttons.sound.addEventListener('click', () => {
                this.toggleSound();
            });
        }
        
        // Help button
        if (this.elements.buttons.help) {
            this.elements.buttons.help.addEventListener('click', () => {
                this.showHelp();
            });
        }
        
        // Subscribe button
        if (this.elements.buttons.subscribe) {
            this.elements.buttons.subscribe.addEventListener('click', () => {
                this.showSubscriptionModal();
            });
        }
        
        // Timer options
        const timerOptions = document.querySelectorAll('.timer-option');
        timerOptions.forEach(option => {
            option.addEventListener('click', () => {
                timerOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                this.state.settings.timerEnabled = option.dataset.timer === 'true';
                this.saveGameData();
                this.playSound('click');
            });
        });
        
        // Difficulty options
        const difficultyOptions = document.querySelectorAll('.difficulty-option');
        difficultyOptions.forEach(option => {
            option.addEventListener('click', () => {
                difficultyOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                
                this.state.game.difficultyLevel = option.dataset.level;
                this.playSound('click');
            });
        });
        
        // Lifelines
        Object.keys(this.elements.lifelines).forEach(key => {
            const lifeline = this.elements.lifelines[key];
            if (lifeline) {
                lifeline.addEventListener('click', () => {
                    if (!lifeline.disabled) {
                        this.useLifeline(key);
                    }
                });
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.state.screen === 'game' && e.key === 'Escape') {
                if (confirm('هل تريد الانسحاب والحصول على المبلغ الحالي؟')) {
                    this.endGame(false);
                }
            }
            
            // Number keys for answers (1-4)
            if (this.state.screen === 'game' && !this.state.game.isAnswered) {
                const key = parseInt(e.key);
                if (key >= 1 && key <= 4) {
                    this.selectAnswer(key - 1);
                }
            }
            
            // Space for next question
            if (this.state.screen === 'game' && e.key === ' ' && this.state.game.isAnswered) {
                this.nextQuestion();
            }
            
            // F1 for help
            if (e.key === 'F1') {
                e.preventDefault();
                this.showHelp();
            }
        });
        
        // Touch events for mobile
        this.setupTouchEvents();
        
        // Visibility change (tab switch)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.state.screen === 'game') {
                this.handleVisibilityChange();
            }
        });
    }
    
    /**
     * Setup touch events for mobile
     */
    setupTouchEvents() {
        // Touch feedback for buttons
        const addTouchFeedback = (selector) => {
            const elements = document.querySelectorAll(selector);
            
            elements.forEach(element => {
                element.addEventListener('touchstart', () => {
                    element.style.transform = 'scale(0.95)';
                }, { passive: true });
                
                element.addEventListener('touchend', () => {
                    element.style.transform = '';
                }, { passive: true });
            });
        };
        
        // Apply to interactive elements
        addTouchFeedback('.answer-btn');
        addTouchFeedback('.lifeline-btn');
        addTouchFeedback('.btn');
        addTouchFeedback('.control-btn');
        addTouchFeedback('.action-btn');
        addTouchFeedback('.nav-btn');
    }
    
    /**
     * Handle visibility change (tab switch)
     */
    handleVisibilityChange() {
        if (this.state.screen === 'game' && !this.state.game.isPaused) {
            this.state.game.isPaused = true;
            this.stopTimer();
            
            this.showNotification('اللعبة متوقفة مؤقتاً', 'warning');
            
            // Log pause
            this.security.logSecurityEvent('game_paused', {
                reason: 'visibility_change',
                questionIndex: this.state.game.currentQuestion
            });
        }
    }
    
    /**
     * Use lifeline
     */
    async useLifeline(type) {
        if (this.state.game.lifelinesUsed.includes(type)) {
            return;
        }
        
        // Check for skip lifeline (requires ad)
        if (type === 'skip' && !this.state.isPremium) {
            // In production, show ad first
            // For demo, just proceed
            this.applySkipLifeline();
            return;
        }
        
        // Apply lifeline effect
        switch(type) {
            case '5050':
                this.applyFiftyFiftyLifeline();
                break;
                
            case 'call':
                this.applyPhoneAFriendLifeline();
                break;
                
            case 'audience':
                this.applyAskTheAudienceLifeline();
                break;
                
            case 'skip':
                this.applySkipLifeline();
                break;
        }
        
        // Add to used lifelines
        this.state.game.lifelinesUsed.push(type);
        
        // Update lifelines state
        this.updateLifelinesState();
        
        // Play sound
        this.playSound('click');
        
        // Show notification
        this.showNotification(`تم استخدام أداة ${this.getLifelineName(type)}`, 'info');
        
        // Log lifeline usage
        this.security.logSecurityEvent('lifeline_used', {
            type: type,
            remaining: this.getRemainingLifelines()
        });
    }
    
    /**
     * Apply 50:50 lifeline
     */
    applyFiftyFiftyLifeline() {
        const question = this.state.game.questions[this.state.game.currentQuestion];
        const wrongAnswers = [0, 1, 2, 3].filter(index => index !== question.correct);
        
        // Randomly select 2 wrong answers to remove
        const toRemove = wrongAnswers.sort(() => Math.random() - 0.5).slice(0, 2);
        
        document.querySelectorAll('.answer-btn').forEach((btn, index) => {
            if (toRemove.includes(index)) {
                btn.style.opacity = '0.3';
                btn.style.pointerEvents = 'none';
            }
        });
    }
    
    /**
     * Apply phone a friend lifeline
     */
    applyPhoneAFriendLifeline() {
        const question = this.state.game.questions[this.state.game.currentQuestion];
        
        // Simulate friend's advice
        const isConfident = Math.random() < 0.7;
        let suggestedAnswer;
        
        if (isConfident) {
            suggestedAnswer = question.correct;
        } else {
            const wrongAnswers = [0, 1, 2, 3].filter(i => i !== question.correct);
            suggestedAnswer = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
        }
        
        const letters = ['أ', 'ب', 'ج', 'د'];
        const confidence = isConfident ? 'متأكد' : 'غير متأكد';
        
        const modalContent = `
            <div class="lifeline-modal">
                <div class="friend-call">
                    <div class="friend-avatar">
                        <i class="fas fa-user-tie"></i>
                    </div>
                    <div class="friend-message">
                        <p class="message">"أعتقد أن الإجابة هي ${letters[suggestedAnswer]}"</p>
                        <p class="confidence">الثقة: ${confidence}</p>
                    </div>
                </div>
                <p class="hint">هذا مجرد رأي، القرار النهائي لك</p>
            </div>
        `;
        
        this.showModal('اتصال بصديق 📞', modalContent);
    }
    
    /**
     * Apply ask the audience lifeline
     */
    applyAskTheAudienceLifeline() {
        const question = this.state.game.questions[this.state.game.currentQuestion];
        
        // Simulate audience voting
        let percentages = [0, 0, 0, 0];
        percentages[question.correct] = 60 + Math.random() * 25;
        
        let remaining = 100 - percentages[question.correct];
        const wrongAnswers = [0, 1, 2, 3].filter(i => i !== question.correct);
        
        wrongAnswers.forEach((answer, index) => {
            if (index === wrongAnswers.length - 1) {
                percentages[answer] = remaining;
            } else {
                const share = Math.random() * remaining * 0.7;
                percentages[answer] = share;
                remaining -= share;
            }
        });
        
        let html = '<div class="audience-poll">';
        html += '<h4><i class="fas fa-users"></i> تصويت الجمهور</h4>';
        
        const letters = ['أ', 'ب', 'ج', 'د'];
        percentages.forEach((percent, index) => {
            html += `
                <div class="poll-row">
                    <span class="poll-letter">${letters[index]}</span>
                    <div class="poll-bar">
                        <div class="poll-fill" style="width: ${percent}%"></div>
                    </div>
                    <span class="poll-percent">${Math.round(percent)}%</span>
                </div>
            `;
        });
        
        html += '<p class="poll-note">نتائج افتراضية بناءً على إحصائيات سابقة</p>';
        html += '</div>';
        
        this.showModal('تصويت الجمهور 👥', html);
    }
    
    /**
     * Apply skip question lifeline
     */
    applySkipLifeline() {
        this.nextQuestion();
    }
    
    /**
     * Get lifeline name
     */
    getLifelineName(type) {
        const names = {
            '5050': '50:50',
            'call': 'اتصال بصديق',
            'audience': 'تصويت الجمهور',
            'skip': 'تخطي السؤال'
        };
        
        return names[type] || 'أداة مساعدة';
    }
    
    /**
     * Get remaining lifelines count
     */
    getRemainingLifelines() {
        const total = this.config.LIFELINES_PER_DIFFICULTY[this.getCurrentDifficulty()];
        return total - this.state.game.lifelinesUsed.length;
    }
    
    /**
     * Show modal
     */
    showModal(title, content) {
        if (!this.elements.modalsContainer) return;
        
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">${content}</div>
        `;
        
        overlay.appendChild(modal);
        this.elements.modalsContainer.appendChild(overlay);
        
        // Show with animation
        setTimeout(() => overlay.classList.add('active'), 10);
        
        // Close button
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.onclick = () => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
            this.playSound('click');
        };
        
        // Click outside to close
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
                setTimeout(() => overlay.remove(), 300);
                this.playSound('click');
            }
        };
    }
    
    /**
     * Toggle sound
     */
    toggleSound() {
        this.state.settings.sound = !this.state.settings.sound;
        
        // Update button icon
        const icon = this.elements.buttons.sound?.querySelector('i');
        if (icon) {
            icon.className = this.state.settings.sound ? 
                'fas fa-volume-up' : 'fas fa-volume-mute';
        }
        
        // Save settings
        this.saveGameData();
        
        // Show notification
        const message = this.state.settings.sound ? 
            'تم تشغيل الصوت 🔊' : 'تم إيقاف الصوت 🔇';
        
        this.showNotification(message, 'info');
        
        // Play test sound if enabled
        if (this.state.settings.sound) {
            this.playSound('click');
        }
    }
    
    /**
     * Show statistics
     */
    showStatistics() {
        const stats = this.state.player.stats;
        const winRate = stats.gamesPlayed > 0 ? 
            Math.floor((stats.totalCorrect / stats.totalQuestions) * 100) : 0;
        
        const content = `
            <div class="stats-popup">
                <h3><i class="fas fa-chart-line"></i> إحصائيات اللاعب</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-icon">🎮</div>
                        <div class="stat-value">${stats.gamesPlayed}</div>
                        <div class="stat-label">عدد الألعاب</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-icon">✅</div>
                        <div class="stat-value">${stats.totalCorrect}</div>
                        <div class="stat-label">إجابات صحيحة</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-icon">💰</div>
                        <div class="stat-value">${stats.totalMoney.toLocaleString()}</div>
                        <div class="stat-label">مجموع الأرباح</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-icon">🏆</div>
                        <div class="stat-value">${stats.bestScore.toLocaleString()}</div>
                        <div class="stat-label">أفضل نتيجة</div>
                    </div>
                </div>
                <div class="advanced-stats">
                    <h4>إحصائيات متقدمة</h4>
                    <p><i class="fas fa-trophy"></i> معدل الفوز: ${winRate}%</p>
                    <p><i class="fas fa-clock"></i> متوسط وقت الإجابة: ${stats.avgTime || 0} ثانية</p>
                    <p><i class="fas fa-fire"></i> أعلى تتابع: ${stats.highestStreak}</p>
                    <p><i class="fas fa-star"></i> ألعاب مثالية: ${stats.perfectGames}</p>
                    <p><i class="fas fa-chart-pie"></i> الدقة العامة: ${stats.totalQuestions > 0 ?
                        Math.floor((stats.totalCorrect / stats.totalQuestions) * 100) : 0}%</p>
                </div>
            </div>
        `;
        
        this.showModal('إحصائيات اللاعب 📊', content);
    }
    
    /**
     * Show help
     */
    showHelp() {
        const content = `
            <div class="help-content">
                <h3><i class="fas fa-graduation-cap"></i> كيفية اللعب</h3>
                <ol>
                    <li><strong>اختر اسمك</strong> وصورتك الرمزية</li>
                    <li><strong>اختر فئة الأسئلة</strong> التي تفضلها</li>
                    <li><strong>ابدأ اللعبة</strong> وأجب على 15 سؤالاً</li>
                    <li><strong>احصل على المليون دينار</strong> باجتياز جميع الأسئلة</li>
                </ol>
                
                <h4><i class="fas fa-life-ring"></i> أدوات المساعدة</h4>
                <ul>
                    <li><strong>50:50</strong> - يحذف إجابتين خاطئتين</li>
                    <li><strong>اتصال بصديق</strong> - استشارة خبير</li>
                    <li><strong>رأي الجمهور</strong> - تصويت المشاهدين</li>
                    <li><strong>تخطي السؤال</strong> - مشاهدة إعلان للتخطي</li>
                </ul>
                
                <h4><i class="fas fa-money-bill-wave"></i> نظام الجوائز</h4>
                <p>15 سؤالاً مع جوائز متزايدة تصل إلى 1,000,000 دينار</p>
                <p>أسئلة مضمونة عند السؤال 5 و 10 (Safe Haven)</p>
                
                <h4><i class="fas fa-crown"></i> النسخة المميزة</h4>
                <p>اشترك لإزالة الإعلانات والحصول على ميزات حصرية</p>
                
                <h4><i class="fas fa-keyboard"></i> اختصارات لوحة المفاتيح</h4>
                <ul>
                    <li><strong>1-4</strong> - اختيار الإجابة</li>
                    <li><strong>Space</strong> - التالي بعد الإجابة</li>
                    <li><strong>Escape</strong> - الانسحاب</li>
                    <li><strong>F1</strong> - المساعدة</li>
                </ul>
            </div>
        `;
        
        this.showModal('تعليمات اللعبة ❓', content);
    }
    
    /**
     * Show subscription modal
     */
    showSubscriptionModal() {
        const content = `
            <div class="subscription-modal">
                <div class="subscription-header">
                    <div class="gold-crown">
                        <i class="fas fa-crown"></i>
                    </div>
                    <h2>النسخة المميزة</h2>
                    <p>استمتع بلعبة خالية من الإعلانات والمميزات الحصرية</p>
                </div>
                
                <div class="plan-card popular">
                    <div class="popular-badge">الأكثر اختياراً</div>
                    <h3>اشتراك شهري</h3>
                    <div class="plan-price">
                        <span class="price">9.99</span>
                        <span class="currency">$</span>
                        <span class="period">/شهر</span>
                    </div>
                    
                    <ul class="plan-features">
                        <li><i class="fas fa-check"></i> إزالة جميع الإعلانات</li>
                        <li><i class="fas fa-check"></i> أدوات مساعدة إضافية</li>
                        <li><i class="fas fa-check"></i> أسئلة حصرية</li>
                        <li><i class="fas fa-check"></i> دعم مباشر</li>
                        <li><i class="fas fa-check"></i> إحصائيات متقدمة</li>
                    </ul>
                    
                    <button class="subscribe-btn" id="subscribe-monthly">
                        <i class="fas fa-gem"></i>
                        اشترك الآن
                    </button>
                </div>
                
                <div class="subscription-footer">
                    <p class="terms">
                        <i class="fas fa-shield-alt"></i>
                        الدفع آمن يمكنك الإلغاء في أي وقت
                    </p>
                    <button class="close-subscription">
                        <i class="fas fa-times"></i> إغلاق
                    </button>
                </div>
            </div>
        `;
        
        this.showModal('الاشتراك المميز 👑', content);
        
        // Add event listeners for subscription buttons
        setTimeout(() => {
            const subscribeBtn = document.getElementById('subscribe-monthly');
            const closeBtn = document.querySelector('.close-subscription');
            
            if (subscribeBtn) {
                subscribeBtn.addEventListener('click', () => {
                    this.processSubscription();
                });
            }
            
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    document.querySelector('.modal-overlay')?.remove();
                });
            }
        }, 100);
    }
    
    /**
     * Process subscription
     */
    processSubscription() {
        // For demo purposes only
        // In production, integrate with payment gateway
        
        const subscriptionData = {
            userId: this.state.sessionId,
            plan: 'monthly',
            price: 9.99,
            expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            activated: new Date().toISOString(),
            features: ['no_ads', 'extra_lifelines', 'exclusive_questions']
        };
        
        // Encrypt and save subscription
        const encryptedSubscription = this.security.encrypt(subscriptionData);
        if (encryptedSubscription) {
            localStorage.setItem('millionaire_subscription', encryptedSubscription);
        }
        
        // Update premium status
        this.state.isPremium = true;
        this.checkPremiumStatus();
        
        // Show success message
        this.showNotification('تم تفعيل الاشتراك المميز بنجاح 👑', 'success');
        
        // Close modal
        document.querySelector('.modal-overlay')?.remove();
        
        // Log subscription
        this.security.logSecurityEvent('subscription_activated', {
            plan: 'monthly',
            price: 9.99
        });
    }
    
    /**
     * Share results
     */
    shareResults() {
        const shareText = `💰 ربحت ${this.state.player.score.toLocaleString()} دينار في لعبة من سريع المليون!
لعبت ${this.state.game.correctAnswers} إجابة صحيحة من ${this.state.game.currentQuestion + 1} سؤالاً.
مستواي: ${this.state.player.level} ⭐
جربها الآن: ${window.location.href}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'نتيجتي في لعبة من سريع المليون',
                text: shareText,
                url: window.location.href
            }).catch(error => {
                console.log('Share failed:', error);
                this.copyToClipboard(shareText);
            });
        } else {
            this.copyToClipboard(shareText);
        }
    }
    
    /**
     * Copy text to clipboard
     */
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('تم نسخ النتيجة إلى الحافظة 📋', 'success');
        }).catch(() => {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            
            this.showNotification('تم نسخ النتيجة إلى الحافظة 📋', 'success');
        });
    }
    
    /**
     * Start background tasks
     */
    startBackgroundTasks() {
        // Auto-save every 30 seconds
        setInterval(() => {
            if (this.state.screen === 'game' || this.state.screen === 'results') {
                this.saveGameData();
            }
        }, 30000);
        
        // Security checks every minute
        setInterval(() => {
            this.performSecurityChecks();
        }, 60000);
        
        // Update online status
        window.addEventListener('online', () => {
            this.showNotification('تم استعادة الاتصال بالإنترنت 🌐', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.showNotification('فقدت الاتصال بالإنترنت ⚠️', 'warning');
        });
    }
    
    /**
     * Perform security checks
     */
    performSecurityChecks() {
        // Detect cheating
        const cheatingDetection = this.security.detectCheating({
            score: this.state.player.score,
            totalTime: this.state.game.totalTime
        });
        
        if (cheatingDetection.isCheating) {
            console.warn('Cheating detected:', cheatingDetection);
            
            if (cheatingDetection.severity === 'high') {
                this.handleCheatingDetection();
            }
        }
    }
    
    /**
     * Handle cheating detection
     */
    handleCheatingDetection() {
        // Reset score for this session
        this.state.player.score = 0;
        this.state.player.streak = 0;
        
        // Show warning
        this.showNotification(
            'تم اكتشاف نشاط غير عادي. تم إعادة تعيين النقاط.',
            'error'
        );
        
        // Update UI
        this.updatePlayerInfo();
        
        // Log security event
        this.security.logSecurityEvent('cheating_detected', {
            action: 'score_reset'
        });
    }
    
    /**
     * Get game state
     */
    getGameState() {
        return JSON.parse(JSON.stringify(this.state));
    }
    
    /**
     * Set game state
     */
    setGameState(state) {
        // Validate state before applying
        const validation = this.validateGameState(state);
        
