/**
 * تطبيق ميليونير الذهبية - النسخة النهائية المباشرة
 */

class MillionaireApp {
    constructor() {
        console.log('🚀 بدء تشغيل ميليونير الذهبية');
        this.init();
    }

    /**
     * تهيئة التطبيق
     */
    async init() {
        try {
            // 1. إخفاء شاشة التحميل القديمة أولاً
            this.hideLoadingScreen();
            
            // 2. تهيئة الأنظمة الأساسية
            this.initSystems();
            
            // 3. إعداد الواجهة
            this.setupUI();
            
            // 4. التحقق من المستخدم
            this.checkUser();
            
            console.log('✅ التطبيق جاهز!');
            
        } catch (error) {
            console.error('❌ خطأ:', error);
            this.showError('خطأ في التحميل. يرجى تحديث الصفحة.');
        }
    }

    /**
     * إخفاء شاشة التحميل
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }

    /**
     * تهيئة الأنظمة
     */
    initSystems() {
        // 1. نظام المصادقة
        this.auth = new AuthSystem();
        
        // 2. نظام الأسئلة
        this.questions = new QuestionManager();
        
        // 3. نظام اللعبة
        this.game = new GameEngine();
    }

    /**
     * إعداد الواجهة
     */
    setupUI() {
        // إظهار شاشة الدخول مباشرة
        this.showScreen('auth');
        
        // إعداد الأحداث
        this.setupEvents();
    }

    /**
     * التحقق من المستخدم
     */
    checkUser() {
        if (this.auth.isLoggedIn()) {
            this.showScreen('main-menu');
            this.updateUserInfo();
        } else {
            this.showScreen('auth');
        }
    }

    /**
     * إظهار شاشة معينة
     */
    showScreen(screenName) {
        // إخفاء كل الشاشات
        const screens = ['loading', 'auth', 'main-menu', 'categories', 'game', 'results'];
        screens.forEach(screen => {
            const element = document.getElementById(`${screen}-screen`);
            if (element) {
                element.style.display = 'none';
            }
        });

        // إظهار الشاشة المطلوبة
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.style.display = 'flex';
        }
    }

    /**
     * تحديث معلومات المستخدم
     */
    updateUserInfo() {
        const user = this.auth.getCurrentUser();
        if (!user) return;

        const welcomeEl = document.getElementById('user-welcome');
        const balanceEl = document.getElementById('user-balance');
        const levelEl = document.getElementById('user-level');

        if (welcomeEl) welcomeEl.textContent = `مرحباً، ${user.username}!`;
        if (balanceEl) balanceEl.textContent = `${user.balance} $`;
        if (levelEl) levelEl.textContent = `المستوى ${user.level || 1}`;
    }

    /**
     * إعداد الأحداث
     */
    setupEvents() {
        // أحداث المصادقة
        this.setupAuthEvents();
        
        // أحداث القائمة
        this.setupMenuEvents();
        
        // أحداث اللعبة
        this.setupGameEvents();
    }

    /**
     * أحداث المصادقة
     */
    setupAuthEvents() {
        // زر تسجيل الدخول
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.onclick = () => this.handleLogin();
        }

        // زر التسجيل
        const registerBtn = document.getElementById('register-btn');
        if (registerBtn) {
            registerBtn.onclick = () => this.handleRegister();
        }

        // التبويبات
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');

        if (loginTab) loginTab.onclick = () => this.showAuthTab('login');
        if (registerTab) registerTab.onclick = () => this.showAuthTab('register');

        // Enter لتسجيل الدخول
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && document.getElementById('auth-screen').style.display === 'flex') {
                if (document.getElementById('login-form').style.display === 'block') {
                    this.handleLogin();
                } else {
                    this.handleRegister();
                }
            }
        });
    }

    /**
     * إظهار تبويب المصادقة
     */
    showAuthTab(tab) {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');

        if (tab === 'login') {
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
     * تسجيل الدخول
     */
    handleLogin() {
        const username = document.getElementById('username-input')?.value.trim();
        const password = document.getElementById('password-input')?.value;

        if (!username || !password) {
            this.showNotification('يرجى ملء جميع الحقول!', 'error');
            return;
        }

        this.showNotification('جاري تسجيل الدخول...', 'info');

        setTimeout(() => {
            const result = this.auth.login(username, password);
            
            if (result.success) {
                this.showNotification(`مرحباً ${username}!`, 'success');
                this.showScreen('main-menu');
                this.updateUserInfo();
            } else {
                this.showNotification(result.message, 'error');
            }
        }, 500);
    }

    /**
     * التسجيل
     */
    handleRegister() {
        const username = document.getElementById('username-input')?.value.trim() || 
                         document.getElementById('register-username')?.value.trim();
        const password = document.getElementById('password-input')?.value || 
                         document.getElementById('register-password')?.value;
        const email = document.getElementById('register-email')?.value.trim();

        if (!username || !password) {
            this.showNotification('يرجى ملء الحقول المطلوبة!', 'error');
            return;
        }

        this.showNotification('جاري إنشاء الحساب...', 'info');

        setTimeout(() => {
            const result = this.auth.register(username, password, email);
            
            if (result.success) {
                this.showNotification(`مرحباً ${username}!`, 'success');
                this.showScreen('main-menu');
                this.updateUserInfo();
            } else {
                this.showNotification(result.message, 'error');
            }
        }, 500);
    }

    /**
     * أحداث القائمة
     */
    setupMenuEvents() {
        // زر اللعب
        const playBtn = document.getElementById('play-btn');
        if (playBtn) {
            playBtn.onclick = () => {
                this.showScreen('categories');
                this.loadCategories();
                this.loadDifficulties();
            };
        }

        // زر لوحة المتصدرين
        const leaderboardBtn = document.getElementById('leaderboard-btn');
        if (leaderboardBtn) {
            leaderboardBtn.onclick = () => this.showLeaderboard();
        }

        // زر الإعدادات
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.onclick = () => this.showSettings();
        }

        // زر الخروج
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.onclick = () => {
                if (confirm('هل تريد تسجيل الخروج؟')) {
                    this.auth.logout();
                    this.showScreen('auth');
                    this.showNotification('تم تسجيل الخروج', 'info');
                }
            };
        }
    }

    /**
     * تحميل التصنيفات
     */
    loadCategories() {
        const container = document.getElementById('categories-container');
        if (!container) return;

        const categories = GameConfig.CATEGORIES;
        let html = '';

        categories.forEach(cat => {
            html += `
                <div class="category-card" onclick="this.querySelector('input').click()">
                    <div class="category-icon" style="color: ${cat.color}">
                        ${cat.icon}
                    </div>
                    <h4>${cat.name}</h4>
                    <p>${cat.description}</p>
                    <input type="checkbox" id="cat-${cat.id}" checked>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    /**
     * تحميل الصعوبات
     */
    loadDifficulties() {
        const container = document.getElementById('difficulty-container');
        if (!container) return;

        const difficulties = GameConfig.DIFFICULTY_LEVELS;
        let html = '';

        difficulties.forEach(diff => {
            html += `
                <div class="difficulty-option" onclick="this.classList.toggle('selected')" data-level="${diff.id}">
                    <div class="difficulty-icon" style="color: ${diff.color}">
                        ${diff.icon || '🎮'}
                    </div>
                    <h4>${diff.name}</h4>
                    <p>${diff.description}</p>
                    <div class="difficulty-details">
                        <span>⏱️ ${diff.time} ثانية</span>
                        <span>🛠️ ${diff.lifelines} أدوات</span>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    /**
     * بدء لعبة جديدة
     */
    startNewGame() {
        // جمع التصنيفات المختارة
        const selectedCategories = [];
        document.querySelectorAll('#categories-container input:checked').forEach(cb => {
            selectedCategories.push(cb.id.replace('cat-', ''));
        });

        if (selectedCategories.length === 0) {
            this.showNotification('اختر تصنيف واحد على الأقل!', 'warning');
            return;
        }

        // جمع مستوى الصعوبة
        const selectedDifficulty = document.querySelector('.difficulty-option.selected')?.dataset.level || 'medium';

        // بدء اللعبة
        try {
            this.showScreen('game');
            this.showNotification('بدأت اللعبة! حظاً موفقاً!', 'success');
            
            // هنا يمكنك إضافة كود بدء اللعبة الفعلي
            this.initGameScreen();
            
        } catch (error) {
            console.error('خطأ في بدء اللعبة:', error);
            this.showNotification('خطأ في بدء اللعبة', 'error');
        }
    }

    /**
     * تهيئة شاشة اللعبة
     */
    initGameScreen() {
        // هذا كود بسيط للعرض، يمكنك توسيعه
        const questionText = document.getElementById('question-text');
        const answersContainer = document.getElementById('answers-container');
        
        if (questionText) {
            questionText.textContent = 'ما هي عاصمة فرنسا؟';
        }
        
        if (answersContainer) {
            const answers = ['لندن', 'برلين', 'باريس', 'روما'];
            const letters = ['أ', 'ب', 'ج', 'د'];
            let html = '';
            
            answers.forEach((answer, index) => {
                html += `
                    <button class="answer-btn" onclick="window.gameApp.checkAnswer(${index})">
                        <span class="answer-letter">${letters[index]}</span>
                        <span class="answer-text">${answer}</span>
                    </button>
                `;
            });
            
            answersContainer.innerHTML = html;
        }
    }

    /**
     * التحقق من الإجابة
     */
    checkAnswer(answerIndex) {
        const correctAnswer = 2; // باريس هي الإجابة الصحيحة
        const answerBtns = document.querySelectorAll('.answer-btn');
        
        // تعطيل جميع الأزرار
        answerBtns.forEach(btn => btn.disabled = true);
        
        // تلوين الإجابات
        answerBtns.forEach((btn, index) => {
            if (index === correctAnswer) {
                btn.classList.add('correct');
            } else if (index === answerIndex) {
                btn.classList.add('wrong');
            }
        });
        
        // تطبيق تأثير الوميض
        this.applyFlashEffect(answerIndex === correctAnswer ? 'green' : 'red');
        
        // إظهار زر التالي
        const nextBtn = document.getElementById('next-question-btn');
        if (nextBtn) {
            nextBtn.style.display = 'block';
        }
    }

    /**
     * تطبيق تأثير الوميض
     */
    applyFlashEffect(color) {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${color === 'green' ? 'rgba(39, 174, 96, 0.5)' : 'rgba(231, 76, 60, 0.5)'};
            z-index: 999;
            pointer-events: none;
            animation: fadeOut 1s;
        `;
        
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 1000);
    }

    /**
     * أحداث اللعبة
     */
    setupGameEvents() {
        // زر بدء اللعبة
        const startGameBtn = document.getElementById('start-game-btn');
        if (startGameBtn) {
            startGameBtn.onclick = () => this.startNewGame();
        }

        // زر التالي
        const nextBtn = document.getElementById('next-question-btn');
        if (nextBtn) {
            nextBtn.onclick = () => {
                this.showNotification('السؤال التالي قريباً...', 'info');
                // هنا كود السؤال التالي
            };
        }

        // زر إنهاء اللعبة
        const quitBtn = document.getElementById('quit-game-btn');
        if (quitBtn) {
            quitBtn.onclick = () => {
                if (confirm('هل تريد إنهاء اللعبة؟')) {
                    this.showScreen('main-menu');
                }
            };
        }
    }

    /**
     * عرض لوحة المتصدرين
     */
    showLeaderboard() {
        // كود بسيط للوحة المتصدرين
        const scores = [
            { name: 'أحمد', score: 1000000 },
            { name: 'محمد', score: 500000 },
            { name: 'خالد', score: 250000 }
        ];
        
        let html = '<div class="leaderboard"><h3>🏆 المتصدرون</h3>';
        
        scores.forEach((player, index) => {
            html += `
                <div class="leaderboard-item">
                    <span class="rank">${index + 1}</span>
                    <span class="name">${player.name}</span>
                    <span class="score">${player.score.toLocaleString()} $</span>
                </div>
            `;
        });
        
        html += '</div>';
        
        this.showModal('لوحة المتصدرين', html);
    }

    /**
     * عرض الإعدادات
     */
    showSettings() {
        const content = `
            <div class="settings">
                <h3>⚙️ الإعدادات</h3>
                <div class="setting-item">
                    <label>🔊 الصوت</label>
                    <input type="checkbox" checked>
                </div>
                <div class="setting-item">
                    <label>🎵 الموسيقى</label>
                    <input type="checkbox" checked>
                </div>
                <div class="setting-item">
                    <label>📱 الاهتزاز</label>
                    <input type="checkbox" checked>
                </div>
                <button onclick="window.gameApp.saveSettings()" class="btn">💾 حفظ</button>
            </div>
        `;
        
        this.showModal('الإعدادات', content);
    }

    /**
     * حفظ الإعدادات
     */
    saveSettings() {
        this.showNotification('تم حفظ الإعدادات', 'success');
        this.closeModal();
    }

    /**
     * عرض نافذة
     */
    showModal(title, content) {
        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close" onclick="window.gameApp.closeModal()">×</button>
                    </div>
                    <div class="modal-body">${content}</div>
                </div>
            </div>
        `;
        
        // إزالة أي نافذة سابقة
        this.closeModal();
        
        // إضافة النافذة الجديدة
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    /**
     * إغلاق النافذة
     */
    closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
    }

    /**
     * عرض إشعار
     */
    showNotification(message, type = 'info') {
        // إزالة أي إشعارات سابقة
        const oldNotifications = document.querySelectorAll('.notification');
        oldNotifications.forEach(n => n.remove());
        
        // إنشاء إشعار جديد
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span class="notification-text">${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        // إضافة الأنماط
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        document.body.appendChild(notification);
        
        // إزالة تلقائية بعد 3 ثوان
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }

    /**
     * عرض خطأ
     */
    showError(message) {
        // طريقة بسيطة لعرض الخطأ
        alert(`❌ خطأ: ${message}\n\nيرجى تحديث الصفحة (F5)`);
        
        // محاولة إعادة التحميل
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }
}

// ===== بدء التطبيق مباشرة =====
window.addEventListener('DOMContentLoaded', () => {
    console.log('📄 الصفحة جاهزة، بدء التطبيق...');
    
    try {
        // إنشاء التطبيق
        window.gameApp = new MillionaireApp();
        
        // إضافة أنماط CSS للرسوم المتحركة
        const styles = document.createElement('style');
        styles.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(styles);
        
        console.log('✅ التطبيق يعمل بنجاح!');
        
    } catch (error) {
        console.error('❌ خطأ فادح:', error);
        
        // عرض رسالة خطأ بسيطة
        document.body.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                color: white;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 20px;
            ">
                <h1 style="color:#FFD700">🏆 ميليونير الذهبية</h1>
                <p style="margin: 20px 0; font-size: 18px;">
                    حدث خطأ في تحميل اللعبة.<br>
                    يرجى تحديث الصفحة (F5) أو المحاولة لاحقاً.
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
                    margin-top: 20px;
                ">
                    🔄 تحديث الصفحة
                </button>
            </div>
        `;
    }
});
