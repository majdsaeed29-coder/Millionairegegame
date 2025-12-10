/**
 * نظام الأمان المحسن
 */

class SecurityManager {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.encryptionKey = this.generateEncryptionKey();
        this.attempts = [];
        this.securityEvents = [];
        
        this.initializeSecurity();
    }
    
    /**
     * تهيئة نظام الأمان
     */
    initializeSecurity() {
        this.setupActivityMonitoring();
        this.setupTamperDetection();
        this.logSecurityEvent('system_initialized');
    }
    
    /**
     * توليد مفتاح تشفير
     */
    generateEncryptionKey() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        return `millionaire_key_${timestamp}_${random}`;
    }
    
    /**
     * توليد معرف الجلسة
     */
    generateSessionId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9);
        const userAgentHash = this.hashString(navigator.userAgent.substring(0, 50));
        return `session_${timestamp}_${random}_${userAgentHash}`;
    }
    
    /**
     * دالة تجزئة نصية بسيطة
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }
    
    /**
     * إعداد مراقبة النشاط
     */
    setupActivityMonitoring() {
        let lastActivity = Date.now();
        
        // تحديث وقت النشاط
        const updateActivity = () => {
            lastActivity = Date.now();
        };
        
        // أحداث النشاط
        ['click', 'keypress', 'mousemove', 'scroll', 'touchstart'].forEach(event => {
            window.addEventListener(event, updateActivity, { passive: true });
        });
        
        // التحقق من الخمول كل دقيقة
        setInterval(() => {
            const idleTime = Date.now() - lastActivity;
            if (idleTime > 300000) { // 5 دقائق
                this.logSecurityEvent('user_idle', { idleTime });
            }
        }, 60000);
    }
    
    /**
     * إعداد كشف العبث
     */
    setupTamperDetection() {
        // حفظ القيم الأصلية
        const originalValues = {
            localStorage: {
                setItem: localStorage.setItem,
                getItem: localStorage.getItem,
                removeItem: localStorage.removeItem
            }
        };
        
        // مراقبة localStorage
        localStorage.setItem = (key, value) => {
            if (key.includes('millionaire')) {
                this.validateStorageData(key, value);
            }
            return originalValues.localStorage.setItem.call(localStorage, key, value);
        };
        
        // فحوصات دورية
        setInterval(() => {
            this.performSecurityChecks();
        }, 30000);
    }
    
    /**
     * التحقق من بيانات التخزين
     */
    validateStorageData(key, value) {
        try {
            // التحقق من البيانات المشفرة
            if (key.includes('_encrypted')) {
                const decrypted = this.decryptData(value);
                if (!decrypted) {
                    throw new Error('فشل فك التشفير');
                }
            }
            
            // التحقق من صيغة JSON
            if (value && typeof value === 'string') {
                JSON.parse(value);
            }
            
        } catch (error) {
            this.logSecurityEvent('storage_tamper_detected', { key, error: error.message });
            console.warn('⚠️ اكتشاف محاولة عبث في التخزين:', key);
        }
    }
    
    /**
     * إجراء فحوصات أمنية
     */
    performSecurityChecks() {
        const checks = [
            this.checkLocalStorageIntegrity(),
            this.checkTimeManipulation(),
            this.checkSuspiciousActivity()
        ];
        
        if (checks.some(check => check)) {
            this.handleSecurityThreat();
        }
    }
    
    /**
     * التحقق من سلامة localStorage
     */
    checkLocalStorageIntegrity() {
        try {
            // اختبار القراءة والكتابة
            const testKey = '__security_test__';
            const testValue = Math.random().toString(36);
            
            localStorage.setItem(testKey, testValue);
            const retrieved = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            
            return retrieved !== testValue;
        } catch (error) {
            return true;
        }
    }
    
    /**
     * التحقق من تلاعب بالوقت
     */
    checkTimeManipulation() {
        if (!this.lastCheckTime) {
            this.lastCheckTime = Date.now();
            this.lastPerformanceTime = performance.now();
            return false;
        }
        
        const currentTime = Date.now();
        const currentPerformance = performance.now();
        
        const realTimePassed = currentTime - this.lastCheckTime;
        const performanceTimePassed = currentPerformance - this.lastPerformanceTime;
        
        // السماح بفرق 10%
        const allowedDifference = realTimePassed * 0.1;
        
        const isManipulated = Math.abs(performanceTimePassed - realTimePassed) > allowedDifference;
        
        this.lastCheckTime = currentTime;
        this.lastPerformanceTime = currentPerformance;
        
        return isManipulated;
    }
    
    /**
     * التحقق من نشاط مريب
     */
    checkSuspiciousActivity() {
        const now = Date.now();
        const recentAttempts = this.attempts.filter(attempt => 
            now - attempt.time < 60000
        );
        
        return recentAttempts.length > 10;
    }
    
    /**
     * معالجة تهديد أمني
     */
    handleSecurityThreat() {
        this.logSecurityEvent('security_threat_detected');
        
        // مسح البيانات الحساسة
        this.clearSensitiveData();
        
        // عرض تحذير للمستخدم
        this.showSecurityAlert();
    }
    
    /**
     * مسح البيانات الحساسة
     */
    clearSensitiveData() {
        const sensitiveKeys = [
            'millionaire_player_data',
            'millionaire_premium',
            'millionaire_high_scores'
        ];
        
        sensitiveKeys.forEach(key => {
            localStorage.removeItem(key);
        });
    }
    
    /**
     * عرض تحذير أمني
     */
    showSecurityAlert() {
        const alertHTML = `
            <div class="security-alert">
                <div class="alert-content">
                    <i class="fas fa-shield-alt"></i>
                    <h4>تنبيه أمان</h4>
                    <p>تم اكتشاف نشاط غير عادي. تم مسح البيانات الحساسة لحماية حسابك.</p>
                    <button onclick="location.reload()" class="btn btn-primary">
                        إعادة تحميل
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', alertHTML);
    }
    
    /**
     * تسجيل حدث أمني
     */
    logSecurityEvent(event, data = {}) {
        const logEntry = {
            event,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            url: window.location.href,
            ...data
        };
        
        this.securityEvents.push(logEntry);
        
        // الاحتفاظ بآخر 100 حدث فقط
        if (this.securityEvents.length > 100) {
            this.securityEvents.shift();
        }
        
        // حفظ في localStorage (في الإنتاج، أرسل إلى الخادم)
        this.saveSecurityLogs();
    }
    
    /**
     * حفظ سجلات الأمان
     */
    saveSecurityLogs() {
        try {
            const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
            logs.push(...this.securityEvents.slice(-10));
            localStorage.setItem('security_logs', JSON.stringify(logs.slice(-50)));
        } catch (error) {
            console.error('فشل حفظ سجلات الأمان:', error);
        }
    }
    
    /**
     * تشفير البيانات
     */
    encryptData(data) {
        try {
            const jsonString = JSON.stringify({
                data,
                timestamp: Date.now(),
                sessionId: this.sessionId
            });
            
            // تشفير بسيط (في الإنتاج، استخدم Web Crypto API)
            let encrypted = '';
            for (let i = 0; i < jsonString.length; i++) {
                encrypted += String.fromCharCode(
                    jsonString.charCodeAt(i) ^ 
                    this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
                );
            }
            
            return btoa(encrypted);
        } catch (error) {
            console.error('فشل التشفير:', error);
            return null;
        }
    }
    
    /**
     * فك تشفير البيانات
     */
    decryptData(encryptedString) {
        try {
            const decoded = atob(encryptedString);
            let decrypted = '';
            
            for (let i = 0; i < decoded.length; i++) {
                decrypted += String.fromCharCode(
                    decoded.charCodeAt(i) ^ 
                    this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
                );
            }
            
            const parsed = JSON.parse(decrypted);
            
            // التحقق من الجلسة
            if (parsed.sessionId !== this.sessionId) {
                throw new Error('معرف الجلسة غير متطابق');
            }
            
            return parsed.data;
        } catch (error) {
            console.error('فشل فك التشفير:', error);
            return null;
        }
    }
    
    /**
     * التحقق من صحة الإدخال
     */
    validateInput(input, type = 'text') {
        const result = {
            isValid: true,
            errors: [],
            sanitized: input
        };
        
        if (typeof input !== 'string') {
            result.isValid = false;
            result.errors.push('الإدخال يجب أن يكون نصاً');
            return result;
        }
        
        switch (type) {
            case 'name':
                if (input.length < 2) {
                    result.isValid = false;
                    result.errors.push('الاسم قصير جداً');
                }
                if (input.length > 20) {
                    result.isValid = false;
                    result.errors.push('الاسم طويل جداً');
                }
                if (!/^[\u0600-\u06FF\s\d]+$/.test(input)) {
                    result.isValid = false;
                    result.errors.push('الاسم يحتوي على أحرف غير مسموحة');
                }
                result.sanitized = input.trim().substring(0, 20);
                break;
                
            case 'number':
                if (isNaN(input) || input === '') {
                    result.isValid = false;
                    result.errors.push('قيمة غير صالحة');
                }
                break;
        }
        
        return result;
    }
    
    /**
     * التحقق من نتيجة اللعبة
     */
    validateGameScore(score, time, answers) {
        const issues = [];
        
        // التحقق من النتيجة
        if (score < 0 || score > 10000000) {
            issues.push('نتيجة غير منطقية');
        }
        
        // التحقق من الوقت
        if (time < 0 || time > 3600) {
            issues.push('وقت غير منطقي');
        }
        
        // التحقق من الإجابات
        if (answers && Array.isArray(answers)) {
            const impossiblyFast = answers.some(answer => answer.time < 1);
            if (impossiblyFast) {
                issues.push('إجابات سريعة جداً');
            }
        }
        
        return {
            isValid: issues.length === 0,
            issues
        };
    }
    
    /**
     * الحصول على حالة الأمان
     */
    getSecurityStatus() {
        return {
            sessionId: this.sessionId,
            eventsCount: this.securityEvents.length,
            lastCheck: Date.now(),
            integrity: !this.checkLocalStorageIntegrity() && !this.checkTimeManipulation()
        };
    }
}

// التصديع
if (typeof window !== 'undefined') {
    window.SecurityManager = SecurityManager;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityManager;
}
