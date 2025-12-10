/**
 * Millionaire Game Engine - المحرك الرئيسي للعبة
 * الإصدار 3.1.0 - معدل ومحسن بالكامل
 */

class MillionaireGame {
    constructor() {
        // المكونات الرئيسية
        this.config = window.GameConfig || {};
        this.questionBank = null;
        this.securityManager = null;
        this.subscriptionManager = null;
        
        // حالة اللعبة
        this.state = {
            screen: 'home',
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
            game: {
                currentQuestion: 0,
                questions: [],
                selectedAnswer: null,
                isAnswered: false,
                timeLeft: 45,
                timer: null,
                lifelinesUsed: [],
                startTime: null,
                correctAnswers: 0,
                totalTime: 0,
                category: 'general',
                difficulty: 'easy',
                isPaused: false,
                safeHavenReached: false
            },
            settings: {
                sound: true,
                vibrations: true,
                animations: true,
                autoNext: false,
                timerEnabled: true,
                showHints: true,
                theme: 'default'
            }
        };
        
        // عناصر DOM
        this.elements = {};
        
        // تهيئة اللعبة
        this.initialize();
    }
    
    /**
     * تهيئة اللعبة
     */
    async initialize() {
        console.log('🚀 تهيئة لعبة من سريع المليون...');
        
        try {
            // تحميل المكونات
            await this.loadComponents();
            
            // تحميل البيانات المحفوظة
            this.loadSavedData();
            
            // إعداد واجهة المستخدم
            this.setupUI();
            
            // إعداد الأحداث
            this.setupEventListeners();
            
            // البدء
            this.start();
            
            console.log('✅ اللعبة جاهزة للاستخدام');
            
        } catch (error) {
            console.error('❌ فشل في تهيئة اللعبة:', error);
            this.showError('فشل في تحميل اللعبة. يرجى تحديث الصفحة.');
        }
    }
    
    /**
     * تحميل المكونات
     */
    async loadComponents() {
        // نظام الأسئلة
        this.questionBank = new QuestionBank();
        
        // نظام الأمان
        this.securityManager = new SecurityManager();
        
        // نظام الاشتراك
        this.subscriptionManager = new SubscriptionManager(this);
        
        // انتظار تحميل الأسئلة
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    /**
     * تحميل البيانات المحفوظة
     */
    loadSavedData() {
        try {
            // بيانات اللاعب
            const savedPlayer = localStorage.getItem('millionaire_player_data');
            if (savedPlayer) {
                const playerData = JSON.parse(savedPlayer);
                this.state.player = { ...this.state.player, ...playerData };
            }
            
            // الإعدادات
            const savedSettings = localStorage.getItem('millionaire_settings');
            if (savedSettings) {
                this.state.settings = JSON.parse(savedSettings);
            }
            
            console.log('📂 تم تحميل البيانات المحفوظة');
        } catch (error) {
            console.warn('⚠️ فشل تحميل البيانات المحفوظة:', error);
        }
    }
    
    /**
     * حفظ بيانات اللعبة
     */
    saveGameData() {
        try {
            // حفظ بيانات اللاعب
            localStorage.setItem('millionaire_player_data', 
                JSON.stringify(this.state.player));
            
            // حفظ الإعدادات
            localStorage.setItem('millionaire_settings',
                JSON.stringify(this.state.settings));
                
            console.log('💾 تم حفظ بيانات اللعبة');
        } catch (error) {
            console.error('❌ فشل حفظ بيانات اللعبة:', error);
        }
    }
    
    /**
     * إعداد واجهة المستخدم
     */
    setupUI() {
        // العناصر الأساسية
        this.elements = {
            mainContent: document.getElementById('main-content'),
            notificationContainer: document.getElementById('notification-container'),
            modalsContainer: document.getElementById('modals-container'),
            soundToggle: document.getElementById('sound-toggle'),
            statsBtn: document.getElementById('stats-btn'),
            homeBtn: document.getElementById('home-btn'),
            playBtn: document.getElementById('play-btn'),
            leaderboardBtn: document.getElementById('leaderboard-btn'),
            moreBtn: document.getElementById('more-btn')
        };
        
        // تحميل الشاشة الرئيسية
        this.loadScreen('home');
    }
    
    /**
     * تحميل شاشة معينة
     */
    loadScreen(screenName) {
        // تحديث حالة الشاشة
        this.state.screen = screenName;
        
        // تحديث التنقل
        this.updateNavigation();
        
        // تحميل محتوى الشاشة
        switch (screenName) {
            case 'home':
                this.loadHomeScreen();
                break;
            case 'play':
                this.loadPlayScreen();
                break;
            case 'game':
                this.loadGameScreen();
                break;
            case 'results':
                this.loadResultsScreen();
                break;
            case 'leaderboard':
                this.loadLeaderboardScreen();
                break;
            case 'more':
                this.loadMoreScreen();
                break;
        }
    }
    
    /**
     * تحديث شريط التنقل
     */
    updateNavigation() {
        const buttons = ['home', 'play', 'leaderboard', 'more'];
        buttons.forEach(btn => {
            const element = this.elements[`${btn}Btn`];
            if (element) {
                element.classList.toggle('active', this.state.screen === btn);
            }
        });
    }
    
    /**
     * تحميل الشاشة الرئيسية
     */
    loadHomeScreen() {
        const html = `
            <div class="screen home-screen active">
                <div class="welcome-section">
                    <h2>مرحباً ${this.state.player.name}!</h2>
                    <p>جهز نفسك لتحقيق المليون دينار</p>
                </div>
                
                <div class="quick-actions">
                    <button class="quick-btn primary" id="quick-play-btn">
                        <i class="fas fa-bolt"></i>
                        بدء سريع
                    </button>
                    
                    <button class="quick-btn secondary" id="custom-play-btn">
                        <i class="fas fa-cog"></i>
                        لعب مخصص
                    </button>
                </div>
                
                <div class="stats-cards">
                    <div class="stat-card">
                        <i class="fas fa-trophy"></i>
                        <div class="value">${this.state.player.stats.bestScore.toLocaleString()}</div>
                        <div class="label">أفضل نتيجة</div>
                    </div>
                    
                    <div class="stat-card">
                        <i class="fas fa-chart-line"></i>
                        <div class="value">${this.state.player.level}</div>
                        <div class="label">المستوى</div>
                    </div>
                    
                    <div class="stat-card">
                        <i class="fas fa-coins"></i>
                        <div class="value">${this.state.player.stats.totalMoney.toLocaleString()}</div>
                        <div class="label">إجمالي الأموال</div>
                    </div>
                    
                    <div class="stat-card">
                        <i class="fas fa-gamepad"></i>
                        <div class="value">${this.state.player.stats.gamesPlayed}</div>
                        <div class="label">مرات اللعب</div>
                    </div>
                </div>
                
                <div class="daily-challenge">
                    <h3><i class="fas fa-calendar-day"></i> التحدي اليومي</h3>
                    <p>أجب على 5 أسئلة يومياً واحصل على مكافآت!</p>
                    <button class="btn" id="daily-challenge-btn">
                        <i class="fas fa-play"></i> ابدأ التحدي
                    </button>
                </div>
            </div>
        `;
        
        this.elements.mainContent.innerHTML = html;
        
        // إضافة الأحداث
        setTimeout(() => {
            document.getElementById('quick-play-btn')?.addEventListener('click', () => this.startQuickGame());
            document.getElementById('custom-play-btn')?.addEventListener('click', () => this.loadScreen('play'));
            document.getElementById('daily-challenge-btn')?.addEventListener('click', () => this.startDailyChallenge());
        }, 100);
    }
    
    /**
     * تحميل شاشة اللعب
     */
    loadPlayScreen() {
        const categories = this.questionBank.getAllCategories();
        
        const html = `
            <div class="screen play-screen active">
                <div class="player-setup">
                    <div class="setup-card">
                        <h3><i class="fas fa-user"></i> الملف الشخصي</h3>
                        <div class="input-group">
                            <input type="text" id="player-name-input" 
                                   value="${this.state.player.name}" 
                                   placeholder="اسم اللاعب">
                            <select id="player-avatar-select">
                                <option value="👤" ${this.state.player.avatar === '👤' ? 'selected' : ''}>👤 لاعب</option>
                                <option value="👨‍💼" ${this.state.player.avatar === '👨‍💼' ? 'selected' : ''}>👨‍💼 رجل أعمال</option>
                                <option value="👩‍💼" ${this.state.player.avatar === '👩‍💼' ? 'selected' : ''}>👩‍💼 سيدة أعمال</option>
                                <option value="👨‍🎓" ${this.state.player.avatar === '👨‍🎓' ? 'selected' : ''}>👨‍🎓 طالب</option>
                                <option value="👩‍🎓" ${this.state.player.avatar === '👩‍🎓' ? 'selected' : ''}>👩‍🎓 طالبة</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="setup-card">
                        <h3><i class="fas fa-tags"></i> اختر التصنيف</h3>
                        <div class="categories-grid" id="categories-container">
                            ${categories.map(cat => `
                                <div class="category-card ${this.state.game.category === cat.id ? 'selected' : ''}" 
                                     data-category="${cat.id}">
                                    <div class="category-icon">${cat.icon}</div>
                                    <h4>${cat.name}</h4>
                                    <p>${cat.description}</p>
                                    <div class="category-stats">
                                        <span>${cat.questionCount} سؤال</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="setup-card">
                        <h3><i class="fas fa-sliders-h"></i> مستوى الصعوبة</h3>
                        <div class="difficulty-options">
                            <div class="difficulty-option ${this.state.game.difficulty === 'easy' ? 'selected' : ''}" 
                                 data-difficulty="easy">
                                <div class="diff-icon">😊</div>
                                <div class="diff-info">
                                    <h4>سهل</h4>
                                    <p>مناسب للمبتدئين</p>
                                    <div class="diff-stats">
                                        <span><i class="fas fa-clock"></i> 45 ثانية</span>
                                        <span><i class="fas fa-life-ring"></i> 3 أدوات</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="difficulty-option ${this.state.game.difficulty === 'medium' ? 'selected' : ''}" 
                                 data-difficulty="medium">
                                <div class="diff-icon">😐</div>
                                <div class="diff-info">
                                    <h4>متوسط</h4>
                                    <p>مستوى صعوبة متوسط</p>
                                    <div class="diff-stats">
                                        <span><i class="fas fa-clock"></i> 30 ثانية</span>
                                        <span><i class="fas fa-life-ring"></i> 2 أدوات</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="difficulty-option ${this.state.game.difficulty === 'hard' ? 'selected' : ''}" 
                                 data-difficulty="hard">
                                <div class="diff-icon">😓</div>
                                <div class="diff-info">
                                    <h4>صعب</h4>
                                    <p>تحدي للخبراء</p>
                                    <div class="diff-stats">
                                        <span><i class="fas fa-clock"></i> 20 ثانية</span>
                                        <span><i class="fas fa-life-ring"></i> 1 أداة</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="action-buttons">
                        <button class="btn secondary" id="back-to-home">
                            <i class="fas fa-arrow-right"></i> رجوع
                        </button>
                        <button class="btn primary" id="start-game-btn">
                            <i class="fas fa-play-circle"></i> بدء اللعبة
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.elements.mainContent.innerHTML = html;
        
        // إضافة الأحداث
        setTimeout(() => {
            // اسم اللاعب
            document.getElementById('player-name-input')?.addEventListener('input', (e) => {
                this.state.player.name = e.target.value.substring(0, 20);
                this.saveGameData();
            });
            
            // الصورة الرمزية
            document.getElementById('player-avatar-select')?.addEventListener('change', (e) => {
                this.state.player.avatar = e.target.value;
                this.saveGameData();
            });
            
            // التصنيفات
            document.querySelectorAll('.category-card').forEach(card => {
                card.addEventListener('click', () => {
                    document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    this.state.game.category = card.dataset.category;
                });
            });
            
            // مستوى الصعوبة
            document.querySelectorAll('.difficulty-option').forEach(option => {
                option.addEventListener('click', () => {
                    document.querySelectorAll('.difficulty-option').forEach(o => o.classList.remove('selected'));
                    option.classList.add('selected');
                    this.state.game.difficulty = option.dataset.difficulty;
                });
            });
            
            // الأزرار
            document.getElementById('back-to-home')?.addEventListener('click', () => this.loadScreen('home'));
            document.getElementById('start-game-btn')?.addEventListener('click', () => this.startNewGame());
        }, 100);
    }
    
    /**
     * بدء لعبة جديدة
     */
    async startNewGame() {
        try {
            // إعادة تعيين حالة اللعبة
            this.resetGameState();
            
            // توليد الأسئلة
            this.state.game.questions = this.questionBank.getGameQuestions(
                this.state.game.category, 
                15
            );
            
            if (this.state.game.questions.length === 0) {
                this.showNotification('لا توجد أسئلة كافية في هذا التصنيف', 'error');
                return;
            }
            
            // تحميل شاشة اللعبة
            this.loadScreen('game');
            
            // عرض السؤال الأول
            this.displayCurrentQuestion();
            
            // بدء المؤقت
            this.startTimer();
            
            // تسجيل وقت البدء
            this.state.game.startTime = Date.now();
            
            // تسجيل الحدث
            this.securityManager?.logSecurityEvent('game_started', {
                category: this.state.game.category,
                difficulty: this.state.game.difficulty
            });
            
            this.showNotification('بدأت اللعبة! حظاً موفقاً', 'success');
            
        } catch (error) {
            console.error('❌ فشل بدء اللعبة:', error);
            this.showNotification('فشل في بدء اللعبة. يرجى المحاولة مرة أخرى', 'error');
        }
    }
    
    /**
     * بدء لعبة سريعة
     */
    startQuickGame() {
        // اختيار تصنيف عشوائي
        const categories = this.questionBank.getAllCategories();
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        
        this.state.game.category = randomCategory.id;
        this.state.game.difficulty = 'easy';
        
        this.startNewGame();
    }
    
    /**
     * بدء التحدي اليومي
     */
    startDailyChallenge() {
        this.state.game.category = 'general';
        this.state.game.difficulty = 'medium';
        this.state.game.questions = this.questionBank.getGameQuestions('general', 5);
        
        this.loadScreen('game');
        this.displayCurrentQuestion();
        this.startTimer();
        this.state.game.startTime = Date.now();
    }
    
    /**
     * إعادة تعيين حالة اللعبة
     */
    resetGameState() {
        this.state.game = {
            currentQuestion: 0,
            questions: [],
            selectedAnswer: null,
            isAnswered: false,
            timeLeft: this.getTimeForCurrentQuestion(),
            timer: null,
            lifelinesUsed: [],
            startTime: null,
            correctAnswers: 0,
            totalTime: 0,
            category: this.state.game.category || 'general',
            difficulty: this.state.game.difficulty || 'easy',
            isPaused: false,
            safeHavenReached: false
        };
        
        this.state.player.score = 0;
        this.state.player.streak = 0;
        
        this.questionBank.resetUsedQuestions();
    }
    
    /**
     * تحميل شاشة اللعبة
     */
    loadGameScreen() {
        const html = `
            <div class="screen game-screen active">
                <div class="game-header-info">
                    <div class="player-info">
                        <div class="player-avatar">${this.state.player.avatar}</div>
                        <div class="player-details">
                            <h4>${this.state.player.name}</h4>
                            <div class="player-level">المستوى ${this.state.player.level}</div>
                        </div>
                    </div>
                    
                    <div class="game-stats">
                        <div class="stat">
                            <div class="stat-value" id="time-left">${this.state.game.timeLeft}</div>
                            <div class="stat-label">ثانية</div>
                        </div>
                        
                        <div class="stat">
                            <div class="stat-value" id="current-score">0</div>
                            <div class="stat-label">دينار</div>
                        </div>
                        
                        <div class="stat">
                            <div class="stat-value" id="streak-count">0</div>
                            <div class="stat-label">تتابع</div>
                        </div>
                    </div>
                </div>
                
                <div class="question-area">
                    <div class="question-header">
                        <div class="question-meta">
                            <span class="category-badge" id="current-category">عام</span>
                            <span class="question-value" id="question-value">100 دينار</span>
                        </div>
                        <div class="question-number">
                            <span id="current-question">1</span>/15
                        </div>
                    </div>
                    
                    <div class="question-card">
                        <div class="question-text" id="question-text">جارٍ تحميل السؤال...</div>
                        <div class="question-hint" id="question-hint"></div>
                    </div>
                    
                    <div class="answers-grid" id="answers-container">
                        <!-- سيتم تحميل الإجابات هنا -->
                    </div>
                </div>
                
                <div class="lifelines-section">
                    <h4><i class="fas fa-life-ring"></i> أدوات المساعدة</h4>
                    <div class="lifelines-grid">
                        <button class="lifeline-btn" id="lifeline-5050" data-lifeline="5050">
                            <div class="lifeline-icon">50:50</div>
                            <div class="lifeline-name">حذف إجابتين</div>
                        </button>
                        
                        <button class="lifeline-btn" id="lifeline-call" data-lifeline="call">
                            <div class="lifeline-icon">📞</div>
                            <div class="lifeline-name">اتصال بصديق</div>
                        </button>
                        
                        <button class="lifeline-btn" id="lifeline-audience" data-lifeline="audience">
                            <div class="lifeline-icon">👥</div>
                            <div class="lifeline-name">تصويت الجمهور</div>
                        </button>
                        
                        <button class="lifeline-btn" id="lifeline-skip" data-lifeline="skip">
                            <div class="lifeline-icon">⏭️</div>
                            <div class="lifeline-name">تخطي السؤال</div>
                        </button>
                    </div>
                </div>
                
                <div class="game-controls">
                    <button class="control-btn-lg danger" id="quit-game-btn">
                        <i class="fas fa-sign-out-alt"></i> انسحاب
                    </button>
                    
                    <div class="game-info">
                        <span id="questions-left">14 أسئلة متبقية</span>
                    </div>
                    
                    <button class="control-btn-lg success" id="next-question-btn" disabled>
                        <i class="fas fa-arrow-left"></i> التالي
                    </button>
                </div>
            </div>
        `;
        
        this.elements.mainContent.innerHTML = html;
        
        // إعداد أدوات المساعدة
        this.setupLifelines();
        
        // إعداد الأحداث
        setTimeout(() => {
            document.getElementById('quit-game-btn')?.addEventListener('click', () => this.quitGame());
            document.getElementById('next-question-btn')?.addEventListener('click', () => this.nextQuestion());
        }, 100);
    }
    
    /**
     * عرض السؤال الحالي
     */
    displayCurrentQuestion() {
        const question = this.state.game.questions[this.state.game.currentQuestion];
        if (!question) return;
        
        // تحديث واجهة السؤال
        document.getElementById('current-question')?.textContent = this.state.game.currentQuestion + 1;
        document.getElementById('question-text')?.textContent = question.question;
        
        // قيمة السؤال
        const prize = this.config.PRIZES?.[this.state.game.currentQuestion] || 100;
        document.getElementById('question-value')?.textContent = `${prize.toLocaleString()} دينار`;
        
        // التصنيف
        const category = this.questionBank.categories[question.category]?.name || 'عام';
        document.getElementById('current-category')?.textContent = category;
        
        // الأسئلة المتبقية
        const questionsLeft = 15 - this.state.game.currentQuestion - 1;
        document.getElementById('questions-left')?.textContent = `${questionsLeft} أسئلة متبقية`;
        
        // عرض الإجابات
        this.displayAnswers(question.answers);
        
        // إخفاء التلميح
        document.getElementById('question-hint')?.style.display = 'none';
        
        // تفعيل زر التالي
        document.getElementById('next-question-btn')?.disabled = true;
        
        // عرض التلميح بعد 10 ثوانٍ
        if (this.state.settings.showHints && question.hint) {
            setTimeout(() => {
                if (!this.state.game.isAnswered) {
                    this.showHint(question.hint);
                }
            }, 10000);
        }
        
        // تحديث المؤقت
        this.updateTimerDisplay();
    }
    
    /**
     * عرض الإجابات
     */
    displayAnswers(answers) {
        const container = document.getElementById('answers-container');
        if (!container) return;
        
        const letters = ['أ', 'ب', 'ج', 'د'];
        let html = '';
        
        answers.forEach((answer, index) => {
            html += `
                <button class="answer-btn" data-index="${index}">
                    <div class="answer-letter">${letters[index]}</div>
                    <div class="answer-text">${answer}</div>
                </button>
            `;
        });
        
        container.innerHTML = html;
        
        // إضافة الأحداث للإجابات
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.selectAnswer(index);
            });
        });
    }
    
    /**
     * اختيار إجابة
     */
    selectAnswer(index) {
        if (this.state.game.isAnswered || this.state.game.isPaused) {
            return;
        }
        
        // تسجيل الإجابة المختارة
        this.state.game.selectedAnswer = index;
        this.state.game.isAnswered = true;
        
        // إيقاف المؤقت
        this.stopTimer();
        
        // تعطيل جميع الإجابات
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.disabled = true;
        });
        
        // تمييز الإجابة المختارة
        const selectedBtn = document.querySelector(`.answer-btn[data-index="${index}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
        }
        
        // التحقق من الإجابة
        const question = this.state.game.questions[this.state.game.currentQuestion];
        const isCorrect = index === question.correct;
        
        // تطبيق التأثير
        this.applyAnswerEffect(isCorrect);
        
        // معالجة النتيجة
        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
        
        // تفعيل زر التالي
        document.getElementById('next-question-btn')?.disabled = false;
        
        // تشغيل الصوت
        this.playSound(isCorrect ? 'correct' : 'wrong');
    }
    
    /**
     * معالجة الإجابة الصحيحة
     */
    handleCorrectAnswer() {
        const question = this.state.game.questions[this.state.game.currentQuestion];
        const prize = this.config.PRIZES?.[this.state.game.currentQuestion] || 100;
        
        // تحديث النتيجة
        this.state.player.score += prize;
        this.state.game.correctAnswers++;
        this.state.player.streak++;
        
        // تحديث واجهة النتيجة
        document.getElementById('current-score')?.textContent = this.state.player.score.toLocaleString();
        document.getElementById('streak-count')?.textContent = this.state.player.streak;
        
        // تمييز الإجابة الصحيحة
        const correctBtn = document.querySelector(`.answer-btn[data-index="${question.correct}"]`);
        if (correctBtn) {
            correctBtn.classList.add('correct');
        }
        
        // التحقق من الوصول إلى الضمان
        this.checkSafeHaven();
        
        // تسجيل الحدث
        this.securityManager?.logSecurityEvent('correct_answer', {
            questionId: question.id,
            prize: prize,
            streak: this.state.player.streak
        });
        
        this.showNotification('إجابة صحيحة! مبروك', 'success');
    }
    
    /**
     * معالجة الإجابة الخاطئة
     */
    handleWrongAnswer() {
        const question = this.state.game.questions[this.state.game.currentQuestion];
        
        // إعادة تعيين التتابع
        this.state.player.streak = 0;
        document.getElementById('streak-count')?.textContent = '0';
        
        // تمييز الإجابات الخاطئة والصحيحة
        const wrongBtn = document.querySelector(`.answer-btn[data-index="${this.state.game.selectedAnswer}"]`);
        if (wrongBtn) {
            wrongBtn.classList.add('wrong');
        }
        
        const correctBtn = document.querySelector(`.answer-btn[data-index="${question.correct}"]`);
        if (correctBtn) {
            correctBtn.classList.add('correct');
        }
        
        // إنهاء اللعبة بعد تأخير
        setTimeout(() => {
            this.endGame(false);
        }, 3000);
        
        this.showNotification('إجابة خاطئة. حاول مرة أخرى!', 'error');
    }
    
    /**
     * التحقق من الوصول إلى الضمان
     */
    checkSafeHaven() {
        const currentQuestion = this.state.game.currentQuestion + 1;
        const safeHavens = this.config.SAFE_HAVENS || [5, 10];
        
        if (safeHavens.includes(currentQuestion)) {
            this.state.game.safeHavenReached = true;
            this.showNotification(`مبلغ ${this.state.player.score.toLocaleString()} دينار مضمون الآن!`, 'success');
        }
    }
    
    /**
     * الانتقال للسؤال التالي
     */
    nextQuestion() {
        this.state.game.currentQuestion++;
        
        // التحقق من نهاية اللعبة
        if (this.state.game.currentQuestion >= 15) {
            this.endGame(true);
            return;
        }
        
        // إعادة تعيين حالة الإجابة
        this.state.game.selectedAnswer = null;
        this.state.game.isAnswered = false;
        
        // تحديث المؤقت
        this.state.game.timeLeft = this.getTimeForCurrentQuestion();
        this.updateTimerDisplay();
        
        // تعطيل زر التالي
        document.getElementById('next-question-btn')?.disabled = true;
        
        // عرض السؤال التالي
        this.displayCurrentQuestion();
        
        // بدء المؤقت
        this.startTimer();
    }
    
    /**
     * بدء المؤقت
     */
    startTimer() {
        if (!this.state.settings.timerEnabled) {
            document.getElementById('time-left')?.textContent = '∞';
            return;
        }
        
        // إيقاف أي مؤقت سابق
        this.stopTimer();
        
        // بدء المؤقت الجديد
        this.state.game.timer = setInterval(() => {
            this.state.game.timeLeft--;
            this.updateTimerDisplay();
            
            // تغيير اللون عندما ينفد الوقت
            if (this.state.game.timeLeft <= 10) {
                document.getElementById('time-left')?.style.color = '#e17055';
            }
            
            // انتهاء الوقت
            if (this.state.game.timeLeft <= 0) {
                this.handleTimeUp();
            }
        }, 1000);
    }
    
    /**
     * إيقاف المؤقت
     */
    stopTimer() {
        if (this.state.game.timer) {
            clearInterval(this.state.game.timer);
            this.state.game.timer = null;
        }
    }
    
    /**
     * تحديث عرض المؤقت
     */
    updateTimerDisplay() {
        const timeElement = document.getElementById('time-left');
        if (timeElement) {
            timeElement.textContent = this.state.game.timeLeft;
            timeElement.style.color = 'white';
        }
    }
    
    /**
     * الحصول على الوقت للسؤال الحالي
     */
    getTimeForCurrentQuestion() {
        const questionIndex = this.state.game.currentQuestion;
        
        if (questionIndex < 5) return 45;
        if (questionIndex < 10) return 30;
        return 20;
    }
    
    /**
     * معالجة انتهاء الوقت
     */
    handleTimeUp() {
        this.stopTimer();
        this.state.game.isAnswered = true;
        
        // تعطيل جميع الإجابات
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.disabled = true;
        });
        
        // عرض الإجابة الصحيحة
        const question = this.state.game.questions[this.state.game.currentQuestion];
        const correctBtn = document.querySelector(`.answer-btn[data-index="${question.correct}"]`);
        if (correctBtn) {
            correctBtn.classList.add('correct');
        }
        
        // تفعيل زر التالي
        document.getElementById('next-question-btn')?.disabled = false;
        
        // إنهاء اللعبة بعد تأخير
        setTimeout(() => {
            this.endGame(false);
        }, 3000);
        
        this.showNotification('انتهى الوقت!', 'error');
        this.playSound('wrong');
    }
    
    /**
     * إنهاء اللعبة
     */
    endGame(isWin) {
        // إيقاف المؤقت
        this.stopTimer();
        
        // حساب الإحصائيات
        const totalTime = Math.floor((Date.now() - this.state.game.startTime) / 1000);
        const avgTime = Math.floor(totalTime / (this.state.game.currentQuestion + 1));
        const accuracy = Math.floor((this.state.game.correctAnswers / (this.state.game.currentQuestion + 1)) * 100);
        
        this.state.game.totalTime = totalTime;
        
        // تحديث إحصائيات اللاعب
        this.updatePlayerStats(isWin, totalTime, avgTime, accuracy);
        
        // حساب وإضافة نقاط التجربة
        this.calculateAndAddXP(isWin, accuracy);
        
        // حفظ بيانات اللعبة
        this.saveGameData();
        
        // تحميل شاشة النتائج
        this.loadResultsScreen(isWin, totalTime, avgTime, accuracy);
        
        // تشغيل الصوت
        this.playSound(isWin ? 'win' : 'wrong');
        
        // عرض الإشعار
        const message = isWin ? '🎉 تهانينا! فوز رائع!' : '💪 ستنجح في المرة القادمة!';
        this.showNotification(message, isWin ? 'success' : 'info');
    }
    
    /**
     * تحديث إحصائيات اللاعب
     */
    updatePlayerStats(isWin, totalTime, avgTime, accuracy) {
        const stats = this.state.player.stats;
        
        stats.gamesPlayed++;
        stats.totalCorrect += this.state.game.correctAnswers;
        stats.totalQuestions += this.state.game.currentQuestion + 1;
        stats.totalMoney += this.state.player.score;
        
        // تحديث متوسط الوقت
        if (stats.avgTime === 0) {
            stats.avgTime = avgTime;
        } else {
            stats.avgTime = Math.floor((stats.avgTime + avgTime) / 2);
        }
        
        // تحديث أفضل نتيجة
        if (this.state.player.score > stats.bestScore) {
            stats.bestScore = this.state.player.score;
        }
        
        // تحديث أفضل تتابع
        if (this.state.player.streak > stats.highestStreak) {
            stats.highestStreak = this.state.player.streak;
        }
        
        // التحقق من لعبة مثالية
        if (isWin && this.state.game.correctAnswers === 15) {
            stats.perfectGames++;
        }
    }
    
    /**
     * حساب وإضافة نقاط التجربة
     */
    calculateAndAddXP(isWin, accuracy) {
        let xp = 100; // الأساسي
        
        // مكافأة الفوز
        if (isWin) {
            xp += 500;
            
            // مكافأة اللعبة المثالية
            if (this.state.game.correctAnswers === 15) {
                xp += 1000;
            }
        }
        
        // مكافأة الإجابات الصحيحة
        xp += this.state.game.correctAnswers * 50;
        
        // مكافأة التتابع
        xp += this.state.player.streak * 10;
        
        // مكافأة الدقة
        xp += Math.floor(accuracy / 10) * 10;
        
        // مضاعف المستوى
        xp = Math.floor(xp * (1 + (this.state.player.level - 1) * 0.1));
        
        // إضافة نقاط التجربة
        this.state.player.xp += xp;
        
        // التحقق من ارتفاع المستوى
        this.checkLevelUp();
    }
    
    /**
     * التحقق من ارتفاع المستوى
     */
    checkLevelUp() {
        while (this.state.player.xp >= this.state.player.xpToNext) {
            this.state.player.xp -= this.state.player.xpToNext;
            this.state.player.level++;
            this.state.player.xpToNext = Math.floor(this.state.player.xpToNext * 1.5);
            
            this.showNotification(`🎊 مبروك! ارتفع مستواك إلى ${this.state.player.level}`, 'success');
        }
    }
    
    /**
     * تحميل شاشة النتائج
     */
    loadResultsScreen(isWin, totalTime, avgTime, accuracy) {
        const html = `
            <div class="screen results-screen active">
                <div class="results-card">
                    <div class="result-icon">${isWin ? '🏆' : '💡'}</div>
                    <h2 class="result-title">${isWin ? 'مبروك! فزت' : 'انتهت اللعبة'}</h2>
                    <p class="result-subtitle">${isWin ? 'إنجاز رائع يستحق الاحتفال' : 'حاول مرة أخرى وستنجح'}</p>
                    
                    <div class="final-prize">
                        <div class="prize-label">المبلغ النهائي</div>
                        <div class="prize-amount">${this.state.player.score.toLocaleString()} دينار</div>
                        <div class="prize-conversion">≈ ${Math.floor(this.state.player.score / 1000)} دولار</div>
                    </div>
                    
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-icon">✔️</div>
                            <div class="stat-value">${this.state.game.correctAnswers}</div>
                            <div class="stat-label">إجابات صحيحة</div>
                        </div>
                        
                        <div class="stat-item">
                            <div class="stat-icon">⏱️</div>
                            <div class="stat-value">${totalTime}</div>
                            <div class="stat-label">ثانية</div>
                        </div>
                        
                        <div class="stat-item">
                            <div class="stat-icon">📊</div>
                            <div class="stat-value">${avgTime}</div>
                            <div class="stat-label">متوسط الوقت</div>
                        </div>
                        
                        <div class="stat-item">
                            <div class="stat-icon">🎯</div>
                            <div class="stat-value">${accuracy}%</div>
                            <div class="stat-label">دقة</div>
                        </div>
                    </div>
                    
                    <div class="results-actions">
                        <button class="action-btn primary" id="play-again-btn">
                            <i class="fas fa-redo"></i> لعب مرة أخرى
                        </button>
                        
                        <button class="action-btn secondary" id="share-results-btn">
                            <i class="fas fa-share-alt"></i> مشاركة النتيجة
                        </button>
                        
                        <button class="action-btn outline" id="go-home-btn">
                            <i class="fas fa-home"></i> الرئيسية
                        </button>
                    </div>
                </div>
                
                <div class="leaderboard-preview">
                    <h3><i class="fas fa-trophy"></i> المتصدرون</h3>
                    <div id="leaderboard-container">
                        <!-- سيتم تحميل المتصدرين هنا -->
                    </div>
                </div>
            </div>
        `;
        
        this.elements.mainContent.innerHTML = html;
        
        // تحميل المتصدرين
        this.loadLeaderboard();
        
        // إضافة الأحداث
        setTimeout(() => {
            document.getElementById('play-again-btn')?.addEventListener('click', () => this.startNewGame());
            document.getElementById('share-results-btn')?.addEventListener('click', () => this.shareResults());
            document.getElementById('go-home-btn')?.addEventListener('click', () => this.loadScreen('home'));
        }, 100);
    }
    
    /**
     * تحميل المتصدرين
     */
    loadLeaderboard() {
        const container = document.getElementById('leaderboard-container');
        if (!container) return;
        
        try {
            // جلب المتصدرين من localStorage
            const scores = JSON.parse(localStorage.getItem('millionaire_high_scores') || '[]');
            
            // إضافة النتيجة الحالية
            const currentScore = {
                name: this.state.player.name,
                avatar: this.state.player.avatar,
                score: this.state.player.score,
                date: new Date().toISOString()
            };
            
            scores.push(currentScore);
            
            // ترتيب التنازلي
            scores.sort((a, b) => b.score - a.score);
            
            // أخذ أفضل 10
            const top10 = scores.slice(0, 10);
            
            // عرض المتصدرين
            let html = '<table>';
            html += '<tr><th>المركز</th><th>اللاعب</th><th>النقاط</th></tr>';
            
            top10.forEach((player, index) => {
                const isCurrent = player.name === this.state.player.name && 
                                 player.score === this.state.player.score;
                
                html += `
                    <tr ${isCurrent ? 'class="current-player"' : ''}>
                        <td>${index + 1}</td>
                        <td>
                            <span class="player-avatar-small">${player.avatar}</span>
                            ${player.name}
                        </td>
                        <td>${player.score.toLocaleString()}</td>
                    </tr>
                `;
            });
            
            html += '</table>';
            container.innerHTML = html;
            
            // حفظ المتصدرين
            localStorage.setItem('millionaire_high_scores', JSON.stringify(scores.slice(0, 100)));
            
        } catch (error) {
            container.innerHTML = '<p>لا توجد نتائج سابقة</p>';
        }
    }
    
    /**
     * تحميل شاشة المتصدرين
     */
    loadLeaderboardScreen() {
        const html = `
            <div class="screen leaderboard-screen active">
                <h2><i class="fas fa-trophy"></i> المتصدرون</h2>
                <div id="full-leaderboard">
                    <!-- سيتم تحميل المتصدرين هنا -->
                </div>
                
                <div class="action-buttons">
                    <button class="btn" id="back-from-leaderboard">
                        <i class="fas fa-arrow-right"></i> رجوع
                    </button>
                </div>
            </div>
        `;
        
        this.elements.mainContent.innerHTML = html;
        
        // تحميل المتصدرين
        this.loadFullLeaderboard();
        
        // إضافة الأحداث
        setTimeout(() => {
            document.getElementById('back-from-leaderboard')?.addEventListener('click', () => 
                this.loadScreen('home'));
        }, 100);
    }
    
    /**
     * تحميل قائمة المتصدرين الكاملة
     */
    loadFullLeaderboard() {
        const container = document.getElementById('full-leaderboard');
        if (!container) return;
        
        try {
            const scores = JSON.parse(localStorage.getItem('millionaire_high_scores') || '[]');
            
            if (scores.length === 0) {
                container.innerHTML = '<p class="empty-message">لا توجد نتائج سابقة</p>';
                return;
            }
            
            let html = '<table>';
            html += '<tr><th>#</th><th>اللاعب</th><th>النقاط</th><th>التاريخ</th></tr>';
            
            scores.forEach((player, index) => {
                const date = new Date(player.date);
                const dateStr = `${date.getDate()}/${date.getMonth() + 1}`;
                
                html += `
                    <tr ${index < 3 ? 'class="top-three"' : ''}>
                        <td>${index + 1}</td>
                        <td>
                            <span class="player-avatar-small">${player.avatar || '👤'}</span>
                            ${player.name}
                        </td>
                        <td class="score-value">${player.score.toLocaleString()}</td>
                        <td class="score-date">${dateStr}</td>
                    </tr>
                `;
            });
            
            html += '</table>';
            container.innerHTML = html;
            
        } catch (error) {
            container.innerHTML = '<p class="error-message">فشل تحميل المتصدرين</p>';
        }
    }
    
    /**
     * تحميل شاشة المزيد
     */
    loadMoreScreen() {
        const html = `
            <div class="screen more-screen active">
                <h2><i class="fas fa-ellipsis-h"></i> المزيد</h2>
                
                <div class="options-list">
                    <div class="option-item" data-action="settings">
                        <div class="option-info">
                            <i class="fas fa-cog"></i>
                            <span>الإعدادات</span>
                        </div>
                        <i class="fas fa-chevron-left"></i>
                    </div>
                    
                    <div class="option-item" data-action="instructions">
                        <div class="option-info">
                            <i class="fas fa-graduation-cap"></i>
                            <span>كيفية اللعب</span>
                        </div>
                        <i class="fas fa-chevron-left"></i>
                    </div>
                    
                    <div class="option-item" data-action="about">
                        <div class="option-info">
                            <i class="fas fa-info-circle"></i>
                            <span>حول اللعبة</span>
                        </div>
                        <i class="fas fa-chevron-left"></i>
                    </div>
                    
                    <div class="option-item" data-action="subscribe">
                        <div class="option-info">
                            <i class="fas fa-crown"></i>
                            <span>النسخة المميزة</span>
                        </div>
                        <i class="fas fa-chevron-left"></i>
                    </div>
                    
                    <div class="option-item" data-action="clear-data">
                        <div class="option-info">
                            <i class="fas fa-trash-alt"></i>
                            <span>مسح البيانات</span>
                        </div>
                        <i class="fas fa-chevron-left"></i>
                    </div>
                </div>
                
                <div class="app-info">
                    <p>من سريع المليون - الإصدار 3.1.0</p>
                    <p class="copyright">© 2024 جميع الحقوق محفوظة</p>
                </div>
            </div>
        `;
        
        this.elements.mainContent.innerHTML = html;
        
        // إضافة الأحداث
        setTimeout(() => {
            document.querySelectorAll('.option-item').forEach(item => {
                item.addEventListener('click', () => {
                    const action = item.dataset.action;
                    this.handleMoreAction(action);
                });
            });
        }, 100);
    }
    
    /**
     * معالجة إجراءات شاشة المزيد
     */
    handleMoreAction(action) {
        switch (action) {
            case 'settings':
                this.showSettingsModal();
                break;
            case 'instructions':
                this.showInstructionsModal();
                break;
            case 'about':
                this.showAboutModal();
                break;
            case 'subscribe':
                this.subscriptionManager.showSubscriptionModal();
                break;
            case 'clear-data':
                this.showClearDataConfirmation();
                break;
        }
    }
    
    /**
     * إعداد أدوات المساعدة
     */
    setupLifelines() {
        document.querySelectorAll('.lifeline-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lifeline = e.currentTarget.dataset.lifeline;
                this.useLifeline(lifeline);
            });
        });
    }
    
    /**
     * استخدام أداة مساعدة
     */
    useLifeline(lifeline) {
        if (this.state.game.lifelinesUsed.includes(lifeline)) {
            return;
        }
        
        // التحقق من الحد الأقصى للأدوات
        const maxLifelines = {
            easy: 3,
            medium: 2,
            hard: 1
        }[this.state.game.difficulty] || 2;
        
        if (this.state.game.lifelinesUsed.length >= maxLifelines) {
            this.showNotification('وصلت للحد الأقصى من أدوات المساعدة', 'warning');
            return;
        }
        
        // تطبيق الأداة
        switch (lifeline) {
            case '5050':
                this.useFiftyFifty();
                break;
            case 'call':
                this.usePhoneAFriend();
                break;
            case 'audience':
                this.useAskAudience();
                break;
            case 'skip':
                this.useSkipQuestion();
                break;
        }
        
        // إضافة للأدوات المستخدمة
        this.state.game.lifelinesUsed.push(lifeline);
        
        // تعطيل الأداة
        const btn = document.getElementById(`lifeline-${lifeline}`);
        if (btn) {
            btn.disabled = true;
            btn.style.opacity = '0.5';
        }
        
        this.showNotification(`تم استخدام ${this.getLifelineName(lifeline)}`, 'info');
    }
    
    /**
     * استخدام أداة 50:50
     */
    useFiftyFifty() {
        const question = this.state.game.questions[this.state.game.currentQuestion];
        const wrongAnswers = [0, 1, 2, 3].filter(i => i !== question.correct);
        
        // اختيار إجابتين خاطئتين عشوائياً
        const toRemove = wrongAnswers.sort(() => Math.random() - 0.5).slice(0, 2);
        
        // إخفاء الإجابات المختارة
        toRemove.forEach(index => {
            const btn = document.querySelector(`.answer-btn[data-index="${index}"]`);
            if (btn) {
                btn.style.opacity = '0.3';
                btn.style.pointerEvents = 'none';
            }
        });
    }
    
    /**
     * استخدام اتصال بصديق
     */
    usePhoneAFriend() {
        const question = this.state.game.questions[this.state.game.currentQuestion];
        const letters = ['أ', 'ب', 'ج', 'د'];
        
        // محاكاة نصيحة الصديق
        const isConfident = Math.random() < 0.7;
        let suggestedAnswer;
        
        if (isConfident) {
            suggestedAnswer = question.correct;
        } else {
            const wrongAnswers = [0, 1, 2, 3].filter(i => i !== question.correct);
            suggestedAnswer = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
        }
        
        const confidence = isConfident ? 'متأكد' : 'غير متأكد';
        
        const modalHTML = `
            <div class="modal-overlay active">
                <div class="modal">
                    <div class="modal-header">
                        <h3><i class="fas fa-phone"></i> اتصال بصديق</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="friend-advice">
                            <div class="friend-avatar">
                                <i class="fas fa-user-tie"></i>
                            </div>
                            <div class="friend-message">
                                <p>"أعتقد أن الإجابة هي ${letters[suggestedAnswer]}"</p>
                                <p class="confidence">مستوى الثقة: ${confidence}</p>
                            </div>
                        </div>
                        <p class="hint">هذا مجرد رأي، القرار النهائي لك</p>
                    </div>
                </div>
            </div>
        `;
        
        this.elements.modalsContainer.innerHTML = modalHTML;
        this.setupModalClose();
    }
    
    /**
     * استخدام تصويت الجمهور
     */
    useAskAudience() {
        const question = this.state.game.questions[this.state.game.currentQuestion];
        const letters = ['أ', 'ب', 'ج', 'د'];
        
        // محاكاة تصويت الجمهور
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
        
        this.showModal('تصويت الجمهور', html);
    }
    
    /**
     * استخدام تخطي السؤال
     */
    async useSkipQuestion() {
        // التحقق من الاشتراك المميز
        if (this.subscriptionManager.isPremium) {
            this.nextQuestion();
            return;
        }
        
        // عرض إعلان
        const adWatched = await this.subscriptionManager.showAd('skip');
        if (adWatched) {
            this.nextQuestion();
        }
    }
    
    /**
     * الحصول على اسم أداة المساعدة
     */
    getLifelineName(lifeline) {
        const names = {
            '5050': '50:50',
            'call': 'اتصال بصديق',
            'audience': 'تصويت الجمهور',
            'skip': 'تخطي السؤال'
        };
        return names[lifeline] || 'أداة مساعدة';
    }
    
    /**
     * الانسحاب من اللعبة
     */
    quitGame() {
        if (confirm('هل تريد الانسحاب والحصول على المبلغ الحالي؟')) {
            this.endGame(false);
        }
    }
    
    /**
     * مشاركة النتائج
     */
    shareResults() {
        const shareText = `🎮 لعبت من سريع المليون وحققت ${this.state.player.score.toLocaleString()} دينار!
${this.state.game.correctAnswers} إجابة صحيحة من ${this.state.game.currentQuestion + 1} سؤال
المستوى: ${this.state.player.level} ⭐`;

        if (navigator.share) {
            navigator.share({
                title: 'نتيجتي في من سريع المليون',
                text: shareText,
                url: window.location.href
            }).catch(() => {
                this.copyToClipboard(shareText);
            });
        } else {
            this.copyToClipboard(shareText);
        }
    }
    
    /**
     * نسخ إلى الحافظة
     */
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('تم نسخ النتيجة إلى الحافظة', 'success');
        }).catch(() => {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showNotification('تم نسخ النتيجة', 'success');
        });
    }
    
    /**
     * عرض تلميح
     */
    showHint(hint) {
        const hintElement = document.getElementById('question-hint');
        if (hintElement) {
            hintElement.innerHTML = `<i class="fas fa-lightbulb"></i> ${hint}`;
            hintElement.style.display = 'flex';
            hintElement.classList.add('highlight');
        }
    }
    
    /**
     * تطبيق تأثير الإجابة
     */
    applyAnswerEffect(isCorrect) {
        const overlay = document.createElement('div');
        overlay.className = 'answer-effect';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${isCorrect ? 'rgba(0, 184, 148, 0.3)' : 'rgba(225, 112, 85, 0.3)'};
            z-index: 999;
            animation: fadeInOut 1s ease;
            pointer-events: none;
        `;
        
        document.body.appendChild(overlay);
        setTimeout(() => overlay.remove(), 1000);
    }
    
    /**
     * تشغيل صوت
     */
    playSound(type) {
        if (!this.state.settings.sound) return;
        
        const audio = document.getElementById(`sound-${type}`);
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log('خطأ في تشغيل الصوت:', e));
        }
    }
    
    /**
     * إظهار إشعار
     */
    showNotification(message, type = 'info') {
        const container = this.elements.notificationContainer;
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
        
        // إزالة بعد 5 ثوانٍ
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    /**
     * إظهار خطأ
     */
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    /**
     * عرض نافذة
     */
    showModal(title, content) {
        const modalHTML = `
            <div class="modal-overlay active">
                <div class="modal">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">${content}</div>
                </div>
            </div>
        `;
        
        this.elements.modalsContainer.innerHTML = modalHTML;
        this.setupModalClose();
    }
    
    /**
     * إعداد إغلاق النافذة
     */
    setupModalClose() {
        const overlay = this.elements.modalsContainer.querySelector('.modal-overlay');
        const closeBtn = this.elements.modalsContainer.querySelector('.modal-close');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                overlay.classList.remove('active');
                setTimeout(() => overlay.remove(), 300);
            });
        }
        
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.classList.remove('active');
                    setTimeout(() => overlay.remove(), 300);
                }
            });
        }
    }
    
    /**
     * عرض نافذة الإعدادات
     */
    showSettingsModal() {
        const html = `
            <div class="settings-modal">
                <h4><i class="fas fa-cog"></i> الإعدادات</h4>
                
                <div class="setting-option">
                    <div class="option-info">
                        <i class="fas fa-volume-up"></i>
                        <span>الصوت</span>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="sound-toggle" ${this.state.settings.sound ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                
                <div class="setting-option">
                    <div class="option-info">
                        <i class="fas fa-bell"></i>
                        <span>الاهتزازات</span>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="vibration-toggle" ${this.state.settings.vibrations ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                
                <div class="setting-option">
                    <div class="option-info">
                        <i class="fas fa-film"></i>
                        <span>الحركات</span>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="animation-toggle" ${this.state.settings.animations ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                
                <div class="setting-option">
                    <div class="option-info">
                        <i class="fas fa-clock"></i>
                        <span>المؤقت</span>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="timer-toggle" ${this.state.settings.timerEnabled ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                
                <div class="setting-option">
                    <div class="option-info">
                        <i class="fas fa-lightbulb"></i>
                        <span>التلميحات</span>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="hint-toggle" ${this.state.settings.showHints ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                
                <button class="btn btn-primary" id="save-settings">
                    <i class="fas fa-save"></i> حفظ
                </button>
            </div>
        `;
        
        this.showModal('الإعدادات', html);
        
        // إضافة الأحداث
        setTimeout(() => {
            document.getElementById('save-settings')?.addEventListener('click', () => {
                this.state.settings.sound = document.getElementById('sound-toggle')?.checked || false;
                this.state.settings.vibrations = document.getElementById('vibration-toggle')?.checked || false;
                this.state.settings.animations = document.getElementById('animation-toggle')?.checked || false;
                this.state.settings.timerEnabled = document.getElementById('timer-toggle')?.checked || false;
                this.state.settings.showHints = document.getElementById('hint-toggle')?.checked || false;
                
                this.saveGameData();
                this.showNotification('تم حفظ الإعدادات', 'success');
                
                document.querySelector('.modal-overlay')?.remove();
            });
        }, 100);
    }
    
    /**
     * عرض نافذة التعليمات
     */
    showInstructionsModal() {
        const html = `
            <div class="instructions-modal">
                <h4><i class="fas fa-graduation-cap"></i> كيفية اللعب</h4>
                
                <ol>
                    <li>اختر اسمك وصورتك الرمزية</li>
                    <li>اختر فئة الأسئلة التي تفضلها</li>
                    <li>ابدأ اللعبة وأجب على 15 سؤالاً</li>
                    <li>احصل على المليون دينار بإجابات صحيحة</li>
                </ol>
                
                <h5>أدوات المساعدة</h5>
                <ul>
                    <li><strong>50:50</strong>: يحذف إجابتين خاطئتين</li>
                    <li><strong>اتصال بصديق</strong>: استشارة خبير</li>
                    <li><strong>تصويت الجمهور</strong>: رأي المشاهدين</li>
                    <li><strong>تخطي السؤال</strong>: مشاهدة إعلان للتخطي</li>
                </ul>
                
                <h5>نظام الجوائز</h5>
                <p>جوائز متزايدة تصل إلى 1,000,000 دينار</p>
                <p>أسئلة مضمونة عند السؤال 5 و 10 (Safe Haven)</p>
            </div>
        `;
        
        this.showModal('كيفية اللعب', html);
    }
    
    /**
     * عرض نافذة حول اللعبة
     */
    showAboutModal() {
        const html = `
            <div class="about-modal">
                <h4><i class="fas fa-info-circle"></i> حول اللعبة</h4>
                
                <div class="app-logo">
                    <span class="logo-icon">💰</span>
                    <h5>من سريع المليون</h5>
                </div>
                
                <p>لعبة مسابقة عربية للفوز بمليون دينار</p>
                <p>الإصدار: 3.1.0</p>
                <p>المطور: فريق تطوير الألعاب العربية</p>
                
                <div class="contact-info">
                    <h6>اتصل بنا</h6>
                    <p><i class="fas fa-envelope"></i> support@millionaire-game.com</p>
                </div>
                
                <div class="social-links">
                    <button class="social-btn"><i class="fab fa-facebook"></i></button>
                    <button class="social-btn"><i class="fab fa-twitter"></i></button>
                    <button class="social-btn"><i class="fab fa-instagram"></i></button>
                </div>
            </div>
        `;
        
        this.showModal('حول اللعبة', html);
    }
    
    /**
     * عرض تأكيد مسح البيانات
     */
    showClearDataConfirmation() {
        const html = `
            <div class="confirm-modal">
                <h4><i class="fas fa-exclamation-triangle"></i> تأكيد المسح</h4>
                <p>هل أنت متأكد من مسح جميع بيانات اللعبة؟</p>
                <p class="warning">هذا الإجراء لا يمكن التراجع عنه!</p>
                
                <div class="confirm-actions">
                    <button class="btn btn-secondary" id="cancel-clear">إلغاء</button>
                    <button class="btn btn-danger" id="confirm-clear">مسح الكل</button>
                </div>
            </div>
        `;
        
        this.showModal('مسح البيانات', html);
        
        setTimeout(() => {
            document.getElementById('cancel-clear')?.addEventListener('click', () => {
                document.querySelector('.modal-overlay')?.remove();
            });
            
            document.getElementById('confirm-clear')?.addEventListener('click', () => {
                this.clearAllData();
                document.querySelector('.modal-overlay')?.remove();
            });
        }, 100);
    }
    
    /**
     * مسح جميع البيانات
     */
    clearAllData() {
        try {
            // مسح localStorage
            localStorage.clear();
            
            // إعادة تعيين حالة اللعبة
            this.state.player = {
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
            };
            
            // إعادة تحميل الشاشة الرئيسية
            this.loadScreen('home');
            
            this.showNotification('تم مسح جميع البيانات بنجاح', 'success');
            
        } catch (error) {
            this.showNotification('فشل في مسح البيانات', 'error');
        }
    }
    
    /**
     * إعداد مستمعي الأحداث
     */
    setupEventListeners() {
        // تبديل الصوت
        this.elements.soundToggle?.addEventListener('click', () => {
            this.state.settings.sound = !this.state.settings.sound;
            this.saveGameData();
            
            const icon = this.elements.soundToggle.querySelector('i');
            if (icon) {
                icon.className = this.state.settings.sound ? 
                    'fas fa-volume-up' : 'fas fa-volume-mute';
            }
            
            this.showNotification(
                this.state.settings.sound ? 'تم تشغيل الصوت' : 'تم إيقاف الصوت',
                'info'
            );
            
            if (this.state.settings.sound) {
                this.playSound('click');
            }
        });
        
        // الإحصائيات
        this.elements.statsBtn?.addEventListener('click', () => {
            this.showStatisticsModal();
        });
        
        // التنقل
        this.elements.homeBtn?.addEventListener('click', () => this.loadScreen('home'));
        this.elements.playBtn?.addEventListener('click', () => this.loadScreen('play'));
        this.elements.leaderboardBtn?.addEventListener('click', () => this.loadScreen('leaderboard'));
        this.elements.moreBtn?.addEventListener('click', () => this.loadScreen('more'));
        
        // اختصارات لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            // الهروب للخروج
            if (e.key === 'Escape' && this.state.screen === 'game') {
                this.quitGame();
            }
            
            // الأرقام للإجابات (1-4)
            if (this.state.screen === 'game' && !this.state.game.isAnswered) {
                const key = parseInt(e.key);
                if (key >= 1 && key <= 4) {
                    this.selectAnswer(key - 1);
                }
            }
            
            // المسافة للسؤال التالي
            if (this.state.screen === 'game' && e.key === ' ' && this.state.game.isAnswered) {
                this.nextQuestion();
            }
            
            // F1 للمساعدة
            if (e.key === 'F1') {
                e.preventDefault();
                this.showInstructionsModal();
            }
        });
        
        // مراقبة التبويب
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.state.screen === 'game' && !this.state.game.isPaused) {
                this.state.game.isPaused = true;
                this.stopTimer();
                this.showNotification('اللعبة متوقفة مؤقتاً', 'warning');
            }
        });
    }
    
    /**
     * عرض إحصائيات اللاعب
     */
    showStatisticsModal() {
        const stats = this.state.player.stats;
        const winRate = stats.gamesPlayed > 0 ? 
            Math.floor((stats.totalCorrect / stats.totalQuestions) * 100) : 0;
        
        const html = `
            <div class="stats-modal">
                <h4><i class="fas fa-chart-bar"></i> إحصائيات اللاعب</h4>
                
                <div class="stats-grid-modal">
                    <div class="stat-item-modal">
                        <div class="stat-value-modal">${stats.gamesPlayed}</div>
                        <div class="stat-label-modal">الألعاب</div>
                    </div>
                    
                    <div class="stat-item-modal">
                        <div class="stat-value-modal">${stats.totalCorrect}</div>
                        <div class="stat-label-modal">إجابات صحيحة</div>
                    </div>
                    
                    <div class="stat-item-modal">
                        <div class="stat-value-modal">${stats.totalMoney.toLocaleString()}</div>
                        <div class="stat-label-modal">إجمالي الأموال</div>
                    </div>
                    
                    <div class="stat-item-modal">
                        <div class="stat-value-modal">${stats.bestScore.toLocaleString()}</div>
                        <div class="stat-label-modal">أفضل نتيجة</div>
                    </div>
                </div>
                
                <div class="advanced-stats">
                    <h5>إحصائيات متقدمة</h5>
                    <p><i class="fas fa-trophy"></i> معدل الدقة: ${winRate}%</p>
                    <p><i class="fas fa-clock"></i> متوسط وقت السؤال: ${stats.avgTime || 0} ثانية</p>
                    <p><i class="fas fa-fire"></i> أفضل تتابع: ${stats.highestStreak}</p>
                    <p><i class="fas fa-star"></i> ألعاب مثالية: ${stats.perfectGames}</p>
                </div>
            </div>
        `;
        
        this.showModal('إحصائيات اللاعب', html);
    }
    
    /**
     * بدء اللعبة
     */
    start() {
        console.log('🎮 لعبة من سريع المليون جاهزة!');
        this.showNotification('مرحباً في من سريع المليون!', 'success');
    }
}

// بدء اللعبة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.game = new MillionaireGame();
});

// التصديع
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MillionaireGame;
}
