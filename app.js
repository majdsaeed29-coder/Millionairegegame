/**
 * التطبيق الرئيسي - ميليونير الذهبية
 * يربط جميع المكونات معاً
 */

class MillionaireApp {
    constructor() {
        this.config = GameConfig;
        this.authSystem = new AuthSystem();
        this.questionManager = new QuestionManager();
        this.gameEngine = new GameEngine();
        this.uiManager = new UIManager();
        this.isInitialized = false;
        
        this.init();
    }
    
    /**
     * تهيئة التطبيق
     */
    async init() {
        console.log('🚀 تطبيق ميليونير الذهبية يبدأ التشغيل...');
        
        try {
            // ربط المكونات معاً
            this.setupComponentConnections();
            
            // التحقق من تسجيل الدخول التلقائي
            if (this.authSystem.isLoggedIn()) {
                await this.handleSuccessfulLogin(this.authSystem.getCurrentUser());
            }
            
            this.isInitialized = true;
            console.log('✅ التطبيق جاهز للاستخدام!');
            
        } catch (error) {
            console.error('❌ خطأ في تهيئة التطبيق:', error);
            this.uiManager.showNotification('خطأ في تحميل التطبيق! يرجى تحديث الصفحة.', 'error');
        }
    }
    
    /**
     * ربط المكونات معاً
     */
    setupComponentConnections() {
        // ربط مدير الواجهة مع محرك اللعبة
        this.gameEngine.onTimerUpdate = (timeLeft) => {
            this.uiManager.updateTimer(timeLeft);
        };
        
        this.gameEngine.onTimeWarning = (timeLeft) => {
            const timerBox = document.querySelector('.timer-box');
            if (timerBox) {
                timerBox.classList.add('warning');
            }
        };
        
        this.gameEngine.onTimeUp = () => {
            this.uiManager.showNotification('انتهى الوقت! ⏰', 'error');
        };
        
        this.gameEngine.onSafeHaven = (score) => {
            this.uiManager.showNotification(`🎉 مبروك! وصلت للضمان: ${score.toLocaleString()} ${this.config.CURRENCY}`, 'success');
        };
        
        this.gameEngine.onLevelUp = (level) => {
            this.uiManager.showNotification(`⭐ مبروك! ارتفع مستواك إلى ${level}`, 'gold');
        };
        
        this.gameEngine.onFlashEffect = (type) => {
            this.uiManager.applyFlashEffect(type);
            this.uiManager.playSound(type === 'correct' ? 'correct' : 'wrong');
        };
        
        // إعداد أحداث المصادقة
        this.setupAuthEvents();
        
        // إعداد أحداث اللعبة
        this.setupGameEvents();
    }
    
    /**
     * إعداد أحداث المصادقة
     */
    setupAuthEvents() {
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        if (registerBtn) {
            registerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }
        
        // السماح بتسجيل الدخول بالضغط على Enter
        const passwordInput = document.getElementById('password-input');
        if (passwordInput) {
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    if (this.uiManager.currentScreen === 'auth') {
                        const activeForm = document.querySelector('.auth-form.active');
                        if (activeForm.id === 'login-form') {
                            this.handleLogin();
                        } else {
                            this.handleRegister();
                        }
                    }
                }
            });
        }
    }
    
    /**
     * معالجة تسجيل الدخول
     */
    async handleLogin() {
        const username = document.getElementById('username-input')?.value.trim();
        const password = document.getElementById('password-input')?.value;
        
        if (!username || !password) {
            this.uiManager.showNotification('يرجى ملء جميع الحقول!', 'error');
            return;
        }
        
        this.uiManager.showLoading('جاري تسجيل الدخول...');
        
        try {
            const result = this.authSystem.login(username, password);
            
            if (result.success) {
                await this.handleSuccessfulLogin(result.user);
            } else {
                this.uiManager.showNotification(result.message, 'error');
            }
        } catch (error) {
            this.uiManager.showNotification('حدث خطأ أثناء تسجيل الدخول!', 'error');
            console.error('خطأ تسجيل الدخول:', error);
        } finally {
            this.uiManager.hideLoading();
        }
    }
    
    /**
     * معالجة التسجيل
     */
    async handleRegister() {
        const username = document.getElementById('username-input')?.value.trim();
        const password = document.getElementById('password-input')?.value;
        const email = document.getElementById('email-input')?.value.trim();
        
        if (!username || !password) {
            this.uiManager.showNotification('يرجى ملء الحقول المطلوبة!', 'error');
            return;
        }
        
        this.uiManager.showLoading('جاري إنشاء الحساب...');
        
        try {
            const result = this.authSystem.register(username, password, email);
            
            if (result.success) {
                await this.handleSuccessfulLogin(result.user);
            } else {
                this.uiManager.showNotification(result.message, 'error');
            }
        } catch (error) {
            this.uiManager.showNotification('حدث خطأ أثناء إنشاء الحساب!', 'error');
            console.error('خطأ التسجيل:', error);
        } finally {
            this.uiManager.hideLoading();
        }
    }
    
    /**
     * معالجة تسجيل الدخول الناجح
     */
    async handleSuccessfulLogin(user) {
        this.uiManager.showNotification(`مرحباً بك ${user.username}! 👋`, 'success');
        this.uiManager.updateMainMenu(user);
        this.uiManager.showScreen('main-menu');
        
        // تحديث بيانات المستخدم في محرك اللعبة
        this.gameEngine.authSystem = this.authSystem;
    }
    
    /**
     * تسجيل الخروج
     */
    logout() {
        this.uiManager.showConfirmation(
            'هل أنت متأكد من تسجيل الخروج؟',
            () => {
                this.authSystem.logout();
                this.uiManager.showScreen('auth');
                this.uiManager.showNotification('تم تسجيل الخروج بنجاح!', 'info');
            }
        );
    }
    
    /**
     * إعداد أحداث اللعبة
     */
    setupGameEvents() {
        // زر بدء اللعبة
        const startGameBtn = document.getElementById('start-game-btn');
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => {
                this.startNewGame();
            });
        }
        
        // زر العودة للقائمة
        const backBtns = document.querySelectorAll('[data-action="back-to-menu"]');
        backBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.uiManager.showScreen('main-menu');
            });
        });
        
        // زر تشغيل مجدداً
        const playAgainBtn = document.getElementById('play-again-btn');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                this.uiManager.showScreen('categories');
            });
        }
        
        // زر مشاركة النتائج
        const shareBtn = document.getElementById('share-results-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.shareResults();
            });
        }
        
        // زر الخروج من اللعبة
        const quitBtn = document.getElementById('quit-game-btn');
        if (quitBtn) {
            quitBtn.addEventListener('click', () => {
                this.quitGame();
            });
        }
        
        // زر لوحة المتصدرين
        const leaderboardBtn = document.getElementById('leaderboard-btn');
        if (leaderboardBtn) {
            leaderboardBtn.addEventListener('click', () => {
                this.showLeaderboard();
            });
        }
    }
    
    /**
     * بدء لعبة جديدة
     */
    async startNewGame() {
        try {
            // جمع إعدادات اللعبة
            const selectedCategories = [];
            document.querySelectorAll('.category-card input[type="checkbox"]:checked').forEach(cb => {
                selectedCategories.push(cb.id.replace('cat-', ''));
            });
            
            if (selectedCategories.length === 0) {
                this.uiManager.showNotification('يرجى اختيار تصنيف واحد على الأقل!', 'warning');
                return;
            }
            
            const selectedDifficulty = document.querySelector('.difficulty-option.selected')?.dataset.difficulty || 'medium';
            const timerEnabled = document.getElementById('timer-toggle')?.checked || false;
            
            // إعدادات اللعبة
            const gameOptions = {
                categories: selectedCategories,
                difficulty: selectedDifficulty,
                timerEnabled: timerEnabled
            };
            
            this.uiManager.showLoading('جاري تحضير الأسئلة...');
            
            // بدء اللعبة
            const result = this.gameEngine.startNewGame(gameOptions);
            
            if (result.success) {
                // الانتقال لشاشة اللعبة
                this.uiManager.showScreen('game');
                
                // عرض السؤال الأول
                this.displayQuestion(result.firstQuestion);
                
                this.uiManager.showNotification('بدأت اللعبة! حظاً موفقاً! 🍀', 'success');
            } else {
                this.uiManager.showNotification(result.message || 'خطأ في بدء اللعبة!', 'error');
            }
        } catch (error) {
            console.error('خطأ في بدء اللعبة:', error);
            this.uiManager.showNotification('حدث خطأ في بدء اللعبة!', 'error');
        } finally {
            this.uiManager.hideLoading();
        }
    }
    
    /**
     * عرض سؤال
     */
    displayQuestion(questionData) {
        if (!questionData) return;
        
        this.uiManager.displayQuestion(questionData);
        
        // تحديث واجهة اللعبة
        this.updateGameUI();
    }
    
    /**
     * اختيار إجابة
     */
    async selectAnswer(answerIndex) {
        try {
            const result = this.gameEngine.selectAnswer(answerIndex);
            
            if (result.success) {
                // تمييز الإجابات
                this.uiManager.highlightAnswers(answerIndex, result.correctAnswer);
                
                // إظهار التفسير بعد فترة
                setTimeout(() => {
                    if (result.explanation) {
                        this.uiManager.showNotification(result.explanation, 'info');
                    }
                }, 1000);
                
                // تحديث واجهة اللعبة
                this.updateGameUI();
                
                // إذا كانت الإجابة صحيحة، تمكين زر التالي
                if (result.isCorrect) {
                    this.enableNextButton();
                } else {
                    // إذا كانت خاطئة، الانتقال للنتائج بعد فترة
                    setTimeout(() => {
                        this.finishGame(false);
                    }, 3000);
                }
            }
        } catch (error) {
            console.error('خطأ في اختيار الإجابة:', error);
        }
    }
    
    /**
     * الانتقال للسؤال التالي
     */
    async nextQuestion() {
        try {
            const result = this.gameEngine.nextQuestion();
            
            if (result.success) {
                this.displayQuestion(result.question);
                this.disableNextButton();
            } else {
                // إذا لم يكن هناك سؤال تالي، إنهاء اللعبة
                this.finishGame(true);
            }
        } catch (error) {
            console.error('خطأ في الانتقال للسؤال التالي:', error);
        }
    }
    
    /**
     * استخدام أداة مساعدة
     */
    async useLifeline(lifelineId) {
        try {
            if (lifelineId === 'SKIP_AD') {
                this.uiManager.showConfirmation(
                    'هل تريد مشاهدة إعلان لتخطي هذا السؤال؟',
                    async () => {
                        this.uiManager.showLoading('جاري تشغيل الإعلان...');
                        
                        const result = await this.gameEngine.skipWithAd();
                        
                        if (result.success) {
                            this.uiManager.showNotification('تم تخطي السؤال بنجاح!', 'success');
                            this.displayQuestion(result.nextQuestion);
                        } else {
                            this.uiManager.showNotification('فشل في تخطي السؤال!', 'error');
                        }
                        
                        this.uiManager.hideLoading();
                    }
                );
            } else {
                const result = this.gameEngine.useLifeline(lifelineId);
                
                if (result.success) {
                    this.applyLifelineEffect(lifelineId, result);
                    this.updateGameUI();
                } else {
                    this.uiManager.showNotification(result.message, 'warning');
                }
            }
        } catch (error) {
            console.error('خطأ في استخدام أداة المساعدة:', error);
            this.uiManager.showNotification('حدث خطأ!', 'error');
        }
    }
    
    /**
     * تطبيق تأثير أداة المساعدة
     */
    applyLifelineEffect(lifelineId, result) {
        switch (lifelineId) {
            case '50_50':
                this.applyFiftyFiftyEffect(result.removedAnswers);
                break;
            case 'PHONE_FRIEND':
                this.applyPhoneFriendEffect(result);
                break;
            case 'AUDIENCE':
                this.applyAudienceEffect(result.percentages);
                break;
        }
    }
    
    /**
     * تطبيق تأثير 50:50
     */
    applyFiftyFiftyEffect(removedAnswers) {
        const answerBtns = document.querySelectorAll('.answer-btn');
        removedAnswers.forEach(index => {
            if (answerBtns[index]) {
                answerBtns[index].style.opacity = '0.3';
                answerBtns[index].style.pointerEvents = 'none';
            }
        });
    }
    
    /**
     * تطبيق تأثير اتصال بصديق
     */
    applyPhoneFriendEffect(result) {
        const letters = ['أ', 'ب', 'ج', 'د'];
        const message = `
            📞 صديقك يقول: 
            "أعتقد أن الإجابة هي ${letters[result.suggestedAnswer]}"
            (${result.confidence})
        `;
        
        this.uiManager.showNotification(message, 'info', 8000);
    }
    
    /**
     * تطبيق تأثير تصويت الجمهور
     */
    applyAudienceEffect(percentages) {
        const modalContent = `
            <div class="audience-poll">
                <h4>📊 تصويت الجمهور</h4>
                ${percentages.map((percent, index) => `
                    <div class="poll-item">
                        <div class="poll-letter">${['أ', 'ب', 'ج', 'د'][index]}</div>
                        <div class="poll-bar">
                            <div class="poll-fill" style="width: ${percent}%"></div>
                        </div>
                        <div class="poll-percent">${Math.round(percent)}%</div>
                    </div>
                `).join('')}
                <p class="poll-note">هذه النتائج افتراضية تعتمد على إحصائيات سابقة</p>
            </div>
        `;
        
        this.uiManager.showModal('تصويت الجمهور 👥', modalContent);
    }
    
    /**
     * إنهاء اللعبة
     */
    async finishGame(isWin) {
        try {
            const result = this.gameEngine.finishGame();
            
            if (result.success) {
                // عرض النتائج
                this.uiManager.showGameResults(result.gameResult);
                
                // تحديث القائمة الرئيسية
                const user = this.authSystem.getCurrentUser();
                if (user) {
                    this.uiManager.updateMainMenu(user);
                }
            }
        } catch (error) {
            console.error('خطأ في إنهاء اللعبة:', error);
            this.uiManager.showNotification('حدث خطأ في إنهاء اللعبة!', 'error');
        }
    }
    
    /**
     * الخروج من اللعبة
     */
    quitGame() {
        this.uiManager.showConfirmation(
            'هل تريد الخروج من اللعبة؟ ستخسر المبلغ الحالي.',
            () => {
                const result = this.gameEngine.quitGame();
                
                if (result.success) {
                    this.uiManager.showGameResults(result.gameResult);
                    this.uiManager.showNotification('تم الخروج من اللعبة!', 'info');
                }
            }
        );
    }
    
    /**
     * تحديث واجهة اللعبة
     */
    updateGameUI() {
        const gameState = this.gameEngine.getGameState();
        
        // تحديث النتيجة
        const scoreElement = document.querySelector('.score-box .stat-value');
        if (scoreElement) {
            scoreElement.textContent = gameState.score.toLocaleString();
        }
        
        // تحديث عدد الإجابات الصحيحة
        const correctElement = document.querySelector('.correct-box .stat-value');
        if (correctElement) {
            correctElement.textContent = gameState.correctAnswers;
        }
        
        // تحديث الأدوات المتبقية
        const lifelines = this.gameEngine.getAvailableLifelines();
        this.uiManager.updateLifelines(lifelines);
    }
    
    /**
     * تمكين زر التالي
     */
    enableNextButton() {
        const nextBtn = document.querySelector('.next-btn');
        if (nextBtn) {
            nextBtn.disabled = false;
            nextBtn.classList.add('pulse');
        }
    }
    
    /**
     * تعطيل زر التالي
     */
    disableNextButton() {
        const nextBtn = document.querySelector('.next-btn');
        if (nextBtn) {
            nextBtn.disabled = true;
            nextBtn.classList.remove('pulse');
        }
    }
    
    /**
     * مشاركة النتائج
     */
    async shareResults() {
        try {
            const gameResult = this.gameEngine.currentState?.gameResult;
            const user = this.authSystem.getCurrentUser();
            
            if (!gameResult || !user) {
                this.uiManager.showNotification('لا توجد نتائج للمشاركة!', 'warning');
                return;
            }
            
            const shareText = `
🏆 ميليونير الذهبية 🏆

🎮 اللاعب: ${user.username}
💰 النتيجة: ${gameResult.score.toLocaleString()} ${this.config.CURRENCY}
✅ الإجابات الصحيحة: ${gameResult.correctAnswers}/${gameResult.totalQuestions}
🎯 الدقة: ${gameResult.accuracy}%
⏱️ الوقت: ${this.uiManager.formatTime(gameResult.totalTime)}
⭐ المستوى: ${gameResult.level}

تحدى نفسك على: ${window.location.href}
            `.trim();
            
            if (navigator.share) {
                await navigator.share({
                    title: 'نتيجتي في ميليونير الذهبية',
                    text: shareText,
                    url: window.location.href
                });
                
                this.uiManager.showNotification('تم مشاركة النتيجة بنجاح!', 'success');
            } else {
                // نسخ للحافظة
                await navigator.clipboard.writeText(shareText);
                this.uiManager.showNotification('تم نسخ النتيجة للحافظة! 📋', 'success');
            }
        } catch (error) {
            console.error('خطأ في المشاركة:', error);
            
            // طريقة بديلة
            const textArea = document.createElement('textarea');
            textArea.value = shareText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            this.uiManager.showNotification('تم نسخ النتيجة للحافظة! 📋', 'success');
        }
    }
    
    /**
     * عرض لوحة المتصدرين
     */
    showLeaderboard() {
        const leaderboardHTML = this.uiManager.loadLeaderboard();
        this.uiManager.showModal('🏆 لوحة المتصدرين', leaderboardHTML, { size: 'large' });
    }
    
    /**
     * عرض الإعدادات
     */
    showSettings() {
        this.uiManager.showSettingsModal();
    }
    
    /**
     * الحصول على حالة التطبيق
     */
    getAppStatus() {
        return {
            initialized: this.isInitialized,
            userLoggedIn: this.authSystem.isLoggedIn(),
            gameActive: this.gameEngine.isGameActive,
            currentScreen: this.uiManager.currentScreen,
            audioEnabled: this.uiManager.audioEnabled
        };
    }
}

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // تهيئة التطبيق
    window.gameApp = new MillionaireApp();
    
    // جعل التطبيق متاحاً عالمياً
    window.MillionaireApp = MillionaireApp;
    
    // تسجيل Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('✅ Service Worker مسجل بنجاح:', registration.scope);
            })
            .catch(error => {
                console.log('❌ فشل تسجيل Service Worker:', error);
            });
    }
    
    // إضافة حدث عند إغلاق الصفحة
    window.addEventListener('beforeunload', (e) => {
        if (window.gameApp?.gameEngine?.isGameActive) {
            e.preventDefault();
            e.returnValue = 'لديك لعبة نشطة! هل تريد الخروج؟';
            return 'لديك لعبة نشطة! هل تريد الخروج؟';
        }
    });
});

// التصدير للاستخدام في الوحدات
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MillionaireApp;
}
