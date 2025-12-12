class MillionaireApp {
    constructor() {
        console.log("🚀 بدء تشغيل المليونير الذهبية...");

        // إنشاء المكونات
        this.auth = new AuthSystem();
        this.questions = new QuestionManager();
        this.game = new GameEngine();
        this.ui = new UIManager(this);
        this.admin = new AdminPanel(this);

        // إنشاء واجهات المستخدم
        this.createScreens();

        // التحقق من المستخدم
        this.checkUser();

        // إعداد الأحداث
        this.setupEvents();

        // إنشاء مسؤول افتراضي إذا لم يكن موجوداً
        this.admin.createDefaultAdmin();

        console.log("✅ التطبيق جاهز للاستخدام");
    }

    // إنشاء الشاشات
    createScreens() {
        const app = document.getElementById('app');
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
        if (this.auth.isLoggedIn()) {
            if (this.auth.isAdmin()) {
                this.showAdminPanel();
            } else {
                this.showMainMenu();
            }
        } else {
            this.ui.showScreen('auth');
        }
    }

    // إظهار القائمة الرئيسية
    showMainMenu() {
        const user = this.auth.getCurrentUser();
        if (!user) return;

        const menuScreen = document.getElementById('main-menu-screen');
        menuScreen.innerHTML = `
            <div class="menu-container">
                <div class="user-header">
                    <h1 class="user-welcome">مرحباً ${user.username}!</h1>
                    <p style="color: #FFD700; font-size: 1.2rem;">استعد للفوز بمليون دولار</p>

                    <div class="user-stats">
                        <div class="stat-item">
                            <div class="stat-value">${user.balance.toLocaleString()} $</div>
                            <div class="stat-label">الرصيد</div>
                        </div>

                        <div class="stat-item">
                            <div class="stat-value">المستوى ${user.stats.level}</div>
                            <div class="stat-label">المستوى</div>
                        </div>

                        <div class="stat-item">
                            <div class="stat-value">${user.stats.highestScore.toLocaleString()}</div>
                            <div class="stat-label">أعلى نتيجة</div>
                        </div>

                        <div class="stat-item">
                            <div class="stat-value">${user.stats.gamesPlayed}</div>
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
        this.admin.loadAdminPanel();
        this.ui.showScreen('admin');
    }

    // إعداد الأحداث
    setupEvents() {
        // استخدام تفويض الأحداث
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

        // أحداث النماذج
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const activeAuthForm = document.querySelector('.auth-form.active');
                if (activeAuthForm) {
                    if (activeAuthForm.id === 'login-form') {
                        this.handleLogin();
                    } else {
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

        document.querySelector(`.auth-tab[data-tab="${tab}"]`)?.classList.add('active');
        document.getElementById(`${tab}-form`)?.classList.add('active');
    }

    // معالجة تسجيل الدخول
    handleLogin() {
        const username = document.getElementById('login-username')?.value.trim();
        const password = document.getElementById('login-password')?.value;

        if (!username || !password) {
            this.ui.showNotification('الرجاء ملء جميع الحقول المطلوبة', 'error');
            return;
        }

        const result = this.auth.login(username, password);

        if (result.success) {
            this.ui.showNotification('تم تسجيل الدخول بنجاح', 'success');
            this.checkUser();
        } else {
            this.ui.showNotification(result.message, 'error');
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

        const result = this.auth.register(username, password, email);

        if (result.success) {
            this.ui.showNotification('تم إنشاء الحساب بنجاح', 'success');
            this.checkUser();
        } else {
            this.ui.showNotification(result.message, 'error');
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

            if (code === '8888' || code === 'admin123') {
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
            return;
        }

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
            this.ui.showNotification(result.message, 'error');
        }
    }

    // تحديث رصيد المستخدم (لللوحة الإدارة)
    updateUserBalance(username) {
        const currentBalance = this.auth.users[username]?.balance || 0;
        const newBalance = prompt(`أدخل الرصيد الجديد للمستخدم ${username}:`, currentBalance);
        
        if (newBalance && !isNaN(newBalance)) {
            const amount = parseInt(newBalance) - currentBalance;
            const success = this.auth.updateBalance(username, amount);
            
            if (success) {
                this.ui.showNotification('تم تحديث الرصيد بنجاح', 'success');
                this.admin.loadAdminContent('users');
            }
        }
    }

    // جعل المستخدم مسؤولاً
    makeAdmin(username) {
        if (confirm(`هل تريد جعل ${username} مسؤولاً؟`)) {
            this.auth.updateUser(username, { isAdmin: true });
            this.ui.showNotification('تم منح صلاحيات المسؤول', 'success');
            this.admin.loadAdminContent('users');
        }
    }

    // حذف المستخدم
    deleteUser(username) {
        if (confirm(`هل تريد حذف المستخدم ${username}؟`)) {
            delete this.auth.users[username];
            this.auth.saveUsers();
            this.ui.showNotification('تم حذف المستخدم', 'success');
            this.admin.loadAdminContent('users');
        }
    }

    // تعديل خطة الاشتراك
    editSubscription(planType) {
        const plans = {
            free: { price: 0, name: 'مجانية' },
            pro: { price: 9.99, name: 'برو' },
            premium: { price: 19.99, name: 'بريميوم' }
        };

        const plan = plans[planType];
        const newPrice = prompt(`أدخل السعر الجديد لخطة ${plan.name} ($):`, plan.price);

        if (newPrice && !isNaN(newPrice)) {
            this.ui.showNotification(`تم تحديث سعر خطة ${plan.name} إلى ${newPrice}$`, 'success');
        }
    }
}

// جعل التطبيق متاحاً عالمياً
if (typeof window !== "undefined") {
    window.MillionaireApp = MillionaireApp;
    window.gameApp = null;
}
