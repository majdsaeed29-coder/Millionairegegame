/**
 * التطبيق الرئيسي - ميليونير الذهبية
 * النسخة النهائية المباشرة
 */

class MillionaireApp {
    constructor() {
        this.config = GameConfig;
        this.authSystem = null;
        this.questionManager = null;
        this.gameEngine = null;
        this.uiManager = null;
        this.isInitialized = false;
        
        console.log('🚀 ميليونير الذهبية - بدء التشغيل...');
        
        // بدء التطبيق مباشرة
        this.startApp();
    }
    
    /**
     * بدء التطبيق
     */
    async startApp() {
        try {
            // 1. تهيئة الأنظمة الأساسية أولاً
            this.initializeBasicSystems();
            
            // 2. إظهار شاشة التحميل
            this.showLoadingScreen();
            
            // 3. تهيئة جميع المكونات
            await this.initializeAllComponents();
            
            // 4. التحقق من تسجيل الدخول
            this.checkAuthentication();
            
            // 5. إخفاء شاشة التحميل بعد 2 ثانية
            setTimeout(() => {
                this.hideLoadingScreen();
            }, 2000);
            
            this.isInitialized = true;
            console.log('✅ التطبيق جاهز للاستخدام!');
            
        } catch (error) {
            console.error('❌ خطأ في بدء التطبيق:', error);
            this.showErrorScreen(error);
        }
    }
    
    /**
     * تهيئة الأنظمة الأساسية
     */
    initializeBasicSystems() {
        console.log('⚙️ تهيئة الأنظمة الأساسية...');
        
        // تهيئة نظام المصادقة
        this.authSystem = new AuthSystem();
        
        // تهيئة نظام الأسئلة
        this.questionManager = new QuestionManager();
        
        // تهيئة نظام اللعبة
        this.gameEngine = new GameEngine();
        
        // تهيئة نظام الواجهة
        this.uiManager = new UIManager();
    }
    
    /**
     * إظهار شاشة التحميل
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            loadingScreen.classList.add('active');
        }
    }
    
    /**
     * إخفاء شاشة التحميل
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('active');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }
    
    /**
     * تهيئة جميع المكونات
     */
    async initializeAllComponents() {
        console.log('🔧 تهيئة جميع المكونات...');
        
        // ربط المكونات معاً
        this.setupComponentConnections();
        
        // إعداد الأحداث
        this.setupEventListeners();
        
        // تطبيق إعدادات المستخدم
        this.applyUserSettings();
        
        // انتظار بسيط لتحميل الأسئلة
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    /**
     * ربط المكونات معاً
     */
    setupComponentConnections() {
        console.log('🔗 ربط المكونات...');
        
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
    }
    
    /**
     * إعداد الأحداث
     */
    setupEventListeners() {
        console.log('🎯 إعداد الأحداث...');
        
        // أحداث المصادقة
        this.setupAuthEvents();
        
        // أحداث اللعبة
        this.setupGameEvents();
        
        // أحداث التنقل
        this.setupNavigationEvents();
    }
    
    /**
     * إعداد أحداث المصادقة
     */
    setupAuthEvents() {
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        
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
        
        if (loginTab && registerTab) {
            loginTab.addEventListener('click', () => {
                this.uiManager.showAuthForm('login');
            });
            
            registerTab.addEventListener('click', () => {
                this.uiManager.showAuthForm('register');
            });
        }
    }
    
    /**
     * إعداد أحداث اللعبة
     */
    setupGameEvents() {
        const startGameBtn = document.getElementById('start-game-btn');
        const playBtn = document.getElementById('play-btn');
        const playAgainBtn = document.getElementById('play-again-btn');
        const quitGameBtn = document.getElementById('quit-game-btn');
        
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => {
                this.startNewGame();
            });
        }
        
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                this.uiManager.showScreen('categories');
            });
        }
        
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                this.uiManager.showScreen('categories');
            });
        }
        
        if (quitGameBtn) {
            quitGameBtn.addEventListener('click', () => {
                this.quitGame();
            });
        }
    }
    
    /**
     * إعداد أحداث التنقل
     */
    setupNavigationEvents() {
        const backBtns = document.querySelectorAll('[data-action="back-to-menu"]');
        const homeBtn = document.getElementById('home-btn');
        const leaderboardBtn = document.getElementById('leaderboard-btn');
        const settingsBtn = document.getElementById('settings-btn');
        const logoutBtn = document.getElementById('logout-btn');
        
        backBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.uiManager.showScreen('main-menu');
            });
        });
        
        if (homeBtn) {
            homeBtn.addEventListener('click', () => {
                this.uiManager.showScreen('main-menu');
            });
        }
        
        if (leaderboardBtn) {
            leaderboardBtn.addEventListener('click', () => {
                this.showLeaderboard();
            });
        }
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.uiManager.showSettingsModal();
            });
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    }
    
    /**
     * تطبيق إعدادات المستخدم
     */
    applyUserSettings() {
        console.log('⚙️ تطبيق إعدادات المستخدم...');
        
        // تحميل الإعدادات من localStorage
        const settings = JSON.parse(localStorage.getItem('millionaire_settings') || '{}');
        
        // تطبيق الإعدادات
        if (this.uiManager) {
            this.uiManager.audioEnabled = settings.sound !== false;
            this.uiManager.vibrationEnabled = settings.vibration !== false;
            
            if (settings.theme) {
                this.uiManager.applyTheme(settings.theme);
            }
        }
    }
    
    /**
     * التحقق من المصادقة
     */
    checkAuthentication() {
        console.log('🔐 التحقق من المصادقة...');
        
        if (this.authSystem.isLoggedIn()) {
            const user = this.authSystem.getCurrentUser();
            this.uiManager.updateMainMenu(user);
            this.uiManager.showScreen('main-menu');
            console.log('✅ مستخدم مسجل دخول:', user.username);
        } else {
            this.uiManager.showScreen('auth');
            console.log('ℹ️ لا يوجد مستخدم مسجل');
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
                this.uiManager.showNotification(`مرحباً بك ${result.user.username}! 👋`, 'success');
                this.uiManager.updateMainMenu(result.user);
                this.uiManager.showScreen('main-menu');
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
                this.uiManager.showNotification(`مرحباً بك ${result.user.username}! 👋`, 'success');
                this.uiManager.updateMainMenu(result.user);
                this.uiManager.showScreen('main-menu');
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
     * تسجيل الخروج
     */
    logout() {
        this.uiManager.showConfirmation(
            'هل تريد تسجيل الخروج؟',
            () => {
                this.authSystem.logout();
                this.uiManager.showScreen('auth');
                this.uiManager.showNotification('تم تسجيل الخروج بنجاح!', 'info');
            }
        );
    }
    
    /**
     * بدء لعبة جديدة
     */
    startNewGame() {
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
     * عرض لوحة المتصدرين
     */
    showLeaderboard() {
        const leaderboardHTML = this.uiManager.loadLeaderboard();
        this.uiManager.showModal('🏆 لوحة المتصدرين', leaderboardHTML, { size: 'large' });
    }
    
    /**
     * عرض شاشة الخطأ
     */
    showErrorScreen(error) {
        console.error('❌ عرض شاشة الخطأ:', error);
        
        const errorHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #0c2461 0%, #1e3799 100%);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: white;
                text-align: center;
                padding: 20px;
                z-index: 10000;
            ">
                <div style="font-size: 4rem; margin-bottom: 20px;">❌</div>
                <h1 style="color: #FFD700; margin-bottom: 10px;">خطأ في التحميل</h1>
                <p style="margin-bottom: 30px; max-width: 500px;">
                    حدث خطأ في تحميل اللعبة. يرجى تحديث الصفحة والمحاولة مرة أخرى.
                </p>
                <button onclick="window.location.reload()" style="
                    background: #D4AF37;
                    color: black;
                    border: none;
                    padding: 15px 40px;
                    border-radius: 25px;
                    font-size: 18px;
                    font-weight: bold;
                    cursor: pointer;
                    margin: 10px;
                ">
                    🔄 تحديث الصفحة
                </button>
                <button onclick="startSimpleVersion()" style="
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 15px 40px;
                    border-radius: 25px;
                    font-size: 18px;
                    font-weight: bold;
                    cursor: pointer;
                    margin: 10px;
                ">
                    🎮 تشغيل نسخة مبسطة
                </button>
            </div>
        `;
        
        document.body.innerHTML = errorHTML;
        
        // دالة النسخة المبسطة
        window.startSimpleVersion = function() {
            // شفرة النسخة المبسطة من اللعبة
            const simpleGame = `
                <!DOCTYPE html>
                <html lang="ar" dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>ميليونير الذهبية - النسخة المبسطة</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body {
                            font-family: 'Arial', sans-serif;
                            background: linear-gradient(135deg, #1a1a2e, #16213e);
                            color: white;
                            min-height: 100vh;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            padding: 20px;
                        }
                        .container {
                            max-width: 800px;
                            width: 100%;
                            background: rgba(255,255,255,0.1);
                            border-radius: 20px;
                            padding: 40px;
                            border: 3px solid #D4AF37;
                            text-align: center;
                        }
                        h1 { color: #FFD700; margin-bottom: 20px; }
                        .question {
                            font-size: 1.8rem;
                            margin: 30px 0;
                            padding: 20px;
                            background: rgba(255,255,255,0.05);
                            border-radius: 15px;
                        }
                        .answers {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 15px;
                            margin: 20px 0;
                        }
                        .answer {
                            background: rgba(255,255,255,0.1);
                            border: 2px solid rgba(255,255,255,0.2);
                            padding: 20px;
                            border-radius: 15px;
                            cursor: pointer;
                            font-size: 1.2rem;
                            transition: all 0.3s;
                        }
                        .answer:hover { background: rgba(212, 175, 55, 0.3); }
                        .correct { background: #27ae60 !important; }
                        .wrong { background: #e74c3c !important; }
                        button {
                            background: linear-gradient(135deg, #D4AF37, #FFD700);
                            color: black;
                            border: none;
                            padding: 15px 40px;
                            border-radius: 25px;
                            font-size: 1.2rem;
                            font-weight: bold;
                            cursor: pointer;
                            margin: 10px;
                        }
                        .stats {
                            display: flex;
                            justify-content: space-around;
                            margin: 20px 0;
                            font-size: 1.3rem;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>🏆 ميليونير الذهبية - النسخة المبسطة</h1>
                        
                        <div id="menu">
                            <button onclick="startGame('easy')">🎮 سهل (60 ثانية)</button>
                            <button onclick="startGame('medium')">🎯 متوسط (45 ثانية)</button>
                            <button onclick="startGame('hard')">🔥 صعب (30 ثانية)</button>
                        </div>
                        
                        <div id="game" style="display:none;">
                            <div class="stats">
                                <div>الوقت: <span id="time">60</span> ث</div>
                                <div>الرصيد: <span id="score">0</span> $</div>
                                <div>السؤال: <span id="qNum">1</span>/5</div>
                            </div>
                            
                            <div id="question" class="question"></div>
                            
                            <div id="answers" class="answers"></div>
                            
                            <button onclick="nextQuestion()" id="nextBtn" style="display:none;">➡️ التالي</button>
                            <button onclick="quitGame()" style="background:#e74c3c;color:white;">❌ إنهاء</button>
                        </div>
                    </div>
                    
                    <script>
                        const questions = [
                            { q: "ما هي عاصمة فرنسا؟", a: ["لندن", "برلين", "باريس", "روما"], c: 2 },
                            { q: "كم عدد أيام الأسبوع؟", a: ["5", "6", "7", "8"], c: 2 },
                            { q: "ما هو لون التفاحة الناضجة؟", a: ["أزرق", "أخضر", "أحمر", "أسود"], c: 2 },
                            { q: "من هو مؤسس الدولة الأموية؟", a: ["مروان", "معاوية", "يزيد", "عبدالملك"], c: 1 },
                            { q: "ما هي أكبر دولة في العالم؟", a: ["كندا", "الصين", "أمريكا", "روسيا"], c: 3 }
                        ];
                        
                        let score = 0;
                        let currentQ = 0;
                        let timer = 60;
                        let timerInterval;
                        
                        function startGame(level) {
                            document.getElementById('menu').style.display = 'none';
                            document.getElementById('game').style.display = 'block';
                            
                            timer = { easy: 60, medium: 45, hard: 30 }[level];
                            document.getElementById('time').textContent = timer;
                            
                            score = 0;
                            currentQ = 0;
                            updateScore();
                            showQuestion();
                            startTimer();
                        }
                        
                        function showQuestion() {
                            if (currentQ >= questions.length) {
                                endGame();
                                return;
                            }
                            
                            const q = questions[currentQ];
                            document.getElementById('question').textContent = q.q;
                            document.getElementById('qNum').textContent = currentQ + 1;
                            
                            let answersHTML = '';
                            const letters = ['أ', 'ب', 'ج', 'د'];
                            
                            for (let i = 0; i < q.a.length; i++) {
                                answersHTML += \`
                                    <div class="answer" onclick="checkAnswer(\${i})">
                                        \${letters[i]}: \${q.a[i]}
                                    </div>
                                \`;
                            }
                            
                            document.getElementById('answers').innerHTML = answersHTML;
                            document.getElementById('nextBtn').style.display = 'none';
                        }
                        
                        function checkAnswer(selected) {
                            const q = questions[currentQ];
                            const answers = document.querySelectorAll('.answer');
                            
                            answers.forEach((a, i) => {
                                a.style.pointerEvents = 'none';
                                if (i === q.c) a.classList.add('correct');
                                if (i === selected && i !== q.c) a.classList.add('wrong');
                            });
                            
                            if (selected === q.c) {
                                score += 1000;
                                updateScore();
                                flashEffect('green');
                            } else {
                                flashEffect('red');
                            }
                            
                            document.getElementById('nextBtn').style.display = 'block';
                        }
                        
                        function nextQuestion() {
                            currentQ++;
                            showQuestion();
                        }
                        
                        function updateScore() {
                            document.getElementById('score').textContent = score.toLocaleString();
                        }
                        
                        function startTimer() {
                            clearInterval(timerInterval);
                            timerInterval = setInterval(() => {
                                timer--;
                                document.getElementById('time').textContent = timer;
                                
                                if (timer <= 0) {
                                    clearInterval(timerInterval);
                                    checkAnswer(-1);
                                }
                            }, 1000);
                        }
                        
                        function flashEffect(color) {
                            const flash = document.createElement('div');
                            flash.style.cssText = \`
                                position: fixed;
                                top: 0; left: 0;
                                width: 100%; height: 100%;
                                background: \${color === 'green' ? 'rgba(39,174,96,0.5)' : 'rgba(231,76,60,0.5)'};
                                z-index: 9999;
                                animation: fadeOut 1s;
                                pointer-events: none;
                            \`;
                            document.body.appendChild(flash);
                            setTimeout(() => flash.remove(), 1000);
                        }
                        
                        function endGame() {
                            clearInterval(timerInterval);
                            document.getElementById('question').innerHTML = \`
                                <h2 style="color:#FFD700">🎉 انتهت اللعبة!</h2>
                                <p>النتيجة النهائية: \${score.toLocaleString()} $</p>
                                <p>مبروك على الأداء الرائع!</p>
                            \`;
                            document.getElementById('answers').innerHTML = '';
                            document.getElementById('nextBtn').style.display = 'none';
                        }
                        
                        function quitGame() {
                            if (confirm('هل تريد إنهاء اللعبة؟')) {
                                document.getElementById('menu').style.display = 'block';
                                document.getElementById('game').style.display = 'none';
                                clearInterval(timerInterval);
                            }
                        }
                    </script>
                </body>
                </html>
            `;
            
            document.open();
            document.write(simpleGame);
            document.close();
        }
    }
    
    /**
     * الحصول على حالة التطبيق
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            userLoggedIn: this.authSystem ? this.authSystem.isLoggedIn() : false,
            gameActive: this.gameEngine ? this.gameEngine.isGameActive : false
        };
    }
}

// ===== بدء التطبيق مباشرة عند تحميل الصفحة =====

// الطريقة المباشرة: إنشاء التطبيق فوراً
window.createMillionaireApp = function() {
    try {
        console.log('🚀 إنشاء تطبيق ميليونير الذهبية...');
        window.gameApp = new MillionaireApp();
        console.log('✅ تم إنشاء التطبيق بنجاح');
    } catch (error) {
        console.error('❌ فشل إنشاء التطبيق:', error);
        
        // محاولة النسخة المبسطة
        const simpleLoader = `
            <div style="
                position: fixed;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: #1a1a2e;
                color: white;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                z-index: 10000;
            ">
                <h1 style="color:#FFD700">ميليونير الذهبية</h1>
                <p>جاري التحميل المباشر...</p>
                <button onclick="loadDirectGame()" style="
                    background: #D4AF37;
                    color: black;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 20px;
                    font-size: 18px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-top: 20px;
                ">
                    🎮 تشغيل مباشر
                </button>
            </div>
        `;
        
        document.body.innerHTML = simpleLoader;
        
        window.loadDirectGame = function() {
            // تحميل لعبة مباشرة بسيطة
            const directGame = `... نفس كود النسخة المبسطة أعلاه ...`;
            document.open();
            document.write(directGame);
            document.close();
        }
    }
};

// بدء التطبيق عندما تكون الصفحة جاهزة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.createMillionaireApp();
    });
} else {
    window.createMillionaireApp();
}

// التصدير للاستخدام في الوحدات
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MillionaireApp;
}
