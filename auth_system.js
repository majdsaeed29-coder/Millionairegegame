/**
 * نظام إدارة المستخدمين - ميليونير الذهبية
 * نظام تسجيل دخول وتسجيل حساب كامل
 */

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        this.init();
    }
    
    /**
     * تهيئة النظام
     */
    init() {
        this.checkAutoLogin();
        this.setupEventListeners();
    }
    
    /**
     * تحميل المستخدمين من التخزين المحلي
     */
    loadUsers() {
        try {
            const usersData = localStorage.getItem('millionaire_users');
            return usersData ? JSON.parse(usersData) : {};
        } catch (error) {
            console.error('خطأ في تحميل بيانات المستخدمين:', error);
            return {};
        }
    }
    
    /**
     * حفظ المستخدمين في التخزين المحلي
     */
    saveUsers() {
        try {
            localStorage.setItem('millionaire_users', JSON.stringify(this.users));
            return true;
        } catch (error) {
            console.error('خطأ في حفظ بيانات المستخدمين:', error);
            return false;
        }
    }
    
    /**
     * تسجيل مستخدم جديد
     */
    register(username, password, email = '') {
        // التحقق من صحة المدخلات
        const validation = this.validateRegistration(username, password, email);
        if (!validation.isValid) {
            return {
                success: false,
                message: validation.message
            };
        }
        
        // التحقق من عدم وجود مستخدم بنفس الاسم
        if (this.users[username]) {
            return {
                success: false,
                message: 'اسم المستخدم موجود مسبقاً!'
            };
        }
        
        // إنشاء مستخدم جديد
        const newUser = {
            username: username.trim(),
            password: this.hashPassword(password),
            email: email.trim(),
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            stats: {
                gamesPlayed: 0,
                totalWinnings: 0,
                correctAnswers: 0,
                totalQuestions: 0,
                highestScore: 0,
                level: 1,
                xp: 0,
                xpToNextLevel: 1000,
                achievements: [],
                badges: []
            },
            settings: {
                sound: true,
                music: true,
                vibrations: true,
                notifications: true,
                theme: 'dark',
                language: 'ar'
            },
            balance: GameConfig.INITIAL_BALANCE,
            lifelines: GameConfig.INITIAL_LIFELINES,
            unlockedCategories: ['general']
        };
        
        // حفظ المستخدم
        this.users[username] = newUser;
        const saved = this.saveUsers();
        
        if (!saved) {
            return {
                success: false,
                message: 'خطأ في حفظ البيانات!'
            };
        }
        
        // تسجيل الدخول تلقائياً
        this.login(username, password);
        
        return {
            success: true,
            message: 'تم إنشاء الحساب بنجاح! 🎉',
            user: newUser
        };
    }
    
    /**
     * تسجيل الدخول
     */
    login(username, password) {
        // التحقق من وجود المستخدم
        const user = this.users[username];
        if (!user) {
            return {
                success: false,
                message: 'اسم المستخدم أو كلمة السر غير صحيحة!'
            };
        }
        
        // التحقق من كلمة السر
        const hashedPassword = this.hashPassword(password);
        if (user.password !== hashedPassword) {
            return {
                success: false,
                message: 'اسم المستخدم أو كلمة السر غير صحيحة!'
            };
        }
        
        // تحديث وقت آخر دخول
        user.lastLogin = new Date().toISOString();
        this.users[username] = user;
        this.saveUsers();
        
        // حفظ بيانات الجلسة
        this.currentUser = user;
        this.saveSession(user);
        
        return {
            success: true,
            message: 'تم تسجيل الدخول بنجاح! 👋',
            user: user
        };
    }
    
    /**
     * تسجيل الخروج
     */
    logout() {
        this.clearSession();
        this.currentUser = null;
        return {
            success: true,
            message: 'تم تسجيل الخروج بنجاح!'
        };
    }
    
    /**
     * التحقق من الجلسة التلقائية
     */
    checkAutoLogin() {
        try {
            const sessionData = localStorage.getItem('millionaire_session');
            if (sessionData) {
                const session = JSON.parse(sessionData);
                const user = this.users[session.username];
                
                // التحقق من انتهاء صلاحية الجلسة
                const sessionAge = Date.now() - session.timestamp;
                const sessionValid = sessionAge < GameConfig.SECURITY.SESSION_TIMEOUT;
                
                if (user && sessionValid) {
                    this.currentUser = user;
                    return true;
                } else {
                    this.clearSession();
                }
            }
        } catch (error) {
            console.error('خطأ في التحقق من الجلسة:', error);
        }
        
        return false;
    }
    
    /**
     * حفظ بيانات الجلسة
     */
    saveSession(user) {
        const session = {
            username: user.username,
            timestamp: Date.now()
        };
        localStorage.setItem('millionaire_session', JSON.stringify(session));
    }
    
    /**
     * مسح بيانات الجلسة
     */
    clearSession() {
        localStorage.removeItem('millionaire_session');
    }
    
    /**
     * تحديث بيانات المستخدم
     */
    updateUser(username, updates) {
        if (!this.users[username]) {
            return false;
        }
        
        this.users[username] = {
            ...this.users[username],
            ...updates
        };
        
        // إذا كان المستخدم الحالي هو الذي تم تحديثه
        if (this.currentUser && this.currentUser.username === username) {
            this.currentUser = this.users[username];
        }
        
        return this.saveUsers();
    }
    
    /**
     * التحقق من صحة بيانات التسجيل
     */
    validateRegistration(username, password, email) {
        // التحقق من اسم المستخدم
        if (!username || username.trim().length < GameConfig.SECURITY.USERNAME_MIN_LENGTH) {
            return {
                isValid: false,
                message: `اسم المستخدم يجب أن يكون ${GameConfig.SECURITY.USERNAME_MIN_LENGTH} أحرف على الأقل!`
            };
        }
        
        if (username.trim().length > GameConfig.SECURITY.USERNAME_MAX_LENGTH) {
            return {
                isValid: false,
                message: `اسم المستخدم يجب ألا يتجاوز ${GameConfig.SECURITY.USERNAME_MAX_LENGTH} حرف!`
            };
        }
        
        if (!/^[a-zA-Z0-9_\u0600-\u06FF]+$/.test(username)) {
            return {
                isValid: false,
                message: 'اسم المستخدم يمكن أن يحتوي على أحرف عربية، إنجليزية، أرقام و _ فقط!'
            };
        }
        
        // التحقق من كلمة السر
        if (!password || password.length < GameConfig.SECURITY.PASSWORD_MIN_LENGTH) {
            return {
                isValid: false,
                message: `كلمة السر يجب أن تكون ${GameConfig.SECURITY.PASSWORD_MIN_LENGTH} أحرف على الأقل!`
            };
        }
        
        // التحقق من البريد الإلكتروني (اختياري)
        if (email && email.trim() !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                return {
                    isValid: false,
                    message: 'البريد الإلكتروني غير صحيح!'
                };
            }
        }
        
        return {
            isValid: true,
            message: 'جميع البيانات صحيحة!'
        };
    }
    
    /**
     * تشفير كلمة السر (نسخة مبسطة)
     */
    hashPassword(password) {
        // في الإنتاج الحقيقي، استخدم مكتبة مثل bcrypt.js
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36) + password.length.toString();
    }
    
    /**
     * الحصول على المستخدم الحالي
     */
    getCurrentUser() {
        return this.currentUser;
    }
    
    /**
     * التحقق من وجود مستخدم مسجل
     */
    isLoggedIn() {
        return this.currentUser !== null;
    }
    
    /**
     * إعداد مستمعي الأحداث
     */
    setupEventListeners() {
        // إعادة تحميل المستخدمين عند تحديث الصفحة
        window.addEventListener('beforeunload', () => {
            this.saveUsers();
        });
    }
}

// التصدير للاستخدام
if (typeof window !== 'undefined') {
    window.AuthSystem = AuthSystem;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthSystem;
}
