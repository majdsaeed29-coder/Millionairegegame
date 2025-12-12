class MillionaireApp {
    constructor() {
        console.log("🚀 بدء تشغيل المليونير الذهبية...");

        try {
            // التحقق من أن المكونات الأساسية متوفرة
            this.checkDependencies();

            // إنشاء المكونات
            this.createComponents();

            // إنشاء واجهات المستخدم
            this.createScreens();

            // التحقق من المستخدم
            this.checkUser();

            // إعداد الأحداث
            this.setupEvents();

            // إنشاء مسؤول افتراضي إذا لم يكن موجوداً
            setTimeout(() => {
                this.admin.createDefaultAdmin();
            }, 1000);

            console.log("✅ التطبيق جاهز للاستخدام");

        } catch (error) {
            console.error("❌ خطأ في إنشاء التطبيق:", error);
            this.showError(error);
        }
    }

    // التحقق من المكونات المطلوبة
    checkDependencies() {
        const requiredComponents = [
            'AuthSystem',
            'QuestionManager', 
            'GameEngine',
            'UIManager',
            'AdminPanel',
            'GameConfig'
        ];

        const missing = [];
        
        requiredComponents.forEach(component => {
            if (window[component] === undefined) {
                missing.push(component);
            }
        });

        if (missing.length > 0) {
            throw new Error(`المكونات التالية غير متوفرة: ${missing.join(', ')}`);
        }
    }

    // إنشاء المكونات
    createComponents() {
        this.auth = new AuthSystem();
        this.questions = new QuestionManager();
        this.game = new GameEngine();
        this.ui = new UIManager(this);
        this.admin = new AdminPanel(this);
    }

    // إظهار خطأ
    showError(error) {
        const errorHTML = `
            <div style="text-align: center; padding: 50px;">
                <div style="color: #e74c3c; font-size: 4rem;">❌</div>
                <h1 style="color: #FFD700;">حدث خطأ في التطبيق</h1>
                <p style="color: #aaa; margin: 20px 0;">${error.message}</p>
                <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <p style="color: #ddd; font-family: monospace;">${error.stack}</p>
                </div>
                <button id="reload-app" style="background: #D4AF37; color: black; border: none; padding: 15px 30px; border-radius: 25px; font-weight: bold; cursor: pointer; font-size: 1rem;">
                    ↻ إعادة تحميل التطبيق
                </button>
            </div>
        `;

        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = errorHTML;
            app.style.display = 'block';
            
            document.getElementById('reload-app').addEventListener('click', () => {
                window.location.reload();
            });
        }
    }

    // إنشاء الشاشات
    createScreens() {
        const app = document.getElementById('app');
        if (!app) {
            throw new Error('عنصر #app غير موجود في الصفحة');
        }

        app.innerHTML = `
            <!-- شاشة المصادقة الرئيسية -->
            <div id="auth-screen" class="screen active">
                <div class="auth-box">
                    <h1 style="text-align: center; color: #FFD700; margin-bottom: 30px; font-size: 2.5rem;">
                        <i class="fas fa-crown"></i> المليونير الذهبية
                    </h1>
                    <p style="text-align: center; color: #aaa; margin-bottom: 30px;">
                        اختبر ذكاءك للفوز بمليون دولار
                    </p>

                    <div class="auth-tabs">
                        <button class="auth-tab active" data-tab="login">تسجيل الدخول</button>
                        <button class="auth-tab" data-tab="register">إنشاء حساب</button>
                    </div>

                    <!-- نموذج تسجيل الدخول -->
                    <form id="login-form" class="auth-form active">
                        <div class="form-group">
                            <label for="login-username"><i class="fas fa-user"></i> اسم المستخدم</label>
                            <input type="text" id="login-username" class="form-control" placeholder="أدخل اسم المستخدم" required>
                        </div>

                        <div class="form-group">
                            <label for="login-password"><i class="fas fa-lock"></i> كلمة المرور</label>
                            <input type="password" id="login-password" class="form-control" placeholder="أدخل كلمة المرور" required>
                        </div>

                        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 20px;">
                            <i class="fas fa-sign-in-alt"></i> تسجيل الدخول
                        </button>

                        <p style="text-align: center; margin-top: 20px; color: #aaa;">
                            للمسؤولين فقط:
                            <a href="#" id="admin-login-link" style="color: #FFD700; text-decoration: none;">
                                الدخول كمسؤول
                            </a>
                        </p>
                    </form>

                    <!-- نموذج التسجيل -->
                    <form id="register-form" class="auth-form">
                        <div class="form-group">
                            <label for="register-username"><i class="fas fa-user-plus"></i> اسم المستخدم</label>
                            <input type="text" id="register-username" class="form-control" placeholder="أدخل اسم مستخدم جديد" required>
                        </div>

                        <div class="form-group">
                            <label for="register-password"><i class="fas fa-lock"></i> كلمة المرور</label>
                            <input type="password" id="register-password" class="form-control" placeholder="أدخل كلمة مرور قوية" required>
                        </div>

                        <div class="form-group">
                            <label for="register-email"><i class="fas fa-envelope"></i> البريد الإلكتروني (اختياري)</label>
                            <input type="email" id="register-email" class="form-control" placeholder="example@email.com">
                        </div>

                        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 20px;">
                            <i class="fas fa-user-plus"></i> إنشاء حساب
                        </button>
                    </form>
                </div>
            </div>

            <!-- القائمة الرئيسية -->
            <div id="main-menu-screen" class="screen"></div>

            <!-- شاشة اللعبة -->
            <div id="game-screen" class="screen"></div>

            <!-- شاشة النتائج -->
            <div id="results-screen" class="screen"></div>

            <!-- شاشة الإدارة -->
            <div id="admin-screen" class="screen"></div>
        `;
    }

    // التحقق من المستخدم
    checkUser() {
        try {
            if (this.auth.isLoggedIn()) {
                if (this.auth.isAdmin()) {
                    this.showAdminPanel();
                } else {
                    this.showMainMenu();
                }
            } else {
                this.ui.showScreen('auth');
            }
        } catch (error) {
            console.error('❌ خطأ في التحقق من المستخدم:', error);
            this.ui.showScreen('auth');
        }
    }

    // إظهار القائمة الرئيسية
    showMainMenu() {
        const user = this.auth.getCurrentUser();
        if (!user) {
            this.ui.showNotification('يجب تسجيل الدخول أولاً', 'error');
            this.ui.showScreen('auth');
            return;
        }

        const menuScreen = document.getElementById('main-menu-screen');
        if (!menuScreen) return;

        menuScreen.innerHTML = `
            <div class="menu-container">
                <div class="user-header">
                    <h1 class="user-welcome">مرحباً ${user.username}!</h1>
                    <p style="color: #FFD700; font-size: 1.2rem;">استعد للفوز بمليون دولار</p>

                    <div class="user-stats">
                        <div class="stat-item">
                            <div class="stat-value">${user.balance?.toLocaleString() || 0} $</div>
                            <div class="stat-label">الرصيد</div>
                        </div>

                        <div class="stat-item">
                            <div class="stat-value">المستوى ${user.stats?.level || 1}</div>
                            <div class="stat-label">المستوى</div>
                        </div>

                        <div class="stat-item">
                            <div class="stat-value">${(user.stats?.highestScore || 0).toLocaleString()}</div>
                            <div class="stat-label">أعلى نتيجة</div>
                        </div>

                        <div class="stat-item">
                            <div class="stat-value">${user.stats?.gamesPlayed || 0}</div>
                            <div class="stat-label">عدد الألعاب</div>
                        </div>
                    </div>
                </div>

                <div class="menu-grid">
                    <div class="menu-card" id="play-btn">
                        <div class="menu-icon">🎮</div>
                        <h3>بدأ لعبة جديدة</h3>
                        <p>إبدأ تحدي المليون دولار مع 15 سؤالاً متتالياً</p>
                    </div>

                    <div class="menu-card" id="categories-btn">
                        <div class="menu-icon">📚</div>
                        <h3>التصنيفات</h3>
                        <p>اختر مواضيع الأسئلة التي تريد التحدي فيها</p>
                    </div>

                    <div class="menu-card" id="leaderboard-btn">
                        <div class="menu-icon">🏆</div>
                        <h3>لوحة المتصدرين</h3>
                        <p>شاهد أفضل اللاعبين وتنافس على المركز الأول</p>
                    </div>

                    <div class="menu-card" id="store-btn">
                        <div class="menu-icon">🛒</div>
                        <h3>المتجر</h3>
                        <p>اشترِ أدوات مساعدة أو اشتراكات مميزة</p>
                    </div>

                    <div class="menu-card" id="settings-btn">
                        <div class="menu-icon">⚙️</div>
                        <h3>الإعدادات</h3>
                        <p>تخصيص الصوت، المظهر، وإعدادات اللعبة</p>
                    </div>

                    <div class="menu-card" id="logout-btn">
                        <div class="menu-icon">🚪</div>
                        <h3>تسجيل الخروج</h3>
                        <p>الخروج من حسابك والعودة لشاشة البداية</p>
                    </div>
                </div>

                ${user.isAdmin ? `
                    <div style="text-align: center; margin-top: 30px;">
                        <button class="btn btn-primary" id="admin-btn">
                            <i class="fas fa-cogs"></i> لوحة الإدارة
                        </button>
                    </div>
                ` : ''}

                <div style="text-align: center; margin-top: 40px; color: #777;">
                    <p>الإصدار ${GameConfig.VERSION} | المليونير الذهبية © ${new Date().getFullYear()}</p>
                </div>
            </div>
        `;

        this.ui.showScreen('main-menu');
        
        // إضافة الأحداث للقائمة الرئيسية
        this.setupMainMenuEvents();
    }

    // إعداد أحداث القائمة الرئيسية
    setupMainMenuEvents() {
        // زر بدء لعبة جديدة
        document.getElementById('play-btn')?.addEventListener('click', () => {
            this.startNewGame();
        });

        // زر التصنيفات
        document.getElementById('categories-btn')?.addEventListener('click', () => {
            this.ui.showNotification('قريباً...', 'info');
        });

        // زر لوحة المتصدرين
        document.getElementById('leaderboard-btn')?.addEventListener('click', () => {
            this.ui.showNotification('قريباً...', 'info');
        });

        // زر المتجر
        document.getElementById('store-btn')?.addEventListener('click', () => {
            this.ui.showNotification('قريباً...', 'info');
        });

        // زر الإعدادات
        document.getElementById('settings-btn')?.addEventListener('click', () => {
            this.ui.showNotification('قريباً...', 'info');
        });

        // زر تسجيل الخروج
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            this.auth.logout();
            this.ui.showNotification('تم تسجيل الخروج بنجاح', 'success');
            this.checkUser();
        });

        // زر لوحة الإدارة (للمسؤولين)
        document.getElementById('admin-btn')?.addEventListener('click', () => {
            this.showAdminPanel();
        });
    }

    // إظهار لوحة الإدارة
    showAdminPanel() {
        try {
            if (!this.auth.isAdmin()) {
                this.ui.showNotification('ليس لديك صلاحيات الدخول كمسؤول', 'error');
                return;
            }
            
            this.admin.loadAdminPanel();
            this.ui.showScreen('admin');
        } catch (error) {
            console.error('❌ خطأ في تحميل لوحة الإدارة:', error);
            this.ui.showNotification('خطأ في تحميل لوحة الإدارة', 'error');
        }
    }

    // إعداد الأحداث
    setupEvents() {
        // تفويض الأحداث للمستند
        this.setupEventDelegation();
        
        // أحداث النماذج
        this.setupFormEvents();
    }

    // إعداد تفويض الأحداث
    setupEventDelegation() {
        document.addEventListener('click', (e) => {
            // تبويبات المصادقة
            if (e.target.classList.contains('auth-tab')) {
                const tab = e.target.dataset.tab;
                this.showAuthTab(tab);
            }

            // رابط دخول المسؤول
            if (e.target.id === 'admin-login-link') {
                e.preventDefault();
                this.showAdminLogin();
            }
        });
    }

    // إعداد أحداث النماذج
    setupFormEvents() {
        // حدث Enter في حقول الإدخال
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const activeAuthForm = document.querySelector('.auth-form.active');
                if (activeAuthForm) {
                    e.preventDefault();
                    if (activeAuthForm.id === 'login-form') {
                        this.handleLogin();
                    } else if (activeAuthForm.id === 'register-form') {
                        this.handleRegister();
                    }
                }
            }
        });

        // نموذج تسجيل الدخول
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // نموذج التسجيل
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }
    }

    // إظهار تبويب المصادقة
    showAuthTab(tab) {
        const tabs = document.querySelectorAll('.auth-tab');
        const forms = document.querySelectorAll('.auth-form');

        tabs.forEach(t => t.classList.remove('active'));
        forms.forEach(f => f.classList.remove('active'));

        const activeTab = document.querySelector(`.auth-tab[data-tab="${tab}"]`);
        const activeForm = document.getElementById(`${tab}-form`);

        if (activeTab) activeTab.classList.add('active');
        if (activeForm) activeForm.classList.add('active');
    }

    // معالجة تسجيل الدخول
    handleLogin() {
        const username = document.getElementById('login-username')?.value.trim();
        const password = document.getElementById('login-password')?.value;

        if (!username || !password) {
            this.ui.showNotification('الرجاء ملء جميع الحقول المطلوبة', 'error');
            return;
        }

        try {
            const result = this.auth.login(username, password);

            if (result.success) {
                this.ui.showNotification('تم تسجيل الدخول بنجاح', 'success');
                setTimeout(() => {
                    this.checkUser();
                }, 500);
            } else {
                this.ui.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('❌ خطأ في تسجيل الدخول:', error);
            this.ui.showNotification('حدث خطأ أثناء تسجيل الدخول', 'error');
        }
    }

    // معالجة التسجيل
    handleRegister() {
        const username = document.getElementById('register-username')?.value.trim();
        const password = document.getElementById('register-password')?.value;
        const email = document.getElementById('register-email')?.value.trim();

        if (!username || !password) {
            this.ui.showNotification('الرجاء ملء جميع الحقول المطلوبة', 'error');
            return;
        }

        try {
            const result = this.auth.register(username, password, email);

            if (result.success) {
                this.ui.showNotification('تم إنشاء الحساب بنجاح', 'success');
                setTimeout(() => {
                    this.checkUser();
                }, 500);
            } else {
                this.ui.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('❌ خطأ في التسجيل:', error);
            this.ui.showNotification('حدث خطأ أثناء إنشاء الحساب', 'error');
        }
    }

    // إظهار دخول المسؤول
    showAdminLogin() {
        const modalContent = `
            <h3 style="color: #FFD700; margin-bottom: 20px;"><i class="fas fa-user-shield"></i> دخول المسؤول</h3>
            <div class="form-group">
                <label>اسم المستخدم المسؤول</label>
                <input type="text" id="admin-username" class="form-control" value="admin">
            </div>
            <div class="form-group">
                <label>كلمة مرور المسؤول</label>
                <input type="password" id="admin-password" class="form-control" value="Admin@2024">
            </div>
            <div class="form-group">
                <label>كود التحقق (8888)</label>
                <input type="text" id="admin-code" class="form-control" placeholder="8888">
            </div>
            <button id="confirm-admin-login" class="btn btn-primary" style="width: 100%">
                <i class="fas fa-sign-in-alt"></i> الدخول كمسؤول
            </button>
        `;

        this.admin.showModal('دخول المسؤول', modalContent);

        document.getElementById('confirm-admin-login').addEventListener('click', () => {
            const username = document.getElementById('admin-username').value;
            const password = document.getElementById('admin-password').value;
            const code = document.getElementById('admin-code').value;

            if (code === '8888') {
                const result = this.auth.login(username, password);
                if (result.success) {
                    this.admin.closeModal();
                    this.ui.showNotification('تم الدخول كمسؤول', 'success');
                    this.showAdminPanel();
                } else {
                    this.ui.showNotification('بيانات الدخول غير صحيحة', 'error');
                }
            } else {
                this.ui.showNotification('كود التحقق غير صحيح', 'error');
            }
        });
    }

    // بدء لعبة جديدة
    startNewGame() {
        const user = this.auth.getCurrentUser();
        if (!user) {
            this.ui.showNotification('يجب تسجيل الدخول أولاً', 'error');
            this.ui.showScreen('auth');
            return;
        }

        try {
            const result = this.game.startNewGame({
                player: user.username,
                difficulty: 'medium',
                categories: ['general'],
                timerEnabled: true
            });

            if (result.success) {
                this.ui.showScreen('game');
                this.ui.createGameScreen(result.firstQuestion);
                this.ui.showNotification('بدأت اللعبة، حظاً موفقاً!', 'success');
            } else {
                this.ui.showNotification(result.message || 'حدث خطأ في بدء اللعبة', 'error');
            }
        } catch (error) {
            console.error('❌ خطأ في بدء اللعبة:', error);
            this.ui.showNotification('حدث خطأ في بدء اللعبة', 'error');
        }
    }

    // تحديث رصيد المستخدم (لللوحة الإدارة)
    updateUserBalance(username) {
        if (!this.auth.isAdmin()) {
            this.ui.showNotification('ليس لديك صلاحيات لتعديل الرصيد', 'error');
            return;
        }

        const user = this.auth.users[username];
        if (!user) {
            this.ui.showNotification('المستخدم غير موجود', 'error');
            return;
        }

        const currentBalance = user.balance || 0;
        const newBalance = prompt(`أدخل الرصيد الجديد للمستخدم ${username}:`, currentBalance);
        
        if (newBalance && !isNaN(newBalance)) {
            const amount = parseInt(newBalance) - currentBalance;
            const success = this.auth.updateBalance(username, amount);
            
            if (success) {
                this.ui.showNotification('تم تحديث الرصيد بنجاح', 'success');
                if (this.admin.loadAdminContent) {
                    this.admin.loadAdminContent('users');
                }
            } else {
                this.ui.showNotification('حدث خطأ في تحديث الرصيد', 'error');
            }
        }
    }

    // جعل المستخدم مسؤولاً
    makeAdmin(username) {
        if (!this.auth.isAdmin()) {
            this.ui.showNotification('ليس لديك صلاحيات لجعل المستخدم مسؤولاً', 'error');
            return;
        }

        if (confirm(`هل تريد جعل ${username} مسؤولاً؟`)) {
            this.auth.updateUser(username, { isAdmin: true });
            this.ui.showNotification('تم منح صلاحيات المسؤول', 'success');
            if (this.admin.loadAdminContent) {
                this.admin.loadAdminContent('users');
            }
        }
    }

    // حذف المستخدم
    deleteUser(username) {
        if (!this.auth.isAdmin()) {
            this.ui.showNotification('ليس لديك صلاحيات لحذف المستخدمين', 'error');
            return;
        }

        if (confirm(`هل تريد حذف المستخدم ${username}؟`)) {
            delete this.auth.users[username];
            this.auth.saveUsers();
            this.ui.showNotification('تم حذف المستخدم', 'success');
            if (this.admin.loadAdminContent) {
                this.admin.loadAdminContent('users');
            }
        }
    }

    // تعديل خطة الاشتراك
    editSubscription(planType) {
        if (!this.auth.isAdmin()) {
            this.ui.showNotification('ليس لديك صلاحيات لتعديل الخطط', 'error');
            return;
        }

        const plans = {
            free: { price: 0, name: 'مجانية' },
            pro: { price: 9.99, name: 'برو' },
            premium: { price: 19.99, name: 'بريميوم' }
        };

        const plan = plans[planType];
        if (!plan) {
            this.ui.showNotification('خطة غير صحيحة', 'error');
            return;
        }

        const newPrice = prompt(`أدخل السعر الجديد لخطة ${plan.name} ($):`, plan.price);

        if (newPrice && !isNaN(newPrice)) {
            this.ui.showNotification(`تم تحديث سعر خطة ${plan.name} إلى ${newPrice}$`, 'success');
        }
    }

    // إعادة تحميل التطبيق (للأخطاء)
    reloadApp() {
        window.location.reload();
    }
}

// التحقق من أننا في بيئة المتصفح قبل التصدير
if (typeof window !== "undefined") {
    window.MillionaireApp = MillionaireApp;
    window.gameApp = null;
}

// نسخة بدائية من UIManager إذا لم تكن موجودة
if (typeof UIManager === 'undefined') {
    class BasicUIManager {
        constructor(app) {
            this.app = app;
        }
        
        showScreen(screenName) {
            const screens = document.querySelectorAll('.screen');
            screens.forEach(screen => {
                screen.classList.remove('active');
            });
            const target = document.getElementById(`${screenName}-screen`);
            if (target) target.classList.add('active');
        }
        
        showNotification(message, type = 'info') {
            alert(`${type.toUpperCase()}: ${message}`);
        }
    }
    
    window.UIManager = BasicUIManager;
}

// نسخة بدائية من AdminPanel إذا لم تكن موجودة
if (typeof AdminPanel === 'undefined') {
    class BasicAdminPanel {
        constructor(app) {
            this.app = app;
        }
        
        createDefaultAdmin() {
            console.log('ℹ️ لوحة الإدارة غير متوفرة، لا يمكن إنشاء مسؤول افتراضي');
            return false;
        }
        
        loadAdminPanel() {
            console.log('ℹ️ لوحة الإدارة غير متوفرة');
            this.app.ui.showNotification('لوحة الإدارة غير متوفرة', 'warning');
        }
        
        showModal(title, content) {
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            `;
            modal.innerHTML = `
                <div style="background: #1e3799; padding: 30px; border-radius: 15px; max-width: 500px; width: 90%;">
                    <h3 style="color: gold; margin-bottom: 20px;">${title}</h3>
                    <div>${content}</div>
                </div>
            `;
            document.body.appendChild(modal);
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        }
        
        closeModal() {
            const modal = document.querySelector('div[style*="position: fixed"]');
            if (modal) modal.remove();
        }
    }
    
    window.AdminPanel = BasicAdminPanel;
}

// تسجيل خدمة Worker إذا كان متاحاً
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('✅ Service Worker مسجل:', registration.scope);
            })
            .catch(error => {
                console.log('ℹ️ Service Worker غير مسجل:', error);
            });
    });
}
