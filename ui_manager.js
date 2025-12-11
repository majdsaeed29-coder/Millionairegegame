/**
 * مدير الواجهة - ميليونير الذهبية
 * يدير جميع عناصر واجهة المستخدم والتفاعلات
 */

class UIManager {
    constructor() {
        this.config = GameConfig;
        this.currentScreen = 'loading';
        this.elements = {};
        this.notificationQueue = [];
        this.modalStack = [];
        this.audioEnabled = true;
        this.vibrationEnabled = true;
        
        this.init();
    }
    
    /**
     * تهيئة الواجهة
     */
    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.applyUserPreferences();
        this.showScreen('loading');
        
        // إخفاء شاشة التحميل بعد فترة
        setTimeout(() => {
            this.showScreen('auth');
        }, 2000);
    }
    
    /**
     * تخزين العناصر المهمة
     */
    cacheElements() {
        this.elements = {
            // الحاويات الرئيسية
            appContainer: document.getElementById('app-container'),
            loadingScreen: document.getElementById('loading-screen'),
            authScreen: document.getElementById('auth-screen'),
            mainMenuScreen: document.getElementById('main-menu-screen'),
            gameScreen: document.getElementById('game-screen'),
            resultsScreen: document.getElementById('results-screen'),
            
            // عناصر الشاشات
            // شاشة التحميل
            loader: document.querySelector('.loader'),
            
            // شاشة المصادقة
            loginForm: document.getElementById('login-form'),
            registerForm: document.getElementById('register-form'),
            loginTab: document.getElementById('login-tab'),
            registerTab: document.getElementById('register-tab'),
            usernameInput: document.getElementById('username-input'),
            passwordInput: document.getElementById('password-input'),
            emailInput: document.getElementById('email-input'),
            loginBtn: document.getElementById('login-btn'),
            registerBtn: document.getElementById('register-btn'),
            
            // القائمة الرئيسية
            userWelcome: document.getElementById('user-welcome'),
            userBalance: document.getElementById('user-balance'),
            userLevel: document.getElementById('user-level'),
            playBtn: document.getElementById('play-btn'),
            categoriesBtn: document.getElementById('categories-btn'),
            leaderboardBtn: document.getElementById('leaderboard-btn'),
            settingsBtn: document.getElementById('settings-btn'),
            logoutBtn: document.getElementById('logout-btn'),
            
            // شاشة اختيار التصنيفات
            categoriesContainer: document.getElementById('categories-container'),
            difficultyContainer: document.getElementById('difficulty-container'),
            timerToggle: document.getElementById('timer-toggle'),
            startGameBtn: document.getElementById('start-game-btn'),
            backToMenuBtn: document.getElementById('back-to-menu-btn'),
            
            // شاشة اللعبة
            gameHeader: document.getElementById('game-header'),
            questionNumber: document.getElementById('question-number'),
            questionText: document.getElementById('question-text'),
            answersContainer: document.getElementById('answers-container'),
            lifelinesContainer: document.getElementById('lifelines-container'),
            timerDisplay: document.getElementById('timer-display'),
            currentPrize: document.getElementById('current-prize'),
            prizeLadder: document.getElementById('prize-ladder'),
            quitGameBtn: document.getElementById('quit-game-btn'),
            
            // شاشة النتائج
            finalScore: document.getElementById('final-score'),
            correctAnswers: document.getElementById('correct-answers'),
            totalTime: document.getElementById('total-time'),
            accuracy: document.getElementById('accuracy'),
            playAgainBtn: document.getElementById('play-again-btn'),
            shareResultsBtn: document.getElementById('share-results-btn'),
            backToMenuFromResults: document.getElementById('back-to-menu-results'),
            
            // الصوتيات
            soundClick: document.getElementById('sound-click'),
            soundCorrect: document.getElementById('sound-correct'),
            soundWrong: document.getElementById('sound-wrong'),
            soundWin: document.getElementById('sound-win'),
            soundTimer: document.getElementById('sound-timer'),
            
            // الإشعارات
            notificationContainer: document.getElementById('notification-container'),
            
            // النوافذ المنبثقة
            modalContainer: document.getElementById('modal-container')
        };
    }
    
    /**
     * إعداد مستمعي الأحداث
     */
    setupEventListeners() {
        // التحويل بين تسجيل الدخول والتسجيل
        if (this.elements.loginTab && this.elements.registerTab) {
            this.elements.loginTab.addEventListener('click', () => {
                this.showAuthForm('login');
            });
            
            this.elements.registerTab.addEventListener('click', () => {
                this.showAuthForm('register');
            });
        }
        
        // الأزرار الرئيسية
        if (this.elements.playBtn) {
            this.elements.playBtn.addEventListener('click', () => {
                this.showScreen('categories');
                this.playSound('click');
            });
        }
        
        if (this.elements.settingsBtn) {
            this.elements.settingsBtn.addEventListener('click', () => {
                this.showSettingsModal();
            });
        }
        
        // زر الخروج
        if (this.elements.logoutBtn) {
            this.elements.logoutBtn.addEventListener('click', () => {
                if (typeof window.gameApp !== 'undefined') {
                    window.gameApp.logout();
                }
            });
        }
        
        // الإشعارات المتنقلة
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('notification-close')) {
                e.target.closest('.notification').remove();
            }
        });
        
        // اختصارات لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            // ESC للخروج من النوافذ
            if (e.key === 'Escape') {
                this.closeModal();
            }
            
            // 1-4 للإجابات أثناء اللعب
            if (this.currentScreen === 'game' && e.key >= '1' && e.key <= '4') {
                const answerIndex = parseInt(e.key) - 1;
                if (typeof window.gameApp !== 'undefined') {
                    window.gameApp.selectAnswer(answerIndex);
                }
            }
            
            // المسافة للاستمرار بعد الإجابة
            if (this.currentScreen === 'game' && e.key === ' ' && window.gameApp?.gameEngine?.currentState?.status === 'answered') {
                window.gameApp.nextQuestion();
            }
        });
    }
    
    /**
     * تطبيق تفضيلات المستخدم
     */
    applyUserPreferences() {
        const settings = this.loadSettings();
        
        this.audioEnabled = settings.audio !== false;
        this.vibrationEnabled = settings.vibration !== false;
        
        // تطبيق حجم الخط
        if (settings.fontSize) {
            document.documentElement.style.fontSize = settings.fontSize;
        }
        
        // تطبيق الثيم
        if (settings.theme) {
            this.applyTheme(settings.theme);
        }
    }
    
    /**
     * تحميل الإعدادات
     */
    loadSettings() {
        try {
            return JSON.parse(localStorage.getItem(this.config.STORAGE_KEYS.GAME_SETTINGS)) || {};
        } catch (error) {
            return {};
        }
    }
    
    /**
     * حفظ الإعدادات
     */
    saveSettings(settings) {
        try {
            localStorage.setItem(this.config.STORAGE_KEYS.GAME_SETTINGS, JSON.stringify(settings));
            return true;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * تطبيق الثيم
     */
    applyTheme(theme) {
        const root = document.documentElement;
        
        switch (theme) {
            case 'dark':
                root.style.setProperty('--bg-primary', '#1a1a2e');
                root.style.setProperty('--bg-secondary', '#16213e');
                root.style.setProperty('--text-primary', '#ffffff');
                break;
            case 'light':
                root.style.setProperty('--bg-primary', '#f5f5f5');
                root.style.setProperty('--bg-secondary', '#ffffff');
                root.style.setProperty('--text-primary', '#333333');
                break;
            case 'gold':
                root.style.setProperty('--bg-primary', '#1a1a2e');
                root.style.setProperty('--bg-secondary', '#2d2d44');
                root.style.setProperty('--text-primary', '#FFD700');
                break;
        }
    }
    
    /**
     * عرض شاشة معينة
     */
    showScreen(screenName) {
        // إخفاء جميع الشاشات
        const screens = ['loading', 'auth', 'main-menu', 'categories', 'game', 'results'];
        screens.forEach(screen => {
            const element = this.elements[`${screen}Screen`];
            if (element) {
                element.style.display = 'none';
                element.classList.remove('active');
            }
        });
        
        // إظهار الشاشة المطلوبة
        const targetScreen = this.elements[`${screenName}Screen`];
        if (targetScreen) {
            targetScreen.style.display = 'flex';
            setTimeout(() => {
                targetScreen.classList.add('active');
            }, 10);
        }
        
        this.currentScreen = screenName;
        
        // إجراءات خاصة لكل شاشة
        switch (screenName) {
            case 'main-menu':
                this.updateMainMenu();
                break;
            case 'categories':
                this.loadCategories();
                this.loadDifficultyOptions();
                break;
            case 'game':
                this.initializeGameUI();
                break;
        }
    }
    
    /**
     * عرض نموذج المصادقة
     */
    showAuthForm(formType) {
        const loginForm = this.elements.loginForm;
        const registerForm = this.elements.registerForm;
        const loginTab = this.elements.loginTab;
        const registerTab = this.elements.registerTab;
        
        if (formType === 'login') {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
        } else {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            loginTab.classList.remove('active');
            registerTab.classList.add('active');
        }
    }
    
    /**
     * تحديث القائمة الرئيسية
     */
    updateMainMenu(user = null) {
        if (!user && typeof window.gameApp !== 'undefined') {
            user = window.gameApp.authSystem.getCurrentUser();
        }
        
        if (user && this.elements.userWelcome) {
            this.elements.userWelcome.textContent = `مرحباً، ${user.username}! 👋`;
            this.elements.userBalance.textContent = `${user.balance.toLocaleString()} ${this.config.CURRENCY}`;
            this.elements.userLevel.textContent = `المستوى ${user.stats.level}`;
        }
    }
    
    /**
     * تحميل التصنيفات
     */
    loadCategories() {
        const container = this.elements.categoriesContainer;
        if (!container) return;
        
        const categories = this.config.CATEGORIES;
        let html = '';
        
        categories.forEach(category => {
            html += `
                <div class="category-card" data-category="${category.id}">
                    <div class="category-icon" style="color: ${category.color}">
                        ${category.icon}
                    </div>
                    <div class="category-info">
                        <h4>${category.name}</h4>
                        <p>${category.description}</p>
                    </div>
                    <div class="category-checkbox">
                        <input type="checkbox" id="cat-${category.id}" checked>
                        <label for="cat-${category.id}"></label>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // إضافة أحداث النقر
        container.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.type !== 'checkbox') {
                    const checkbox = card.querySelector('input[type="checkbox"]');
                    checkbox.checked = !checkbox.checked;
                    card.classList.toggle('selected', checkbox.checked);
                } else {
                    card.classList.toggle('selected', e.target.checked);
                }
                this.playSound('click');
            });
        });
    }
    
    /**
     * تحميل خيارات الصعوبة
     */
    loadDifficultyOptions() {
        const container = this.elements.difficultyContainer;
        if (!container) return;
        
        const difficulties = this.config.DIFFICULTY_LEVELS;
        let html = '';
        
        difficulties.forEach(difficulty => {
            html += `
                <div class="difficulty-option ${difficulty.id === 'medium' ? 'selected' : ''}" 
                      data-difficulty="${difficulty.id}">
                    <div class="difficulty-icon" style="color: ${difficulty.color}">
                        ${difficulty.id === 'easy' ? '😊' : difficulty.id === 'medium' ? '😐' : '😠'}
                    </div>
                    <div class="difficulty-info">
                        <h4>${difficulty.name}</h4>
                        <p>${difficulty.description}</p>
                        <div class="difficulty-details">
                            <span><i class="fas fa-clock"></i> ${difficulty.time} ثانية</span>
                            <span><i class="fas fa-life-ring"></i> ${difficulty.lifelines} أدوات</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // إضافة أحداث النقر
        container.querySelectorAll('.difficulty-option').forEach(option => {
            option.addEventListener('click', () => {
                container.querySelectorAll('.difficulty-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
                this.playSound('click');
            });
        });
    }
    
    /**
     * تهيئة واجهة اللعبة
     */
    initializeGameUI() {
        // إنشاء سلم الجوائز
        this.createPrizeLadder();
        
        // إعادة تعيين واجهة اللعبة
        this.resetGameUI();
    }
    
    /**
     * إنشاء سلم الجوائز
     */
    createPrizeLadder() {
        const ladder = this.elements.prizeLadder;
        if (!ladder) return;
        
        let html = '';
        for (let i = this.config.PRIZES.length - 1; i >= 0; i--) {
            const prize = this.config.PRIZES[i];
            const isSafeHaven = this.config.SAFE_HAVENS.includes(i + 1);
            
            html += `
                <div class="prize-level ${isSafeHaven ? 'safe-haven' : ''}" data-level="${i + 1}">
                    <div class="prize-number">${i + 1}</div>
                    <div class="prize-amount">
                        ${prize.toLocaleString()} ${this.config.CURRENCY}
                        ${isSafeHaven ? '<span class="safe-badge">ضمان</span>' : ''}
                    </div>
                </div>
            `;
        }
        
        ladder.innerHTML = html;
    }
    
    /**
     * تحديث سلم الجوائز مع التقدم
     */
    updatePrizeLadder(currentQuestion) {
        const levels = this.elements.prizeLadder?.querySelectorAll('.prize-level');
        if (!levels) return;
        
        levels.forEach(level => {
            const levelNum = parseInt(level.dataset.level);
            level.classList.remove('current', 'passed');
            
            if (levelNum === currentQuestion) {
                level.classList.add('current');
            } else if (levelNum < currentQuestion) {
                level.classList.add('passed');
            }
        });
    }
    
    /**
     * عرض السؤال
     */
    displayQuestion(questionData) {
        if (!questionData) return;
        
        // تحديث رقم السؤال
        if (this.elements.questionNumber) {
            this.elements.questionNumber.textContent = `السؤال ${questionData.questionNumber} من ${questionData.totalQuestions}`;
        }
        
        // تحديث نص السؤال
        if (this.elements.questionText) {
            this.elements.questionText.textContent = questionData.question;
        }
        
        // تحديث الجائزة الحالية
        if (this.elements.currentPrize) {
            this.elements.currentPrize.textContent = `${questionData.prize.toLocaleString()} ${this.config.CURRENCY}`;
        }
        
        // تحديث سلم الجوائز
        this.updatePrizeLadder(questionData.questionNumber);
        
        // عرض الإجابات
        this.displayAnswers(questionData.answers);
        
        // تحديث المؤقت
        if (this.elements.timerDisplay) {
            this.elements.timerDisplay.textContent = questionData.timeLeft;
            this.elements.timerDisplay.style.color = '#ffffff';
        }
    }
    
    /**
     * عرض الإجابات
     */
    displayAnswers(answers) {
        const container = this.elements.answersContainer;
        if (!container) return;
        
        const letters = ['أ', 'ب', 'ج', 'د'];
        let html = '';
        
        answers.forEach((answer, index) => {
            html += `
                <button class="answer-btn" data-answer="${index}">
                    <div class="answer-letter">${letters[index]}</div>
                    <div class="answer-text">${answer}</div>
                </button>
            `;
        });
        
        container.innerHTML = html;
        
        // إضافة أحداث النقر
        container.querySelectorAll('.answer-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const answerIndex = parseInt(btn.dataset.answer);
                if (typeof window.gameApp !== 'undefined') {
                    window.gameApp.selectAnswer(answerIndex);
                }
            });
        });
    }
    
    /**
     * تمييز الإجابات
     */
    highlightAnswers(selectedIndex, correctIndex) {
        const buttons = this.elements.answersContainer?.querySelectorAll('.answer-btn');
        if (!buttons) return;
        
        buttons.forEach((btn, index) => {
            btn.disabled = true;
            
            if (index === correctIndex) {
                btn.classList.add('correct');
            } else if (index === selectedIndex && selectedIndex !== correctIndex) {
                btn.classList.add('wrong');
            }
        });
    }
    
    /**
     * تحديث المؤقت
     */
    updateTimer(timeLeft) {
        if (!this.elements.timerDisplay) return;
        
        this.elements.timerDisplay.textContent = timeLeft;
        
        // تغيير اللون عند اقتراب انتهاء الوقت
        if (timeLeft <= 10) {
            this.elements.timerDisplay.style.color = '#e74c3c';
            
            // تشغيل صوت التنبيه
            if (timeLeft <= 5) {
                this.playSound('timer');
            }
        }
    }
    
    /**
     * تحديث أدوات المساعدة
     */
    updateLifelines(lifelines) {
        const container = this.elements.lifelinesContainer;
        if (!container) return;
        
        // يمكن توسيع هذه الوظيفة لعرض الأدوات المستخدمة والمتبقية
        console.log('الأدوات المتاحة:', lifelines);
    }
    
    /**
     * تطبيق تأثير الوميض
     */
    applyFlashEffect(type) {
        const flashOverlay = document.createElement('div');
        flashOverlay.className = `flash-overlay ${type}`;
        flashOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${type === 'correct' ? 'rgba(39, 174, 96, 0.7)' : 'rgba(231, 76, 60, 0.7)'};
            z-index: 9999;
            animation: flashEffect 1s ease-out;
            pointer-events: none;
        `;
        
        document.body.appendChild(flashOverlay);
        
        setTimeout(() => {
            flashOverlay.remove();
        }, this.config.UI.FLASH_DURATION);
        
        // إضافة الاهتزاز إذا كان مفعلاً
        if (this.vibrationEnabled && navigator.vibrate) {
            navigator.vibrate(type === 'correct' ? [100, 50, 100] : [200, 100, 200]);
        }
    }
    
    /**
     * عرض نافذة نتائج اللعبة
     */
    showGameResults(results) {
        if (!results) return;
        
        // تحديث العناصر
        if (this.elements.finalScore) {
            this.elements.finalScore.textContent = `${results.score.toLocaleString()} ${this.config.CURRENCY}`;
        }
        
        if (this.elements.correctAnswers) {
            this.elements.correctAnswers.textContent = `${results.correctAnswers}/${results.totalQuestions}`;
        }
        
        if (this.elements.totalTime) {
            this.elements.totalTime.textContent = this.formatTime(results.totalTime);
        }
        
        if (this.elements.accuracy) {
            this.elements.accuracy.textContent = `${results.accuracy}%`;
        }
        
        // عرض شاشة النتائج
        this.showScreen('results');
        
        // تشغيل الصوت المناسب
        if (results.isWin) {
            this.playSound('win');
            this.showNotification('مبروك! لقد فزت بمليون دولار! 🏆💰', 'success');
        } else {
            this.showNotification('لعبة رائعة! حاول مرة أخرى للفوز بالمليون! 💪', 'info');
        }
    }
    
    /**
     * تنسيق الوقت
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    /**
     * إعادة تعيين واجهة اللعبة
     */
    resetGameUI() {
        // إعادة تعيين الإجابات
        if (this.elements.answersContainer) {
            this.elements.answersContainer.innerHTML = '';
        }
        
        // إعادة تعيين المؤقت
        if (this.elements.timerDisplay) {
            this.elements.timerDisplay.textContent = '0';
            this.elements.timerDisplay.style.color = '#ffffff';
        }
        
        // إعادة تعيين سلم الجوائز
        this.updatePrizeLadder(1);
    }
    
    /**
     * عرض إشعار
     */
    showNotification(message, type = 'info', duration = 5000) {
        const container = this.elements.notificationContainer;
        if (!container) return;
        
        const notificationId = 'notif_' + Date.now();
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            gold: '💰'
        };
        
        const notification = document.createElement('div');
        notification.id = notificationId;
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-icon">${icons[type] || icons.info}</div>
            <div class="notification-message">${message}</div>
            <button class="notification-close">&times;</button>
        `;
        
        container.appendChild(notification);
        
        // إضافة حدث الإغلاق
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        // الإزالة التلقائية
        setTimeout(() => {
            const elem = document.getElementById(notificationId);
            if (elem) {
                elem.style.opacity = '0';
                setTimeout(() => elem.remove(), 300);
            }
        }, duration);
    }
    
    /**
     * عرض نافذة منبثقة
     */
    showModal(title, content, options = {}) {
        const modalId = 'modal_' + Date.now();
        const sizeClass = options.size || 'medium';
        const closeOnOverlay = options.closeOnOverlay !== false;
        
        const modalHTML = `
            <div class="modal-overlay" id="${modalId}">
                <div class="modal ${sizeClass}">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">${content}</div>
                    ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
                </div>
            </div>
        `;
        
        const container = this.elements.modalContainer || document.body;
        container.insertAdjacentHTML('beforeend', modalHTML);
        
        const modal = document.getElementById(modalId);
        
        // إضافة حدث الإغلاق
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            this.closeModal(modalId);
        });
        
        // إغلاق بالنقر خارج النافذة
        if (closeOnOverlay) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modalId);
                }
            });
        }
        
        // إضافة للنظام
        this.modalStack.push(modalId);
        
        // تشغيل الصوت
        this.playSound('click');
        
        return modalId;
    }
    
    /**
     * إغلاق النافذة المنبثقة
     */
    closeModal(modalId = null) {
        if (!modalId && this.modalStack.length > 0) {
            modalId = this.modalStack.pop();
        }
        
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('closing');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
        
        this.playSound('click');
    }
    
    /**
     * عرض نافذة الإعدادات
     */
    showSettingsModal() {
        const settings = this.loadSettings();
        
        const content = `
            <div class="settings-section">
                <h4><i class="fas fa-volume-up"></i> الصوت</h4>
                <div class="setting-item">
                    <label class="switch">
                        <input type="checkbox" id="audio-toggle" ${this.audioEnabled ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                    <span>تشغيل الأصوات</span>
                </div>
                
                <div class="setting-item">
                    <label class="switch">
                        <input type="checkbox" id="music-toggle" ${settings.music !== false ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                    <span>الموسيقى الخلفية</span>
                </div>
            </div>
            
            <div class="settings-section">
                <h4><i class="fas fa-palette"></i> المظهر</h4>
                <div class="theme-selector">
                    <button class="theme-option ${settings.theme === 'dark' || !settings.theme ? 'active' : ''}" data-theme="dark">
                        <div class="theme-preview dark"></div>
                        <span>داكن</span>
                    </button>
                    <button class="theme-option ${settings.theme === 'light' ? 'active' : ''}" data-theme="light">
                        <div class="theme-preview light"></div>
                        <span>فاتح</span>
                    </button>
                    <button class="theme-option ${settings.theme === 'gold' ? 'active' : ''}" data-theme="gold">
                        <div class="theme-preview gold"></div>
                        <span>ذهبي</span>
                    </button>
                </div>
            </div>
            
            <div class="settings-section">
                <h4><i class="fas fa-font"></i> الخط</h4>
                <div class="font-size-selector">
                    <button class="font-size-btn" data-size="small">أ</button>
                    <button class="font-size-btn active" data-size="medium">أ</button>
                    <button class="font-size-btn" data-size="large">أ</button>
                </div>
            </div>
            
            <div class="settings-section">
                <h4><i class="fas fa-gamepad"></i> اللعب</h4>
                <div class="setting-item">
                    <label class="switch">
                        <input type="checkbox" id="vibration-toggle" ${this.vibrationEnabled ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                    <span>الاهتزاز</span>
                </div>
                
                <div class="setting-item">
                    <label class="switch">
                        <input type="checkbox" id="notifications-toggle" ${settings.notifications !== false ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                    <span>الإشعارات</span>
                </div>
            </div>
        `;
        
        const footer = `
            <button class="btn btn-primary" id="save-settings">حفظ</button>
            <button class="btn btn-secondary" id="reset-settings">إعادة تعيين</button>
        `;
        
        const modalId = this.showModal('الإعدادات ⚙️', content, { footer: footer, size: 'large' });
        
        // إضافة الأحداث بعد ظهور النافذة
        setTimeout(() => {
            // حفظ الإعدادات
            document.getElementById('save-settings').addEventListener('click', () => {
                this.saveCurrentSettings();
                this.closeModal(modalId);
                this.showNotification('تم حفظ الإعدادات بنجاح! ✅', 'success');
            });
            
            // إعادة تعيين الإعدادات
            document.getElementById('reset-settings').addEventListener('click', () => {
                if (confirm('هل تريد إعادة تعيين جميع الإعدادات؟')) {
                    this.resetSettings();
                    this.closeModal(modalId);
                    this.showNotification('تمت إعادة تعيين الإعدادات! 🔄', 'info');
                }
            });
            
            // تغيير الثيم
            document.querySelectorAll('.theme-option').forEach(option => {
                option.addEventListener('click', () => {
                    document.querySelectorAll('.theme-option').forEach(opt => {
                        opt.classList.remove('active');
                    });
                    option.classList.add('active');
                    
                    const theme = option.dataset.theme;
                    this.applyTheme(theme);
                    settings.theme = theme;
                });
            });
            
            // تغيير حجم الخط
            document.querySelectorAll('.font-size-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.font-size-btn').forEach(b => {
                        b.classList.remove('active');
                    });
                    btn.classList.add('active');
                    
                    const size = btn.dataset.size;
                    const sizes = { small: '14px', medium: '16px', large: '18px' };
                    document.documentElement.style.fontSize = sizes[size];
                    settings.fontSize = sizes[size];
                });
            });
        }, 100);
    }
    
    /**
     * حفظ الإعدادات الحالية
     */
    saveCurrentSettings() {
        const settings = {
            audio: document.getElementById('audio-toggle')?.checked || false,
            music: document.getElementById('music-toggle')?.checked || false,
            vibration: document.getElementById('vibration-toggle')?.checked || false,
            notifications: document.getElementById('notifications-toggle')?.checked || false,
            theme: document.querySelector('.theme-option.active')?.dataset.theme || 'dark',
            fontSize: document.documentElement.style.fontSize || '16px'
        };
        
        this.audioEnabled = settings.audio;
        this.vibrationEnabled = settings.vibration;
        
        this.saveSettings(settings);
        this.applyUserPreferences();
    }
    
    /**
     * إعادة تعيين الإعدادات
     */
    resetSettings() {
        const defaultSettings = {
            audio: true,
            music: true,
            vibration: true,
            notifications: true,
            theme: 'dark',
            fontSize: '16px'
        };
        
        this.saveSettings(defaultSettings);
        this.applyUserPreferences();
        
        // إعادة تحميل الصفحة لتطبيق جميع التغييرات
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
    
    /**
     * تشغيل صوت
     */
    playSound(soundType) {
        if (!this.audioEnabled) return;
        
        const soundMap = {
            click: this.elements.soundClick,
            correct: this.elements.soundCorrect,
            wrong: this.elements.soundWrong,
            win: this.elements.soundWin,
            timer: this.elements.soundTimer
        };
        
        const sound = soundMap[soundType];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log('خطأ في تشغيل الصوت:', e));
        }
    }
    
    /**
     * عرض نافذة تأكيد
     */
    showConfirmation(message, onConfirm, onCancel = null) {
        const content = `
            <div class="confirmation-dialog">
                <p>${message}</p>
            </div>
        `;
        
        const footer = `
            <button class="btn btn-secondary" id="confirm-cancel">إلغاء</button>
            <button class="btn btn-primary" id="confirm-ok">موافق</button>
        `;
        
        const modalId = this.showModal('تأكيد ❓', content, { footer: footer });
        
        setTimeout(() => {
            document.getElementById('confirm-ok').addEventListener('click', () => {
                this.closeModal(modalId);
                if (onConfirm) onConfirm();
            });
            
            document.getElementById('confirm-cancel').addEventListener('click', () => {
                this.closeModal(modalId);
                if (onCancel) onCancel();
            });
        }, 100);
    }
    
    /**
     * تحميل لوحة المتصدرين
     */
    loadLeaderboard(limit = 10) {
        try {
            const highScores = JSON.parse(localStorage.getItem(this.config.STORAGE_KEYS.HIGH_SCORES) || '[]');
            const topScores = highScores.slice(0, limit);
            
            let html = '<div class="leaderboard-table">';
            html += '<div class="leaderboard-header">';
            html += '<div>المركز</div><div>اللاعب</div><div>النقاط</div><div>التاريخ</div>';
            html += '</div>';
            
            topScores.forEach((score, index) => {
                const date = new Date(score.date);
                const dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                
                html += `
                    <div class="leaderboard-row ${index < 3 ? 'top-three' : ''}">
                        <div class="rank">${index + 1}</div>
                        <div class="player">${score.username}</div>
                        <div class="score">${score.score.toLocaleString()} ${this.config.CURRENCY}</div>
                        <div class="date">${dateStr}</div>
                    </div>
                `;
            });
            
            html += '</div>';
            
            return html;
        } catch (error) {
            return '<p>لا توجد نتائج بعد!</p>';
        }
    }
    
    /**
     * عرض نافذة لوحة المتصدرين
     */
    showLeaderboardModal() {
        const content = this.loadLeaderboard(20);
        this.showModal('🏆 لوحة المتصدرين', content, { size: 'large' });
    }
    
    /**
     * تحميل شاشة تحميل مع رسالة
     */
    showLoading(message = 'جاري التحميل...') {
        const content = `
            <div class="loading-modal">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                </div>
                <p>${message}</p>
            </div>
        `;
        
        this.showModal('', content, { closeOnOverlay: false });
    }
    
    /**
     * إخفاء شاشة التحميل
     */
    hideLoading() {
        this.closeModal();
    }
}

// التصدير للاستخدام
if (typeof window !== 'undefined') {
    window.UIManager = UIManager;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}
