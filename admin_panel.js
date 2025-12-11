// 🔐 نظام المصادقة
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        console.log('✅ نظام المصادقة جاهز');
    }
    
    // تحميل المستخدمين
    loadUsers() {
        try {
            const data = localStorage.getItem(GameConfig.STORAGE_KEYS.USERS);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('❌ خطأ في تحميل المستخدمين:', error);
            return {};
        }
    }
    
    // حفظ المستخدمين
    saveUsers() {
        try {
            localStorage.setItem(GameConfig.STORAGE_KEYS.USERS, JSON.stringify(this.users));
            return true;
        } catch (error) {
            console.error('❌ خطأ في حفظ المستخدمين:', error);
            return false;
        }
    }
    
    // تسجيل مستخدم جديد
    register(username, password, email = '', isAdmin = false) {
        // التحقق من البيانات
        if (!username || username.length < 3) {
            return { success: false, message: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' };
        }
        
        if (!password || password.length < 6) {
            return { success: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
        }
        
        // التحقق من عدم وجود مستخدم بنفس الاسم
        if (this.users[username]) {
            return { success: false, message: 'اسم المستخدم موجود مسبقاً' };
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
                xpToNextLevel: 1000
            },
            balance: 1000,
            lifelines: 3,
            subscription: {
                type: 'free',
                adsEnabled: true,
                expiresAt: null
            }
        };
        
        // حفظ المستخدم
        this.users[username] = newUser;
        const saved = this.saveUsers();
        
        if (!saved) {
            return { success: false, message: 'خطأ في حفظ البيانات' };
        }
        
        // تسجيل الدخول تلقائياً
        return this.login(username, password);
    }
    
    // تسجيل الدخول
    login(username, password) {
        // البحث عن المستخدم
        const user = this.users[username];
        if (!user) {
            return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
        }
        
        // التحقق من كلمة المرور
        const hashedPassword = this.hashPassword(password);
        if (user.password !== hashedPassword) {
            return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
        }
        
        // تحديث وقت الدخول الأخير
        user.lastLogin = new Date().toISOString();
        this.users[username] = user;
        this.saveUsers();
        
        // حفظ الجلسة
        this.currentUser = user;
        this.saveSession(user);
        
        console.log(`✅ تم تسجيل الدخول: ${username}`);
        
        return {
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            user: user
        };
    }
    
    // تسجيل الخروج
    logout() {
        this.clearSession();
        this.currentUser = null;
        console.log('✅ تم تسجيل الخروج');
        return { success: true, message: 'تم تسجيل الخروج بنجاح' };
    }
    
    // حفظ الجلسة
    saveSession(user) {
        const session = {
            username: user.username,
            timestamp: Date.now()
        };
        localStorage.setItem(GameConfig.STORAGE_KEYS.SESSION, JSON.stringify(session));
    }
    
    // مسح الجلسة
    clearSession() {
        localStorage.removeItem(GameConfig.STORAGE_KEYS.SESSION);
    }
    
    // التحقق من الجلسة التلقائية
    checkAutoLogin() {
        try {
            const sessionData = localStorage.getItem(GameConfig.STORAGE_KEYS.SESSION);
            if (sessionData) {
                const session = JSON.parse(sessionData);
                const user = this.users[session.username];
                
                if (user) {
                    // الجلسة صالحة لمدة 7 أيام
                    const sessionAge = Date.now() - session.timestamp;
                    const weekInMs = 7 * 24 * 60 * 60 * 1000;
                    
                    if (sessionAge < weekInMs) {
                        this.currentUser = user;
                        return true;
                    }
                }
                
                this.clearSession();
            }
        } catch (error) {
            console.error('❌ خطأ في الجلسة:', error);
        }
        
        return false;
    }
    
    // تشفير كلمة المرور (بسيط للأغراض التعليمية)
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36) + password.length.toString();
    }
    
    // الحصول على المستخدم الحالي
    getCurrentUser() {
        return this.currentUser;
    }
    
    // التحقق من تسجيل الدخول
    isLoggedIn() {
        return this.currentUser !== null;
    }
    
    // التحقق من صلاحيات المدير
    isAdmin() {
        return this.currentUser && this.currentUser.isAdmin === true;
    }
    
    // تحديث بيانات المستخدم
    updateUser(username, updates) {
        if (!this.users[username]) return false;
        
        this.users[username] = { ...this.users[username], ...updates };
        
        if (this.currentUser && this.currentUser.username === username) {
            this.currentUser = this.users[username];
        }
        
        return this.saveUsers();
    }
    
    // الحصول على جميع المستخدمين
    getAllUsers() {
        return Object.values(this.users);
    }
    
    // تحديث رصيد المستخدم
    updateBalance(username, amount) {
        const user = this.users[username];
        if (!user) return false;
        
        user.balance += amount;
        return this.updateUser(username, { balance: user.balance });
    }
}

// جعلها متاحة عالمياً
if (typeof window !== 'undefined') {
    window.AuthSystem = AuthSystem;
}
