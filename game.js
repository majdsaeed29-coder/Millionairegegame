/**
 * Main Game Engine
 * Handles game logic, state management, and flow control
 */

class GameEngine {
    constructor(config, questionBank, securityManager) {
        this.config = config;
        this.questionBank = questionBank;
        this.security = securityManager;
        
        // Game state
        this.state = {
            screen: 'start',
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
                    highestStreak: 0
                }
            },
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
                category: 'عام'
            },
            settings: {
                sound: true,
                vibration: true,
                animations: true,
                autoNext: false,
                timerEnabled: true
            },
            isPremium: false
        };
        
        // DOM elements cache
        this.elements = {};
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize game engine
     */
    async init() {
        try {
            // Cache DOM elements
            this.cacheElements();
            
            // Load saved data
            this.loadSavedData();
            
            // Initialize question bank
            await this.questionBank.initialize();
            
            // Bind events
            this.bindEvents();
            
            // Update UI
            this.updateUI();
            
            console.log('Game engine initialized successfully');
        } catch (error) {
            console.error('Failed to initialize game engine:', error);
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
        
        // Game info
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
        this.elements.categoriesContainer = document.getElementById('categories-container');
        this.elements.answersContainer = document.getElementById('answers-container');
        this.elements.prizeTrackContainer = document.getElementById('prize-track-container');
        this.elements.leaderboard = document.getElementById('leaderboard');
        
        // Buttons
        this.elements.buttons = {
            start: document.getElementById('start-game'),
            quickPlay: document.getElementById('quick-play'),
            next: document.getElementById('next-btn'),
            quit: document.getElementById('quit-btn'),
            playAgain: document.getElementById('play-again-btn'),
            share: document.getElementById('share-result-btn'),
            mainMenu: document.getElementById('main-menu-btn')
        };
        
        // Lifelines
        this.elements.lifelines = {
            '5050': document.getElementById('lifeline-5050'),
            'call': document.getElementById('lifeline-call'),
            'audience': document.getElementById('lifeline-audience'),
            'skip': document.getElementById('lifeline-skip')
        };
        
        // Results
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
        
        // Audio
        this.elements.audio = {
            correct: document.getElementById('sound-correct'),
            wrong: document.getElementById('sound-wrong'),
            click: document.getElementById('sound-click'),
            win: document.getElementById('sound-win')
        };
    }
    
    /**
     * Load saved data from localStorage
     */
    loadSavedData() {
        try {
            // Load player data
            const savedPlayer = localStorage.getItem('millionaire_player');
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
            
            // Load subscription status
            const subscriptionData = localStorage.getItem('subscription_data');
            if (subscriptionData) {
                const subData = this.security.decrypt(subscriptionData);
                this.state.isPremium = this.security.validateSubscription(subData);
            }
            
            console.log('Data loaded successfully');
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }
    
    /**
     * Save game data
     */
    saveGameData() {
        try {
            // Encrypt and save player data
            const encryptedPlayer = this.security.encrypt(this.state.player);
            if (encryptedPlayer) {
                localStorage.setItem('millionaire_player', encryptedPlayer);
            }
            
            // Save settings
            localStorage.setItem('millionaire_settings', JSON.stringify(this.state.settings));
            
            // Save high scores
            this.saveHighScores();
            
            console.log('Game data saved');
        } catch (error) {
            console.error('Error saving game data:', error);
        }
    }
    
    /**
     * Save high scores
     */
    saveHighScores() {
        try {
            const scores = JSON.parse(localStorage.getItem('high_scores') || '[]');
            
            const newScore = {
                name: this.state.player.name,
                score: this.state.player.score,
                date: new Date().toISOString(),
                level: this.state.player.level,
                category: this.state.game.category
            };
            
            scores.push(newScore);
            
            // Sort by score (descending)
            scores.sort((a, b) => b.score - a.score);
            
            // Keep only top 50 scores
            const topScores = scores.slice(0, 50);
            
            localStorage.setItem('high_scores', JSON.stringify(topScores));
        } catch (error) {
            console.error('Error saving high scores:', error);
        }
    }
    
    /**
     * Start new game
     */
    async startGame(category = null, difficulty = null) {
        try {
            // Reset game state
            this.resetGameState();
            
            // Set category and difficulty
            if (category) {
                this.state.game.category = category;
            }
            
            if (difficulty) {
                this.state.game.difficultyLevel = difficulty;
            }
            
            // Generate questions for the game
            await this.generateGameQuestions();
            
            // Switch to game screen
            this.switchScreen('game');
            
            // Update prize track
            this.updatePrizeTrack();
            
            // Start timer
            this.startTimer();
            
            // Display first question
            this.displayCurrentQuestion();
            
            // Record start time
            this.state.game.startTime = Date.now();
            
            // Play sound
            this.playSound('click');
            
            // Show notification
            this.showNotification('بدأت اللعبة! حظاً موفقاً 🚀', 'success');
            
        } catch (error) {
            console.error('Error starting game:', error);
            this.showNotification('حدث خطأ في بدء اللعبة', 'error');
        }
    }
    
    /**
     * Generate questions for current game
     */
    async generateGameQuestions() {
        this.state.game.questions = [];
        
        // Determine number of questions per difficulty
        const questionsPerDifficulty = 5; // 5 easy, 5 medium, 5 hard
        
        for (let i = 0; i < this.config.maxQuestions; i++) {
            let difficulty;
            
            if (i < 5) {
                difficulty = 'easy';
            } else if (i < 10) {
                difficulty = 'medium';
            } else {
                difficulty = 'hard';
            }
            
            // Get random question
            const question = this.questionBank.getRandomQuestion(
                this.state.game.category,
                difficulty
            );
            
            if (question) {
                this.state.game.questions.push(question);
            } else {
                // Fallback question
                this.state.game.questions.push(this.questionBank.getFallbackQuestion());
            }
        }
        
        console.log(`Generated ${this.state.game.questions.length} questions`);
    }
    
    /**
     * Display current question
     */
    displayCurrentQuestion() {
        const question = this.state.game.questions[this.state.game.currentQuestion];
        
        if (!question) {
            console.error('No question found');
            return;
        }
        
        // Update question number
        this.elements.gameInfo.questionNumber.textContent = this.state.game.currentQuestion + 1;
        
        // Update question value
        const prize = this.config.prizes[this.state.game.currentQuestion];
        this.elements.gameInfo.questionValue.textContent = `${prize.toLocaleString()} دينار`;
        
        // Update category
        this.elements.gameInfo.currentCategory.textContent = question.category;
        this.elements.gameInfo.currentCategory.style.backgroundColor = 
            this.config.categoryColors[question.category] || '#0984e3';
        
        // Update question text
        this.elements.gameInfo.questionText.textContent = question.question;
        
        // Update questions left
        const questionsLeft = this.config.maxQuestions - this.state.game.currentQuestion - 1;
        this.elements.gameInfo.questionsLeft.textContent = `${questionsLeft} أسئلة متبقية`;
        
        // Hide hint
        this.elements.gameInfo.questionHint.style.display = 'none';
        
        // Display answers
        this.displayAnswers(question.answers);
        
        // Reset answer selection
        this.state.game.selectedAnswer = null;
        this.state.game.isAnswered = false;
        
        // Update timer based on difficulty
        this.updateQuestionTimer();
        
        // Enable/disable lifelines
        this.updateLifelinesState();
        
        // Disable next button
        this.elements.buttons.next.disabled = true;
    }
    
    /**
     * Display answers
     */
    displayAnswers(answers) {
        if (!this.elements.answersContainer) return;
        
        this.elements.answersContainer.innerHTML = '';
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
            
            this.elements.answersContainer.appendChild(button);
        });
    }
    
    /**
     * Select answer
     */
    selectAnswer(index) {
        if (this.state.game.isAnswered) return;
        
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
        this.elements.buttons.next.disabled = false;
        
        // Play sound
        this.playSound(isCorrect ? 'correct' : 'wrong');
    }
    
    /**
     * Handle correct answer
     */
    handleCorrectAnswer() {
        // Update score
        const prize = this.config.prizes[this.state.game.currentQuestion];
        this.state.player.score += prize;
        this.state.game.correctAnswers++;
        
        // Update streak
        this.state.player.streak++;
        if (this.state.player.streak > this.state.player.stats.highestStreak) {
            this.state.player.stats.highestStreak = this.state.player.streak;
        }
        
        // Update UI
        this.elements.gameInfo.currentScore.textContent = this.state.player.score.toLocaleString();
        this.elements.gameInfo.streakCount.textContent = this.state.player.streak;
        
        // Highlight correct answer
        const question = this.state.game.questions[this.state.game.currentQuestion];
        const correctBtn = document.querySelector(`.answer-btn[data-index="${question.correct}"]`);
        if (correctBtn) {
            correctBtn.classList.add('correct');
        }
        
        // Update prize track
        this.updatePrizeTrack();
        
        // Show notification
        this.showNotification('إجابة صحيحة! مبروك 🎉', 'success');
    }
    
    /**
     * Handle wrong answer
     */
    handleWrongAnswer() {
        // Reset streak
        this.state.player.streak = 0;
        this.elements.gameInfo.streakCount.textContent = '0';
        
        // Highlight correct and wrong answers
        const question = this.state.game.questions[this.state.game.currentQuestion];
        
        // Wrong answer
        const wrongBtn = document.querySelector(`.answer-btn[data-index="${this.state.game.selectedAnswer}"]`);
        if (wrongBtn) {
            wrongBtn.classList.add('wrong');
        }
        
        // Correct answer
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
    }
    
    /**
     * Move to next question
     */
    nextQuestion() {
        this.state.game.currentQuestion++;
        
        // Check if game is finished
        if (this.state.game.currentQuestion >= this.config.maxQuestions) {
            this.endGame(true);
            return;
        }
        
        // Display next question
        this.displayCurrentQuestion();
        
        // Start timer
        this.startTimer();
        
        // Disable next button
        this.elements.buttons.next.disabled = true;
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
        
        // Update results screen
        this.elements.results.icon.textContent = isWin ? '🏆' : '💡';
        this.elements.results.title.textContent = isWin ? 'لقد فزت! مبروك' : 'انتهت اللعبة';
        this.elements.results.subtitle.textContent = isWin 
            ? 'إنجاز رائع يستحق الاحتفال 🎊' 
            : 'حاول مرة أخرى لتحقيق نتيجة أفضل 💪';
        
        this.elements.results.finalAmount.textContent = `${this.state.player.score.toLocaleString()} دينار`;
        this.elements.results.prizeConversion.textContent = `≈ ${Math.floor(this.state.player.score / 1000)} دولار`;
        
        this.elements.results.correctCount.textContent = this.state.game.correctAnswers;
        this.elements.results.totalTime.textContent = totalTime;
        this.elements.results.avgTime.textContent = avgTime;
        this.elements.results.accuracy.textContent = `${accuracy}%`;
        
        // Update player statistics
        this.updatePlayerStats(isWin, totalTime, avgTime, accuracy);
        
        // Save game data
        this.saveGameData();
        
        // Update leaderboard
        this.updateLeaderboard();
        
        // Switch to results screen
        this.switchScreen('results');
        
        // Play sound
        this.playSound(isWin ? 'win' : 'wrong');
        
        // Show notification
        this.showNotification(
            isWin ? '🎉 فوز رائع! تهانينا!' : '💪 حاول مرة أخرى، ستنجح!',
            isWin ? 'success' : 'info'
        );
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
        stats.avgTime = Math.floor((stats.avgTime + avgTime) / 2);
        
        // Update best score
        if (this.state.player.score > stats.bestScore) {
            stats.bestScore = this.state.player.score;
        }
        
        // Calculate XP
        const xpGained = this.calculateXP(isWin, accuracy);
        this.state.player.xp += xpGained;
        
        // Check level up
        this.checkLevelUp();
    }
    
    /**
     * Calculate XP gained
     */
    calculateXP(isWin, accuracy) {
        let xp = this.config.xpSystem.baseXP;
        xp += isWin ? this.config.xpSystem.winBonus : 0;
        xp += this.state.game.correctAnswers * this.config.xpSystem.correctAnswer;
        xp += this.state.player.streak * this.config.xpSystem.streakBonus;
        xp += Math.floor(accuracy / 10) * 10;
        
        return xp;
    }
    
    /**
     * Check for level up
     */
    checkLevelUp() {
        while (this.state.player.xp >= this.state.player.xpToNext) {
            this.state.player.xp -= this.state.player.xpToNext;
            this.state.player.level++;
            this.state.player.xpToNext = Math.floor(
                this.state.player.xpToNext * this.config.xpSystem.levelMultiplier
            );
            
            this.showNotification(`مبروك! وصلت للمستوى ${this.state.player.level} ⭐`, 'success');
        }
        
        this.updatePlayerInfo();
    }
    
    /**
     * Timer methods
     */
    startTimer() {
        this.stopTimer(); // Clear any existing timer
        
        if (!this.state.settings.timerEnabled) {
            this.elements.gameInfo.timeLeft.textContent = '∞';
            this.elements.gameInfo.timeLeft.style.color = '#00b894';
            return;
        }
        
        this.state.game.timeLeft = this.getTimeForCurrentQuestion();
        this.elements.gameInfo.timeLeft.textContent = this.state.game.timeLeft;
        this.elements.gameInfo.timeLeft.style.color = 'white';
        
        this.state.game.timer = setInterval(() => {
            this.state.game.timeLeft--;
            this.elements.gameInfo.timeLeft.textContent = this.state.game.timeLeft;
            
            // Change color when time is running out
            if (this.state.game.timeLeft <= 10) {
                this.elements.gameInfo.timeLeft.style.color = '#e17055';
            }
            
            // Time's up
            if (this.state.game.timeLeft <= 0) {
                this.handleTimeUp();
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.state.game.timer) {
            clearInterval(this.state.game.timer);
            this.state.game.timer = null;
        }
    }
    
    /**
     * Get time for current question based on difficulty
     */
    getTimeForCurrentQuestion() {
        const questionIndex = this.state.game.currentQuestion;
        
        if (questionIndex < 5) {
            return this.config.timePerQuestion.easy;
        } else if (questionIndex < 10) {
            return this.config.timePerQuestion.medium;
        } else {
            return this.config.timePerQuestion.hard;
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
        this.elements.buttons.next.disabled = false;
        
        // Apply flash effect
        this.applyFlashEffect(false);
        
        // Show notification
        this.showNotification('انتهى الوقت! ⏰', 'error');
        
        // Play sound
        this.playSound('wrong');
    }
    
    /**
     * Update question timer
     */
    updateQuestionTimer() {
        const time = this.getTimeForCurrentQuestion();
        this.state.game.timeLeft = time;
        this.elements.gameInfo.timeLeft.textContent = time;
    }
    
    /**
     * Update prize track
     */
    updatePrizeTrack() {
        if (!this.elements.prizeTrackContainer) return;
        
        this.elements.prizeTrackContainer.innerHTML = '';
        
        this.config.prizes.forEach((prize, index) => {
            const prizeItem = document.createElement('div');
            prizeItem.className = 'prize-item';
            
            if (index === this.state.game.currentQuestion) {
                prizeItem.classList.add('current');
            } else if (index < this.state.game.currentQuestion) {
                prizeItem.classList.add('passed');
            }
            
            // Mark safe havens
            if (this.config.safeHavens.includes(index + 1)) {
                prizeItem.style.borderStyle = 'dashed';
            }
            
            prizeItem.innerHTML = `
                <div class="prize-level">${index + 1}</div>
                <div class="prize-amount">${prize.toLocaleString()}</div>
            `;
            
            this.elements.prizeTrackContainer.appendChild(prizeItem);
        });
    }
    
    /**
     * Update lifelines state
     */
    updateLifelinesState() {
        const lifelineCount = this.config.lifelines[this.getCurrentDifficulty()];
        const usedCount = this.state.game.lifelinesUsed.length;
        
        Object.values(this.elements.lifelines).forEach(lifeline => {
            if (usedCount >= lifelineCount) {
                lifeline.disabled = true;
                lifeline.style.opacity = '0.5';
            } else if (this.state.game.lifelinesUsed.includes(lifeline.dataset.lifeline)) {
                lifeline.disabled = true;
                lifeline.style.opacity = '0.6';
            } else {
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
     * Play sound
     */
    playSound(type) {
        if (!this.state.settings.sound) return;
        
        const audio = this.elements.audio[type];
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log('Error playing sound:', e));
        }
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        if (!container) return;
        
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
        
        container.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    /**
     * Switch screen
     */
    switchScreen(screenName) {
        // Hide all screens
        Object.values(this.elements.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        if (this.elements.screens[screenName]) {
            this.elements.screens[screenName].classList.add('active');
            this.state.screen = screenName;
        }
    }
    
    /**
     * Update UI
     */
    updateUI() {
        // Update player info
        this.elements.player.currentName.textContent = this.state.player.name;
        this.elements.player.currentAvatar.textContent = this.state.player.avatar;
        this.elements.player.level.textContent = `المستوى ${this.state.player.level}`;
        
        // Update score
        this.elements.gameInfo.currentScore.textContent = this.state.player.score.toLocaleString();
        
        // Update streak
        this.elements.gameInfo.streakCount.textContent = this.state.player.streak;
        
        // Update categories
        this.updateCategories();
    }
    
    /**
     * Update categories display
     */
    updateCategories() {
        if (!this.elements.categoriesContainer) return;
        
        this.elements.categoriesContainer.innerHTML = '';
        const categories = this.questionBank.getCategories();
        
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
            `;
            
            button.addEventListener('click', () => this.selectCategory(category.id));
            
            this.elements.categoriesContainer.appendChild(button);
        });
    }
    
    /**
     * Select category
     */
    selectCategory(category) {
        this.state.game.category = category;
        
        // Update UI
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.category === category) {
                btn.classList.add('selected');
            }
        });
        
        this.playSound('click');
    }
    
    /**
     * Reset game state
     */
    resetGameState() {
        this.state.game = {
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
            category: this.state.game.category || 'عام'
        };
        
        this.state.player.score = 0;
        this.state.player.streak = 0;
        
        // Reset used questions
        this.questionBank.resetUsedQuestions();
    }
    
    /**
     * Update leaderboard
     */
    updateLeaderboard() {
        if (!this.elements.leaderboard) return;
        
        try {
            const scores = JSON.parse(localStorage.getItem('high_scores') || '[]');
            
            // Sort by score (descending)
            scores.sort((a, b) => b.score - a.score);
            
            // Take top 10
            const top10 = scores.slice(0, 10);
            
            this.elements.leaderboard.innerHTML = '';
            
            top10.forEach((player, index) => {
                const isCurrent = player.name === this.state.player.name && 
                                 player.score === this.state.player.score;
                
                const item = document.createElement('div');
                item.className = `leaderboard-item ${isCurrent ? 'current' : ''}`;
                item.innerHTML = `
                    <div class="leaderboard-rank">${index + 1}</div>
                    <div class="leaderboard-avatar">${player.avatar || '👤'}</div>
                    <div class="leaderboard-name">${player.name}</div>
                    <div class="leaderboard-score">${player.score.toLocaleString()}</div>
                `;
                
                this.elements.leaderboard.appendChild(item);
            });
        } catch (error) {
            console.error('Error updating leaderboard:', error);
        }
    }
    
    /**
     * Bind events
     */
    bindEvents() {
        // Player name input
        if (this.elements.player.name) {
            this.elements.player.name.addEventListener('input', (e) => {
                this.state.player.name = e.target.value || 'المتنافس';
                this.elements.player.currentName.textContent = this.state.player.name;
            });
        }
        
        // Player avatar change
        if (this.elements.player.avatar) {
            this.elements.player.avatar.addEventListener('change', (e) => {
                this.state.player.avatar = e.target.value;
                this.elements.player.currentAvatar.textContent = this.state.player.avatar;
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
                const categories = Object.keys(this.questionBank.categories);
                const randomCategory = categories[Math.floor(Math.random() * categories.length)];
                const difficulties = ['easy', 'medium', 'hard'];
                const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
                
                this.startGame(randomCategory, randomDifficulty);
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
                this.updateCategories();
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
        });
    }
    
    /**
     * Use lifeline
     */
    useLifeline(type) {
        if (this.state.game.lifelinesUsed.includes(type)) {
            return;
        }
        
        // Add to used lifelines
        this.state.game.lifelinesUsed.push(type);
        
        // Disable lifeline button
        const lifelineButton = this.elements.lifelines[type];
        if (lifelineButton) {
            lifelineButton.disabled = true;
            lifelineButton.style.opacity = '0.6';
        }
        
        // Apply lifeline effect
        this.applyLifelineEffect(type);
        
        // Play sound
        this.playSound('click');
        
        // Show notification
        this.showNotification(`تم استخدام أداة ${this.getLifelineName(type)}`, 'info');
    }
    
    /**
     * Apply lifeline effect
     */
    applyLifelineEffect(type) {
        const question = this.state.game.questions[this.state.game.currentQuestion];
        
        switch(type) {
            case '5050':
                this.applyFiftyFifty(question);
                break;
            case 'call':
                this.applyCallFriend(question);
                break;
            case 'audience':
                this.applyAudiencePoll(question);
                break;
            case 'skip':
                this.applySkipQuestion();
                break;
        }
    }
    
    /**
     * Apply 50:50 lifeline
     */
    applyFiftyFifty(question) {
        const wrongAnswers = [0, 1, 2, 3].filter(index => index !== question.correct);
        const toRemove = wrongAnswers.sort(() => Math.random() - 0.5).slice(0, 2);
        
        document.querySelectorAll('.answer-btn').forEach((btn, index) => {
            if (toRemove.includes(index)) {
                btn.style.opacity = '0.3';
                btn.style.pointerEvents = 'none';
            }
        });
    }
    
    /**
     * Apply call friend lifeline
     */
    applyCallFriend(question) {
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
     * Apply audience poll lifeline
     */
    applyAudiencePoll(question) {
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
    applySkipQuestion() {
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
     * Show modal
     */
    showModal(title, content) {
        const modalsContainer = document.getElementById('modals-container');
        if (!modalsContainer) return;
        
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
        modalsContainer.appendChild(overlay);
        
        // Show modal
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
     * Share results
     */
    shareResults() {
        const shareText = `💰 ربحت ${this.state.player.score.toLocaleString()} دينار في لعبة من سريع المليون!
لعبت ${this.state.game.correctAnswers} إجابة صحيحة من ${this.state.game.currentQuestion + 1} سؤالاً.
جربها الآن: ${window.location.href}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'نتيجتي في لعبة من سريع المليون',
                text: shareText,
                url: window.location.href
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification('تم نسخ النتيجة إلى الحافظة 📋', 'success');
            }).catch(() => {
                alert(shareText);
            });
        }
    }
    
    /**
     * Update player info
     */
    updatePlayerInfo() {
        if (this.elements.player.level) {
            this.elements.player.level.textContent = `المستوى ${this.state.player.level}`;
        }
    }
}

export default GameEngine;
