/**
 * 🔐 نظام المصادقة - المليونير الذهبية
 * نظام تسجيل دخول وتسجيل كامل ومؤمن
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
        console.log('✅ نظام المصادقة جاهز');
    }
    
    /**
     * تحميل المستخدمين من التخزين المحلي
     */
    loadUsers() {
        try {
            const usersData = localStorage.getItem(GameConfig.STORAGE_KEYS.USERS);
            return usersData ? JSON.parse(usersData) : {};
        } catch (error) {
            console.error('❌ خطأ في تحميل المستخدمين:', error);
            return {};
        }
    }
    
    /**
     * حفظ المستخدمين في التخزين المحلي
     */
    saveUsers() {
        try {
            localStorage.setItem(GameConfig.STORAGE_KEYS.USERS, JSON.stringify(this.users));
            return true;
        } catch (error) {
            console.error('❌ خطأ في حفظ المستخدمين:', error);
            return false;
        }
    }
    
    /**
     * تسجيل مستخدم جديد
     */
    register(username, password, email = '', isAdmin = false) {
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
                message: 'اسم المستخدم موجود مسبقاً'
            };
        }
        
        // إنشاء مستخدم جديد
        const newUser = {
            id: 'user_' + Date.now(),
            username: username.trim(),
            password: this.hashPassword(password),
            email: email.trim(),
            isAdmin: isAdmin,
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
                vibration: true,
                notifications: true,
                theme: 'dark',
                language: 'ar'
            },
            balance: GameConfig.INITIAL_BALANCE,
            lifelines: GameConfig.INITIAL_LIFELINES,
            subscription: {
                type: 'free',
                adsEnabled: true,
                expiresAt: null
            },
            unlockedCategories: ['general']
        };
        
        // حفظ المستخدم
        this.users[username] = newUser;
        const saved = this.saveUsers();
        
        if (!saved) {
            return {
                success: false,
                message: 'خطأ في حفظ البيانات'
            };
        }
        
        // تسجيل الدخول تلقائياً
        return this.login(username, password);
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
                message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
            };
        }
        
        // التحقق من كلمة المرور
        const hashedPassword = this.hashPassword(password);
        if (user.password !== hashedPassword) {
            return {
                success: false,
                message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
            };
        }
        
        // تحديث وقت آخر دخول
        user.lastLogin = new Date().toISOString();
        this.users[username] = user;
        this.saveUsers();
        
        // حفظ بيانات الجلسة
        this.currentUser = user;
        this.saveSession(user);
        
        console.log(`✅ تم تسجيل الدخول: ${username}`);
        
        return {
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            user: user
        };
    }
    
    /**
     * تسجيل الخروج
     */
    logout() {
        this.clearSession();
        this.currentUser = null;
        console.log('✅ تم تسجيل الخروج');
        return {
            success: true,
            message: 'تم تسجيل الخروج بنجاح'
        };
    }
    
    /**
     * التحقق من الجلسة التلقائية
     */
    checkAutoLogin() {
        try {
            const sessionData = localStorage.getItem(GameConfig.STORAGE_KEYS.SESSION);
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
            console.error('❌ خطأ في الجلسة:', error);
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
        localStorage.setItem(GameConfig.STORAGE_KEYS.SESSION, JSON.stringify(session));
    }
    
    /**
     * مسح بيانات الجلسة
     */
    clearSession() {
        localStorage.removeItem(GameConfig.STORAGE_KEYS.SESSION);
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
                message: `اسم المستخدم يجب أن يكون ${GameConfig.SECURITY.USERNAME_MIN_LENGTH} أحرف على الأقل`
            };
        }
        
        if (username.trim().length > GameConfig.SECURITY.USERNAME_MAX_LENGTH) {
            return {
                isValid: false,
                message: `اسم المستخدم يجب ألا يتجاوز ${GameConfig.SECURITY.USERNAME_MAX_LENGTH} أحرف`
            };
        }
        
        // التحقق من كلمة المرور
        if (!password || password.length < GameConfig.SECURITY.PASSWORD_MIN_LENGTH) {
            return {
                isValid: false,
                message: `كلمة المرور يجب أن تكون ${GameConfig.SECURITY.PASSWORD_MIN_LENGTH} أحرف على الأقل`
            };
        }
        
        // التحقق من البريد الإلكتروني (اختياري)
        if (email && email.trim() !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                return {
                    isValid: false,
                    message: 'البريد الإلكتروني غير صحيح'
                };
            }
        }
        
        return {
            isValid: true,
            message: 'جميع البيانات صحيحة'
        };
    }
    
    /**
     * تشفير كلمة المرور
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
     * التحقق من صلاحيات المدير
     */
    isAdmin() {
        return this.currentUser && this.currentUser.isAdmin === true;
    }
    
    /**
     * تحديث رصيد المستخدم
     */
    updateBalance(username, amount) {
        const user = this.users[username];
        if (!user) return false;
        
        user.balance += amount;
        if (user.balance < 0) user.balance = 0;
        
        return this.updateUser(username, { balance: user.balance });
    }
    
    /**
     * الحصول على جميع المستخدمين (للمدير)
     */
    getAllUsers() {
        return Object.values(this.users);
    }
}

// التصدير للاستخدام
if (typeof window !== 'undefined') {
    window.AuthSystem = AuthSystem;
}
