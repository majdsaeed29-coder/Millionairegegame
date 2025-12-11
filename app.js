/**
 * التطبيق الرئيسي - ميليونير الذهبية
 * يربط جميع المكونات معاً
 */

class MillionaireApp {
    constructor() {
        this.config = GameConfig;
        this.isInitialized = false;
        
        // تهيئة المكونات بعد تحميل الصفحة
        this.init();
    }
    
    /**
     * تهيئة التطبيق
     */
    async init() {
        console.log('🚀 تطبيق ميليونير الذهبية يبدأ التشغيل...');
        
        try {
            // الانتظار حتى تحميل DOM
            if (document.readyState !== 'loading') {
                await this.initializeComponents();
            } else {
                document.addEventListener('DOMContentLoaded', () => {
                    this.initializeComponents();
                });
            }
            
        } catch (error) {
            console.error('❌ خطأ في تهيئة التطبيق:', error);
            this.showErrorScreen();
        }
    }
    
    /**
     * تهيئة جميع المكونات
     */
    async initializeComponents() {
        try {
            // 1. أولاً: تحميل الأنظمة
            this.authSystem = new AuthSystem();
            this.questionManager = new QuestionManager();
            this.gameEngine = new GameEngine();
            this.uiManager = new UIManager();
            
            // 2. ربط المكونات معاً
            this.setupComponentConnections();
            
            // 3. التحقق من تسجيل الدخول التلقائي
            if (this.authSystem.isLoggedIn()) {
                await this.handleSuccessfulLogin(this.authSystem.getCurrentUser());
            } else {
                // الانتقال لشاشة المصادقة بعد 2 ثانية
                setTimeout(() => {
                    this.uiManager.showScreen('auth');
                }, 2000);
            }
            
            this.isInitialized = true;
            console.log('✅ التطبيق جاهز للاستخدام!');
            
        } catch (error) {
            console.error('❌ خطأ في تحميل المكونات:', error);
            this.showErrorScreen();
        }
    }
    
    /**
     * ربط المكونات معاً
     */
    setupComponentConnections() {
        // ربط محرك اللعبة مع مدير الواجهة
        if (this.gameEngine && this.uiManager) {
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
        }
        
        // إعداد أحداث المصادقة
        this.setupAuthEvents();
        
        // إعداد أحداث اللعبة
        this.setupGameEvents();
    }
    
    /**
     * إعداد أحداث المصادقة
     */
    setupAuthEvents() {
        // زر تسجيل الدخول
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        // زر التسجيل
        const registerBtn = document.getElementById('register-btn');
        if (registerBtn) {
            registerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }
        
        // التبويبات
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        
        if (loginTab && registerTab) {
            loginTab.addEventListener('click', () => {
                this.uiManager.showAuthForm('login');
            });
            
            registerTab.addEventListener('click', () => {
                this.uiManager.showAuthForm('register');
            });
        }
        
        // Enter لتسجيل الدخول
        const passwordInput = document.getElementById('password-input');
        if (passwordInput) {
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    if (this.uiManager.currentScreen === 'auth') {
                        const activeForm = document.querySelector('.auth-form.active');
                        if (activeForm && activeForm.id === 'login-form') {
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
        const username = document.getElementById('register-username')?.value.trim() || 
                         document.getElementById('username-input')?.value.trim();
        const password = document.getElementById('register-password')?.value || 
                         document.getElementById('password-input')?.value;
        const email = document.getElementById('register-email')?.value.trim();
        
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
        if (this.gameEngine) {
            this.gameEngine.authSystem = this.authSystem;
        }
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
        
        // زر كيفية اللعب
        const howToPlayBtn = document.getElementById('how-to-play-btn');
        if (howToPlayBtn) {
            howToPlayBtn.addEventListener('click', () => {
                this.showHowToPlay();
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
                this.uiManager.displayQuestion(result.firstQuestion);
                
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
     * إظهار كيفية اللعب
     */
    showHowToPlay() {
        const content = `
            <div class="instructions">
                <h3>🎮 كيفية اللعب</h3>
                <ol>
                    <li>اختر اسمك وصورتك الرمزية</li>
                    <li>اختر التصنيفات التي تريد الأسئلة منها</li>
                    <li>اختر مستوى الصعوبة (سهل، متوسط، صعب)</li>
                    <li>أجب على 15 سؤالاً للوصول للمليون دولار</li>
                    <li>استخدم أدوات المساعدة عندما تحتاجها</li>
                    <li>أجب بسرعة قبل انتهاء الوقت</li>
                </ol>
                
                <h4>🎯 قواعد اللعبة</h4>
                <ul>
                    <li>لكل سؤال 4 إجابات، واحدة فقط صحيحة</li>
                    <li>الأسئلة 5 و 10 هي أسئلة ضمان (لا تخسر فيها)</li>
                    <li>يمكنك استخدام أدوات المساعدة حسب مستوى الصعوبة</li>
                    <li>إذا أجبت خطأ، تنتهي اللعبة وتحتفظ بآخر ضمان</li>
                    <li>إذا أجبت على جميع الأسئلة، تربح مليون دولار!</li>
                </ul>
                
                <h4>🛠️ أدوات المساعدة</h4>
                <ul>
                    <li><strong>50:50</strong> - يحذف إجابتين خاطئتين</li>
                    <li><strong>اتصال بصديق</strong> - استشارة خبير</li>
                    <li><strong>تصويت الجمهور</strong> - رأي المشاهدين</li>
                    <li><strong>تخطي السؤال</strong> - مشاهدة إعلان للتخطي</li>
                </ul>
            </div>
        `;
        
        this.uiManager.showModal('كيفية اللعب 🎮', content, { size: 'large' });
    }
    
    /**
     * الخروج من اللعبة
     */
    quitGame() {
        this.uiManager.showConfirmation(
            'هل تريد الخروج من اللعبة؟ ستخسر المبلغ الحالي.',
            () => {
                if (this.gameEngine) {
                    const result = this.gameEngine.quitGame();
                    
                    if (result.success) {
                        this.uiManager.showGameResults(result.gameResult);
                        this.uiManager.showNotification('تم الخروج من اللعبة!', 'info');
                    }
                }
            }
        );
    }
    
    /**
     * مشاركة النتائج
     */
    async shareResults() {
        try {
            if (!this.gameEngine || !this.authSystem) {
                this.uiManager.showNotification('لا توجد نتائج للمشاركة!', 'warning');
                return;
            }
            
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
            this.uiManager.showNotification('فشلت المشاركة!', 'error');
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
     * عرض شاشة الخطأ
     */
    showErrorScreen() {
        // إخفاء شاشة التحميل
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        // عرض رسالة خطأ
        const errorHTML = `
            <div style="text-align: center; padding: 50px; color: white;">
                <h1 style="color: #e74c3c;">❌ خطأ في التحميل</h1>
                <p>حدث خطأ في تحميل اللعبة. يرجى:</p>
                <ol style="text-align: right; margin: 20px auto; max-width: 400px;">
                    <li>تحديث الصفحة (F5)</li>
                    <li>التأكد من اتصال الإنترنت</li>
                    <li>محاولة الدخول لاحقاً</li>
                </ol>
                <button onclick="window.location.reload()" style="
                    background: var(--gold-primary);
                    color: black;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 25px;
                    font-size: 18px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-top: 20px;
                ">
                    🔄 تحديث الصفحة
                </button>
            </div>
        `;
        
        const appContainer = document.getElementById('app-container');
        if (appContainer) {
            appContainer.innerHTML = errorHTML;
        }
    }
    
    /**
     * الحصول على حالة التطبيق
     */
    getAppStatus() {
        return {
            initialized: this.isInitialized,
            userLoggedIn: this.authSystem ? this.authSystem.isLoggedIn() : false,
            gameActive: this.gameEngine ? this.gameEngine.isGameActive : false,
            currentScreen: this.uiManager ? this.uiManager.currentScreen : 'loading'
        };
    }
}

// ===== تهيئة التطبيق بعد تحميل الصفحة =====
document.addEventListener('DOMContentLoaded', () => {
    // إزالة فئة preload بعد التحميل
    document.body.classList.remove('preload');
    
    // إنشاء التطبيق
    window.gameApp = new MillionaireApp();
    
    // جعل التطبيق متاحاً عالمياً
    window.MillionaireApp = MillionaireApp;
    
    // ===== إضافة زر تخطي التحميل يدوياً =====
    const skipLoadingBtn = document.createElement('button');
    skipLoadingBtn.id = 'manual-skip-loading';
    skipLoadingBtn.innerHTML = '⏩ تخطي التحميل';
    skipLoadingBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: #e74c3c;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 20px;
        font-family: inherit;
        font-weight: bold;
        cursor: pointer;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        transition: all 0.3s;
    `;
    
    skipLoadingBtn.addEventListener('mouseenter', () => {
        skipLoadingBtn.style.transform = 'scale(1.1)';
        skipLoadingBtn.style.background = '#c0392b';
    });
    
    skipLoadingBtn.addEventListener('mouseleave', () => {
        skipLoadingBtn.style.transform = 'scale(1)';
        skipLoadingBtn.style.background = '#e74c3c';
    });
    
    skipLoadingBtn.addEventListener('click', () => {
        // إخفاء شاشة التحميل
        const loadingScreen = document.getElementById('loading-screen');
        const authScreen = document.getElementById('auth-screen');
        
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
            loadingScreen.classList.remove('active');
        }
        
        if (authScreen) {
            authScreen.style.display = 'flex';
            setTimeout(() => {
                authScreen.classList.add('active');
            }, 10);
        }
        
        // إخفاء الزر نفسه
        skipLoadingBtn.style.display = 'none';
        
        // إظهار رسالة
        if (window.gameApp && window.gameApp.uiManager) {
            window.gameApp.uiManager.showNotification('تم تخطي التحميل يدوياً ✅', 'info');
        }
    });
    
    // إضافة الزر بعد 3 ثوانٍ إذا ما زالت شاشة التحميل ظاهرة
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen && loadingScreen.classList.contains('active')) {
            document.body.appendChild(skipLoadingBtn);
        }
    }, 3000);
    
    // ===== إصلاح تلقائي بعد 10 ثوانٍ =====
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        const authScreen = document.getElementById('auth-screen');
        
        if (loadingScreen && loadingScreen.classList.contains('active')) {
            console.log('🔄 الإصلاح التلقائي: تخطي شاشة التحميل');
            
            // إخفاء شاشة التحميل
            loadingScreen.style.display = 'none';
            loadingScreen.classList.remove('active');
            
            // إظهار شاشة المصادقة
            if (authScreen) {
                authScreen.style.display = 'flex';
                setTimeout(() => {
                    authScreen.classList.add('active');
                }, 10);
            }
            
            // إخفاء زر التخطي اليدوي
            const skipBtn = document.getElementById('manual-skip-loading');
            if (skipBtn) {
                skipBtn.style.display = 'none';
            }
            
            // إظهار إشعار
            if (window.gameApp && window.gameApp.uiManager) {
                window.gameApp.uiManager.showNotification('تم التحميل تلقائياً ✅', 'success');
            }
        }
    }, 10000); // 10 ثوانٍ
    
    // ===== تسجيل Service Worker =====
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('✅ Service Worker مسجل بنجاح:', registration.scope);
            })
            .catch(error => {
                console.log('❌ فشل تسجيل Service Worker:', error);
            });
    }
    
    // ===== منع الإجراءات غير المرغوب فيها =====
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });
    
    document.addEventListener('copy', (e) => {
        e.preventDefault();
        return false;
    });
    
    document.addEventListener('cut', (e) => {
        e.preventDefault();
        return false;
    });
    
    document.addEventListener('paste', (e) => {
        e.preventDefault();
        return false;
    });
});

// التصدير للاستخدام في الوحدات
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MillionaireApp;
}
