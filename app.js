/**
 * 🎮 التطبيق الرئيسي - المليونير الذهبية
 * الإصدار 5.0 - مصحح بالكامل
 */

class MillionaireApp {
    constructor() {
        console.log('🚀 بدء تشغيل المليونير الذهبية...');
        this.init();
    }
    
    /**
     * تهيئة التطبيق
     */
    async init() {
        try {
            // إنشاء المسارات الأولى
            this.createInitialScreens();
            
            // تهيئة الأنظمة
            this.auth = new AuthSystem();
            this.questions = new QuestionManager();
            this.game = new GameEngine();
            this.ui = new UIManager(this);
            
            // التحقق من المستخدم
            this.checkUser();
            
            // إعداد الأحداث
            this.setupEvents();
            
            console.log('✅ التطبيق جاهز للاستخدام');
            
        } catch (error) {
            console.error('❌ خطأ في التهيئة:', error);
            this.showError('حدث خطأ في تحميل التطبيق. يرجى تحديث الصفحة.');
        }
    }
    
    /**
     * إنشاء الشاشات الأولية
     */
    createInitialScreens() {
        const appContainer = document.getElementById('app');
        
        // شاشة المصادقة
        appContainer.innerHTML = `
            <!-- شاشة المصادقة -->
            <div id="auth-screen" class="screen">
                <div class="auth-box">
                    <h1 style="text-align: center; color: #FFD700; margin-bottom: 30px; font-size: 2.5rem;">
                        <i class="fas fa-crown"></i> المليونير الذهبية
                    </h1>
                    
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
                            للمسؤولين: <a href="#" id="admin-login-link" style="color: #FFD700;">الدخول كمسؤول</a>
                        </p>
                    </form>
                    
                    <!-- نموذج التسجيل -->
                    <form id="register-form" class="auth-form">
                        <div class="form-group">
                            <label for="register-username"><i class="fas fa-user-plus"></i> اسم المستخدم</label>
                            <input type="text" id="register-username" class="form-control" placeholder="اختر اسم مستخدم فريد" required>
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
            
            <!-- القائمة الرئيسية (ستظهر لاحقاً) -->
            <div id="main-menu-screen" class="screen"></div>
            
            <!-- شاشة اللعبة (ستظهر لاحقاً) -->
            <div id="game-screen" class="screen"></div>
            
            <!-- شاشة الإدارة (ستظهر للمسؤولين) -->
            <div id="admin-screen" class="screen"></div>
            
            <!-- حاوية الإشعارات -->
            <div id="notification-container"></div>
            
            <!-- حاوية النوافذ -->
            <div id="modal-container"></div>
        `;
    }
    
    /**
     * التحقق من حالة المستخدم
     */
    checkUser() {
        if (this.auth.isLoggedIn()) {
            if (this.auth.isAdmin()) {
                this.showAdminPanel();
            } else {
                this.showMainMenu();
            }
        } else {
            this.showScreen('auth');
        }
    }
    
    /**
     * إظهار شاشة معينة
     */
    showScreen(screenName) {
        // إخفاء جميع الشاشات
        const screens = ['auth', 'main-menu', 'game', 'admin'];
        screens.forEach(screen => {
            const element = document.getElementById(`${screen}-screen`);
            if (element) {
                element.classList.remove('active');
            }
        });
        
        // إظهار الشاشة المطلوبة
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }
    
    /**
     * إظهار القائمة الرئيسية
     */
    showMainMenu() {
        const user = this.auth.getCurrentUser();
        if (!user) return;
        
        const menuScreen = document.getElementById('main-menu-screen');
        menuScreen.innerHTML = `
            <div class="menu-container">
                <div class="user-header">
                    <h1 class="user-welcome">مرحباً ${user.username}! 👋</h1>
                    <p style="color: #FFD700; font-size: 1.2rem;">استعد للفوز بمليون دولار!</p>
                    
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
                            <div class="stat-label">الألعاب</div>
                        </div>
                    </div>
                </div>
                
                <div class="menu-grid">
                    <div class="menu-card" id="play-btn">
                        <div class="menu-icon">🎮</div>
                        <h3>بدء لعبة جديدة</h3>
                        <p>ابدأ تحدي المليون دولار مع 15 سؤالاً متنوعاً</p>
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
                    
                    <div class="menu-card" id="settings-btn">
                        <div class="menu-icon">⚙️</div>
                        <h3>الإعدادات</h3>
                        <p>تخصيص الصوت، المظهر، وإعدادات اللعبة</p>
                    </div>
                    
                    <div class="menu-card" id="store-btn">
                        <div class="menu-icon">🛒</div>
                        <h3>المتجر</h3>
                        <p>اشترِ أدوات مساعدة أو اشتراكات مميزة</p>
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
        
        this.showScreen('main-menu');
    }
    
    /**
     * إعداد الأحداث
     */
    setupEvents() {
        // تفويض الأحداث
        document.addEventListener('click', (e) => {
            // تبويبات المصادقة
            if (e.target.classList.contains('auth-tab')) {
                const tab = e.target.dataset.tab;
                this.showAuthTab(tab);
            }
            
            // زر تسجيل الدخول
            if (e.target.closest('#login-form')) {
                const form = e.target.closest('#login-form');
                if (e.target.type === 'submit' || e.target.tagName === 'BUTTON') {
                    e.preventDefault();
                    this.handleLogin();
                }
            }
            
            // زر التسجيل
            if (e.target.closest('#register-form')) {
                const form = e.target.closest('#register-form');
                if (e.target.type === 'submit' || e.target.tagName === 'BUTTON') {
                    e.preventDefault();
                    this.handleRegister();
                }
            }
            
            // رابط دخول المسؤول
            if (e.target.id === 'admin-login-link') {
                e.preventDefault();
                this.showAdminLogin();
            }
        });
        
        // حدث Enter في حقول النماذج
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
    }
    
    /**
     * إظهار تبويب المصادقة
     */
    showAuthTab(tab) {
        // تحديث التبويبات
        document.querySelectorAll('.auth-tab').forEach(tabEl => {
            tabEl.classList.remove('active');
        });
        
        document.querySelector(`.auth-tab[data-tab="${tab}"]`).classList.add('active');
        
        // تحديث النماذج
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        
        document.getElementById(`${tab}-form`).classList.add('active');
    }
    
    /**
     * معالجة تسجيل الدخول
     */
    handleLogin() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        
        if (!username || !password) {
            this.showNotification('الرجاء ملء جميع الحقول', 'error');
            return;
        }
        
        const result = this.auth.login(username, password);
        
        if (result.success) {
            this.showNotification('تم تسجيل الدخول بنجاح', 'success');
            this.checkUser(); // سيظهر القائمة الرئيسية أو لوحة الإدارة
        } else {
            this.showNotification(result.message, 'error');
        }
    }
    
    /**
     * معالجة التسجيل
     */
    handleRegister() {
        const username = document.getElementById('register-username').value.trim();
        const password = document.getElementById('register-password').value;
        const email = document.getElementById('register-email').value.trim();
        
        if (!username || !password) {
            this.showNotification('الرجاء ملء جميع الحقول المطلوبة', 'error');
            return;
        }
        
        const result = this.auth.register(username, password, email);
        
        if (result.success) {
            this.showNotification('تم إنشاء الحساب بنجاح', 'success');
            this.checkUser();
        } else {
            this.showNotification(result.message, 'error');
        }
    }
    
    /**
     * عرض دخول المسؤول
     */
    showAdminLogin() {
        const modalContent = `
            <h3 style="color: #FFD700; margin-bottom: 20px;"><i class="fas fa-user-shield"></i> دخول المسؤول</h3>
            <div class="form-group">
                <label>اسم المستخدم</label>
                <input type="text" id="admin-username" class="form-control" placeholder="اسم المستخدم المسؤول">
            </div>
            <div class="form-group">
                <label>كلمة المرور</label>
                <input type="password" id="admin-password" class="form-control" placeholder="كلمة مرور المسؤول">
            </div>
            <div class="form-group">
                <label>كود التحقق</label>
                <input type="text" id="admin-code" class="form-control" placeholder="الكود السري">
            </div>
            <button id="confirm-admin-login" class="btn btn-primary" style="width: 100%;">
                <i class="fas fa-sign-in-alt"></i> الدخول كمسؤول
            </button>
        `;
        
        this.showModal('دخول المسؤول', modalContent);
        
        document.getElementById('confirm-admin-login').addEventListener('click', () => {
            const username = document.getElementById('admin-username').value;
            const password = document.getElementById('admin-password').value;
            const code = document.getElementById('admin-code').value;
            
            // كود التحقق البسيط
            if (code === 'admin123' || code === '8888') {
                const result = this.auth.login(username, password);
                if (result.success) {
                    this.closeModal();
                    this.showNotification('تم الدخول كمسؤول', 'success');
                    this.showAdminPanel();
                } else {
                    this.showNotification('بيانات الدخول غير صحيحة', 'error');
                }
            } else {
                this.showNotification('كود التحقق غير صحيح', 'error');
            }
        });
    }
    
    /**
     * عرض لوحة الإدارة
     */
    showAdminPanel() {
        if (!this.auth.isAdmin()) {
            this.showNotification('ليس لديك صلاحيات الدخول', 'error');
            return;
        }
        
        const adminScreen = document.getElementById('admin-screen');
        adminScreen.innerHTML = `
            <div class="admin-screen">
                <div class="admin-header">
                    <h1><i class="fas fa-cogs"></i> لوحة إدارة المليونير الذهبية</h1>
                    <button class="btn btn-secondary" id="back-to-menu">
                        <i class="fas fa-arrow-right"></i> العودة للقائمة
                    </button>
                </div>
                
                <div class="admin-tabs">
                    <button class="admin-tab active" data-tab="questions">📝 إدارة الأسئلة</button>
                    <button class="admin-tab" data-tab="users">👥 إدارة المستخدمين</button>
                    <button class="admin-tab" data-tab="payments">💰 إدارة المدفوعات</button>
                    <button class="admin-tab" data-tab="settings">⚙️ إعدادات التطبيق</button>
                </div>
                
                <div class="admin-content" id="admin-content">
                    <!-- سيتم تحميل المحتوى هنا -->
                </div>
            </div>
        `;
        
        this.showScreen('admin');
        this.loadAdminContent('questions');
        
        // أحداث التبويبات
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.loadAdminContent(tabName);
            });
        });
        
        // زر العودة
        document.getElementById('back-to-menu').addEventListener('click', () => {
            this.showMainMenu();
        });
    }
    
    /**
     * تحميل محتوى لوحة الإدارة
     */
    loadAdminContent(tabName) {
        const contentDiv = document.getElementById('admin-content');
        
        // تحديث التبويبات النشطة
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`.admin-tab[data-tab="${tabName}"]`).classList.add('active');
        
        switch(tabName) {
            case 'questions':
                this.loadQuestionsAdmin(contentDiv);
                break;
            case 'users':
                this.loadUsersAdmin(contentDiv);
                break;
            case 'payments':
                this.loadPaymentsAdmin(contentDiv);
                break;
            case 'settings':
                this.loadSettingsAdmin(contentDiv);
                break;
        }
    }
    
    /**
     * تحميل إدارة الأسئلة
     */
    loadQuestionsAdmin(container) {
        const questions = this.questions.getAllQuestions();
        
        container.innerHTML = `
            <div class="question-management">
                <h2><i class="fas fa-question-circle"></i> إدارة الأسئلة</h2>
                
                <div class="question-form">
                    <h3>إضافة سؤال جديد</h3>
                    
                    <div class="form-group">
                        <label>نص السؤال</label>
                        <textarea id="new-question-text" class="form-control" rows="3" placeholder="أدخل نص السؤال..."></textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>الإجابة 1</label>
                            <input type="text" id="answer-1" class="form-control" placeholder="الإجابة الأولى">
                        </div>
                        
                        <div class="form-group">
                            <label>الإجابة 2</label>
                            <input type="text" id="answer-2" class="form-control" placeholder="الإجابة الثانية">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>الإجابة 3</label>
                            <input type="text" id="answer-3" class="form-control" placeholder="الإجابة الثالثة">
                        </div>
                        
                        <div class="form-group">
                            <label>الإجابة 4</label>
                            <input type="text" id="answer-4" class="form-control" placeholder="الإجابة الرابعة">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>الإجابة الصحيحة</label>
                            <select id="correct-answer" class="form-control">
                                <option value="0">الإجابة 1</option>
                                <option value="1">الإجابة 2</option>
                                <option value="2">الإجابة 3</option>
                                <option value="3">الإجابة 4</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>التصنيف</label>
                            <select id="question-category" class="form-control">
                                ${GameConfig.CATEGORIES.map(cat => 
                                    `<option value="${cat.id}">${cat.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>مستوى الصعوبة</label>
                            <select id="question-difficulty" class="form-control">
                                <option value="easy">سهل</option>
                                <option value="medium">متوسط</option>
                                <option value="hard">صعب</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>نقاط السؤال</label>
                            <input type="number" id="question-points" class="form-control" value="100" min="10">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>تلميح (اختياري)</label>
                        <input type="text" id="question-hint" class="form-control" placeholder="تلميح للسؤال">
                    </div>
                    
                    <div class="form-group">
                        <label>شرح الإجابة (اختياري)</label>
                        <textarea id="question-explanation" class="form-control" rows="2" placeholder="شرح للإجابة الصحيحة..."></textarea>
                    </div>
                    
                    <button id="add-question-btn" class="btn btn-primary">
                        <i class="fas fa-plus"></i> إضافة السؤال
                    </button>
                </div>
                
                <div class="questions-list">
                    <h3 style="margin-top: 40px;">الأسئلة الحالية (${questions.length})</h3>
                    
                    <div style="margin-top: 20px;">
                        <input type="text" id="search-questions" class="form-control" placeholder="بحث في الأسئلة...">
                    </div>
                    
                    <div id="questions-container" style="margin-top: 20px;">
                        ${questions.map((q, index) => `
                            <div class="question-item">
                                <div>
                                    <strong>${q.question}</strong>
                                    <div style="color: #aaa; font-size: 0.9rem; margin-top: 5px;">
                                        ${q.category} | ${q.difficulty} | ${q.points} نقطة
                                    </div>
                                </div>
                                <div>
                                    <button class="btn btn-secondary edit-question" data-id="${q.id}" style="margin-left: 10px;">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-danger delete-question" data-id="${q.id}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        // حدث إضافة سؤال جديد
        document.getElementById('add-question-btn').addEventListener('click', () => {
            this.addNewQuestion();
        });
        
        // حدث البحث
        document.getElementById('search-questions').addEventListener('input', (e) => {
            this.searchQuestions(e.target.value);
        });
    }
    
    /**
     * إضافة سؤال جديد
     */
    addNewQuestion() {
        const question = {
            question: document.getElementById('new-question-text').value.trim(),
            answers: [
                document.getElementById('answer-1').value.trim(),
                document.getElementById('answer-2').value.trim(),
                document.getElementById('answer-3').value.trim(),
                document.getElementById('answer-4').value.trim()
            ],
            correct: parseInt(document.getElementById('correct-answer').value),
            category: document.getElementById('question-category').value,
            difficulty: document.getElementById('question-difficulty').value,
            points: parseInt(document.getElementById('question-points').value),
            hint: document.getElementById('question-hint').value.trim(),
            explanation: document.getElementById('question-explanation').value.trim()
        };
        
        // التحقق من البيانات
        if (!question.question || question.answers.some(a => !a)) {
            this.showNotification('الرجاء ملء جميع الحقول المطلوبة', 'error');
            return;
        }
        
        // إضافة السؤال
        const success = this.questions.addQuestion(question);
        
        if (success) {
            this.showNotification('تم إضافة السؤال بنجاح', 'success');
            this.loadAdminContent('questions'); // إعادة تحميل
        } else {
            this.showNotification('خطأ في إضافة السؤال', 'error');
        }
    }
    
    /**
     * البحث في الأسئلة
     */
    searchQuestions(query) {
        const questions = this.questions.searchQuestions(query);
        const container = document.getElementById('questions-container');
        
        if (!container) return;
        
        container.innerHTML = questions.map(q => `
            <div class="question-item">
                <div>
                    <strong>${q.question}</strong>
                    <div style="color: #aaa; font-size: 0.9rem; margin-top: 5px;">
                        ${q.category} | ${q.difficulty} | ${q.points} نقطة
                    </div>
                </div>
                <div>
                    <button class="btn btn-secondary edit-question" data-id="${q.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger delete-question" data-id="${q.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * تحميل إدارة المستخدمين
     */
    loadUsersAdmin(container) {
        const users = this.auth.getAllUsers();
        
        container.innerHTML = `
            <h2><i class="fas fa-users"></i> إدارة المستخدمين</h2>
            
            <div class="user-stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0;">
                <div style="background: rgba(52, 152, 219, 0.2); padding: 20px; border-radius: 10px;">
                    <div style="font-size: 2rem; color: #3498db;">${users.length}</div>
                    <div>إجمالي المستخدمين</div>
                </div>
                
                <div style="background: rgba(46, 204, 113, 0.2); padding: 20px; border-radius: 10px;">
                    <div style="font-size: 2rem; color: #2ecc71;">${users.filter(u => u.isAdmin).length}</div>
                    <div>المسؤولين</div>
                </div>
                
                <div style="background: rgba(155, 89, 182, 0.2); padding: 20px; border-radius: 10px;">
                    <div style="font-size: 2rem; color: #9b59b6;">${users.reduce((sum, u) => sum + u.balance, 0).toLocaleString()}</div>
                    <div>إجمالي الأرصدة</div>
                </div>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr style="background: rgba(212, 175, 55, 0.2);">
                        <th style="padding: 15px; text-align: right;">المستخدم</th>
                        <th style="padding: 15px; text-align: right;">البريد</th>
                        <th style="padding: 15px; text-align: right;">الرصيد</th>
                        <th style="padding: 15px; text-align: right;">المستوى</th>
                        <th style="padding: 15px; text-align: right;">صلاحيات</th>
                        <th style="padding: 15px; text-align: right;">الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <td style="padding: 15px;">
                                <strong>${user.username}</strong>
                                <div style="color: #aaa; font-size: 0.8rem;">
                                    ${new Date(user.createdAt).toLocaleDateString('ar-EG')}
                                </div>
                            </td>
                            <td style="padding: 15px;">${user.email || '-'}</td>
                            <td style="padding: 15px;">
                                <span style="color: #FFD700;">${user.balance.toLocaleString()} $</span>
                                <button class="btn btn-sm btn-secondary" onclick="gameApp.updateUserBalance('${user.username}')" style="margin-right: 10px;">
                                    تعديل
                                </button>
                            </td>
                            <td style="padding: 15px;">
                                <span style="background: #3498db; color: white; padding: 3px 10px; border-radius: 15px;">
                                    ${user.stats.level}
                                </span>
                            </td>
                            <td style="padding: 15px;">
                                ${user.isAdmin ? 
                                    '<span style="color: #e74c3c;"><i class="fas fa-crown"></i> مسؤول</span>' : 
                                    '<span style="color: #2ecc71;">مستخدم عادي</span>'
                                }
                            </td>
                            <td style="padding: 15px;">
                                <button class="btn btn-sm btn-danger" onclick="gameApp.deleteUser('${user.username}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                                ${!user.isAdmin ? `
                                    <button class="btn btn-sm btn-warning" onclick="gameApp.makeAdmin('${user.username}')" style="margin-right: 5px;">
                                        <i class="fas fa-user-shield"></i>
                                    </button>
                                ` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    /**
     * تحديث رصيد المستخدم
     */
    updateUserBalance(username) {
        const newBalance = prompt(`أدخل الرصيد الجديد للمستخدم ${username}:`, '1000');
        if (newBalance && !isNaN(newBalance)) {
            const amount = parseInt(newBalance);
            const currentBalance = this.auth.users[username]?.balance || 0;
            this.auth.updateBalance(username, amount - currentBalance);
            this.showNotification('تم تحديث الرصيد بنجاح', 'success');
            this.loadAdminContent('users');
        }
    }
    
    /**
     * جعل المستخدم مسؤولاً
     */
    makeAdmin(username) {
        if (confirm(`هل تريد جعل ${username} مسؤولاً؟`)) {
            this.auth.updateUser(username, { isAdmin: true });
            this.showNotification('تم منح صلاحيات المسؤول', 'success');
            this.loadAdminContent('users');
        }
    }
    
    /**
     * حذف المستخدم
     */
    deleteUser(username) {
        if (confirm(`هل تريد حذف المستخدم ${username}؟`)) {
            delete this.auth.users[username];
            this.auth.saveUsers();
            this.showNotification('تم حذف المستخدم', 'success');
            this.loadAdminContent('users');
        }
    }
    
    /**
     * تحميل إدارة المدفوعات
     */
    loadPaymentsAdmin(container) {
        container.innerHTML = `
            <h2><i class="fas fa-credit-card"></i> إدارة المدفوعات والاشتراكات</h2>
            
            <div class="payment-options" style="margin: 30px 0;">
                <h3>خطط الاشتراك</h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px;">
                    <!-- خطة مجانية -->
                    <div style="background: rgba(52, 152, 219, 0.1); padding: 25px; border-radius: 15px; border: 2px solid #3498db;">
                        <h4 style="color: #3498db;">🆓 مجاني</h4>
                        <div style="font-size: 2rem; color: white; margin: 15px 0;">0 $</div>
                        <ul style="list-style: none; padding: 0;">
                            <li style="margin: 10px 0;"><i class="fas fa-check" style="color: #2ecc71;"></i> لعب غير محدود</li>
                            <li style="margin: 10px 0;"><i class="fas fa-check" style="color: #2ecc71;"></i> إعلانات بين الأسئلة</li>
                            <li style="margin: 10px 0;"><i class="fas fa-times" style="color: #e74c3c;"></i> لا توجد أدوات مجانية</li>
                        </ul>
                        <button class="btn btn-primary" onclick="gameApp.editSubscriptionPlan('free')" style="width: 100%;">
                            تعديل الخطة
                        </button>
                    </div>
                    
                    <!-- خطة برو -->
                    <div style="background: rgba(212, 175, 55, 0.1); padding: 25px; border-radius: 15px; border: 2px solid #D4AF37;">
                        <h4 style="color: #FFD700;">⭐ برو</h4>
                        <div style="font-size: 2rem; color: white; margin: 15px 0;">9.99 $<span style="font-size: 1rem; color: #aaa;">/شهرياً</span></div>
                        <ul style="list-style: none; padding: 0;">
                            <li style="margin: 10px 0;"><i class="fas fa-check" style="color: #2ecc71;"></i> لا إعلانات</li>
                            <li style="margin: 10px 0;"><i class="fas fa-check" style="color: #2ecc71;"></i> 3 أدوات مساعدة مجانية</li>
                            <li style="margin: 10px 0;"><i class="fas fa-check" style="color: #2ecc71;"></i> إحصائيات متقدمة</li>
                        </ul>
                        <button class="btn btn-primary" onclick="gameApp.editSubscriptionPlan('pro')" style="width: 100%;">
                            تعديل الخطة
                        </button>
                    </div>
                    
                    <!-- خطة فخمة -->
                    <div style="background: rgba(155, 89, 182, 0.1); padding: 25px; border-radius: 15px; border: 2px solid #9b59b6;">
                        <h4 style="color: #9b59b6;">👑 فخمة</h4>
                        <div style="font-size: 2rem; color: white; margin: 15px 0;">19.99 $<span style="font-size: 1rem; color: #aaa;">/شهرياً</span></div>
                        <ul style="list-style: none; padding: 0;">
                            <li style="margin: 10px 0;"><i class="fas fa-check" style="color: #2ecc71;"></i> كل مميزات برو</li>
                            <li style="margin: 10px 0;"><i class="fas fa-check" style="color: #2ecc71;"></i> أدوات مساعدة غير محدودة</li>
                            <li style="margin: 10px 0;"><i class="fas fa-check" style="color: #2ecc71;"></i> تصنيفات متميزة</li>
                        </ul>
                        <button class="btn btn-primary" onclick="gameApp.editSubscriptionPlan('premium')" style="width: 100%;">
                            تعديل الخطة
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="payment-history" style="margin-top: 50px;">
                <h3>سجل المدفوعات</h3>
                <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 10px; margin-top: 20px;">
                    <p style="color: #aaa; text-align: center;">سيكون هنا سجل المدفوعات الفعلية عند ربط بوابة دفع</p>
                </div>
            </div>
        `;
    }
    
    /**
     * تعديل خطة الاشتراك
     */
    editSubscriptionPlan(planType) {
        const plans = {
            free: { price: 0, name: 'مجاني', features: ['لعب غير محدود', 'إعلانات بين الأسئلة'] },
            pro: { price: 9.99, name: 'برو', features: ['لا إعلانات', '3 أدوات مساعدة', 'إحصائيات متقدمة'] },
            premium: { price: 19.99, name: 'فخمة', features: ['كل مميزات برو', 'أدوات غير محدودة', 'تصنيفات متميزة'] }
        };
        
        const plan = plans[planType];
        
        const modalContent = `
            <h3 style="color: #FFD700; margin-bottom: 20px;">تعديل خطة "${plan.name}"</h3>
            
            <div class="form-group">
                <label>السعر ($)</label>
                <input type="number" id="plan-price" class="form-control" value="${plan.price}" step="0.01" min="0">
            </div>
            
            <div class="form-group">
                <label>اسم الخطة</label>
                <input type="text" id="plan-name" class="form-control" value="${plan.name}">
            </div>
            
            <div class="form-group">
                <label>المميزات (كل سطر لميزة)</label>
                <textarea id="plan-features" class="form-control" rows="4">${plan.features.join('\n')}</textarea>
            </div>
            
            <div class="form-group">
                <label>فترة الاشتراك</label>
                <select id="plan-duration" class="form-control">
                    <option value="monthly">شهري</option>
                    <option value="yearly">سنوي</option>
                    <option value="lifetime">مدى الحياة</option>
                </select>
            </div>
            
            <button id="save-plan" class="btn btn-primary" style="width: 100%;">
                <i class="fas fa-save"></i> حفظ التغييرات
            </button>
        `;
        
        this.showModal(`تعديل خطة ${plan.name}`, modalContent);
        
        document.getElementById('save-plan').addEventListener('click', () => {
            const price = parseFloat(document.getElementById('plan-price').value);
            const name = document.getElementById('plan-name').value;
            const features = document.getElementById('plan-features').value.split('\n');
            const duration = document.getElementById('plan-duration').value;
            
            // حفظ الإعدادات (في الواقع سيتم حفظها في قاعدة بيانات)
            localStorage.setItem(`subscription_plan_${planType}`, JSON.stringify({
                price, name, features, duration
            }));
            
            this.closeModal();
            this.showNotification('تم تحديث خطة الاشتراك بنجاح', 'success');
            this.loadAdminContent('payments');
        });
    }
    
    /**
     * تحميل إعدادات التطبيق
     */
    loadSettingsAdmin(container) {
        container.innerHTML = `
            <h2><i class="fas fa-cog"></i> إعدادات التطبيق</h2>
            
            <div class="app-settings" style="margin: 30px 0;">
                <div style="display: grid; gap: 25px;">
                    <!-- إعدادات اللعبة -->
                    <div class="setting-section">
                        <h3><i class="fas fa-gamepad"></i> إعدادات اللعبة</h3>
                        <div class="form-group">
                            <label>عدد الأسئلة في كل لعبة</label>
                            <input type="number" id="questions-per-game" class="form-control" value="15" min="5" max="50">
                        </div>
                        
                        <div class="form-group">
                            <label>الوقت لكل سؤال (بالثواني)</label>
                            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                                <div>
                                    <label style="font-size: 0.9rem;">سهل</label>
                                    <input type="number" id="time-easy" class="form-control" value="60">
                                </div>
                                <div>
                                    <label style="font-size: 0.9rem;">متوسط</label>
                                    <input type="number" id="time-medium" class="form-control" value="45">
                                </div>
                                <div>
                                    <label style="font-size: 0.9rem;">صعب</label>
                                    <input type="number" id="time-hard" class="form-control" value="30">
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="enable-timer" checked> تفعيل المؤقت
                            </label>
                        </div>
                    </div>
                    
                    <!-- إعدادات الإعلانات -->
                    <div class="setting-section">
                        <h3><i class="fas fa-ad"></i> إعدادات الإعلانات</h3>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="ads-enabled" checked> تفعيل الإعلانات
                            </label>
                        </div>
                        
                        <div class="form-group">
                            <label>عدد الإعلانات بين الأسئلة</label>
                            <input type="number" id="ads-frequency" class="form-control" value="3" min="0" max="10">
                        </div>
                        
                        <div class="form-group">
                            <label>رابط وحدة الإعلانات</label>
                            <input type="text" id="ads-unit-id" class="form-control" placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx">
                        </div>
                    </div>
                    
                    <!-- إعدادات النظام -->
                    <div class="setting-section">
                        <h3><i class="fas fa-server"></i> إعدادات النظام</h3>
                        <div class="form-group">
                            <label>حد المستخدمين الجدد يومياً</label>
                            <input type="number" id="max-new-users" class="form-control" value="1000">
                        </div>
                        
                        <div class="form-group">
                            <label>مدة جلسة المستخدم (بالساعات)</label>
                            <input type="number" id="session-duration" class="form-control" value="168" min="1">
                        </div>
                        
                        <div class="form-group">
                            <label>تفعيل وضع الصيانة</label>
                            <label class="switch">
                                <input type="checkbox" id="maintenance-mode">
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <!-- الحفظ -->
                    <div style="text-align: center; margin-top: 30px;">
                        <button id="save-settings" class="btn btn-primary" style="padding: 15px 50px; font-size: 1.2rem;">
                            <i class="fas fa-save"></i> حفظ جميع الإعدادات
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // حدث حفظ الإعدادات
        document.getElementById('save-settings').addEventListener('click', () => {
            const settings = {
                game: {
                    questionsPerGame: parseInt(document.getElementById('questions-per-game').value),
                    timeEasy: parseInt(document.getElementById('time-easy').value),
                    timeMedium: parseInt(document.getElementById('time-medium').value),
                    timeHard: parseInt(document.getElementById('time-hard').value),
                    enableTimer: document.getElementById('enable-timer').checked
                },
                ads: {
                    enabled: document.getElementById('ads-enabled').checked,
                    frequency: parseInt(document.getElementById('ads-frequency').value),
                    unitId: document.getElementById('ads-unit-id').value
                },
                system: {
                    maxNewUsers: parseInt(document.getElementById('max-new-users').value),
                    sessionDuration: parseInt(document.getElementById('session-duration').value),
                    maintenanceMode: document.getElementById('maintenance-mode').checked
                }
            };
            
            // حفظ الإعدادات
            localStorage.setItem('app_settings_admin', JSON.stringify(settings));
            this.showNotification('تم حفظ الإعدادات بنجاح', 'success');
        });
    }
    
    /**
     * إظهار إشعار
     */
    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.background = type === 'success' ? 'rgba(39, 174, 96, 0.9)' :
                                      type === 'error' ? 'rgba(231, 76, 60, 0.9)' :
                                      type === 'warning' ? 'rgba(241, 196, 15, 0.9)' :
                                      'rgba(52, 152, 219, 0.9)';
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="font-size: 1.5rem;">
                    ${type === 'success' ? '✅' : 
                      type === 'error' ? '❌' : 
                      type === 'warning' ? '⚠️' : 'ℹ️'}
                </div>
                <div>${message}</div>
            </div>
        `;
        
        container.appendChild(notification);
        
        // إزالة الإشعار بعد 5 ثواني
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.5s';
                setTimeout(() => notification.remove(), 500);
            }
        }, 5000);
    }
    
    /**
     * إظهار نافذة منبثقة
     */
    showModal(title, content) {
        const container = document.getElementById('modal-container');
        if (!container) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="color: #FFD700; margin: 0;">${title}</h3>
                    <button id="close-modal" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">
                        ×
                    </button>
                </div>
                <div>${content}</div>
            </div>
        `;
        
        container.appendChild(modal);
        
        // حدث الإغلاق
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeModal();
        });
        
        // إغلاق بالنقر خارج النافذة
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }
    
    /**
     * إغلاق النافذة المنبثقة
     */
    closeModal() {
        const container = document.getElementById('modal-container');
        if (!container) return;
        
        container.innerHTML = '';
    }
    
    /**
     * عرض رسالة خطأ
     */
    showError(message) {
        this.showNotification(message, 'error');
    }
}

// بدء التطبيق عند تحميل الصفحة
window.addEventListener('load', () => {
    if (!window.gameApp) {
        window.gameApp = new MillionaireApp();
    }
});
