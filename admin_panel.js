/**
 * 👑 لوحة إدارة المليونير الذهبية
 * لوحة تحكم كاملة للمسؤولين
 */

class AdminPanel {
    constructor(appInstance) {
        this.app = appInstance;
        this.init();
    }
    
    /**
     * تهيئة لوحة الإدارة
     */
    init() {
        console.log('✅ لوحة الإدارة جاهزة');
    }
    
    /**
     * إنشاء مسؤول افتراضي (للاستخدام الأولي)
     */
    createDefaultAdmin() {
        const adminUsername = 'admin';
        const adminPassword = 'admin123';
        
        // التحقق من وجود المسؤول
        if (this.app.auth.users[adminUsername]) {
            console.log('المسؤول موجود بالفعل');
            return;
        }
        
        // إنشاء حساب المسؤول
        const result = this.app.auth.register(
            adminUsername,
            adminPassword,
            'admin@millionaire.com',
            true // isAdmin
        );
        
        if (result.success) {
            console.log('✅ تم إنشاء المسؤول الافتراضي');
            console.log('👤 المستخدم: admin');
            console.log('🔐 كلمة المرور: admin123');
        }
    }
    
    /**
     * تصدير جميع البيانات
     */
    exportAllData() {
        const data = {
            users: this.app.auth.users,
            questions: this.app.questions.categories,
            settings: {
                version: GameConfig.VERSION,
                exportDate: new Date().toISOString()
            }
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `millionaire_backup_${Date.now()}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        return exportFileDefaultName;
    }
    
    /**
     * استيراد البيانات
     */
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    // التحقق من صحة البيانات
                    if (!data.users || !data.questions) {
                        reject('ملف غير صالح');
                        return;
                    }
                    
                    // استيراد المستخدمين
                    this.app.auth.users = { ...this.app.auth.users, ...data.users };
                    this.app.auth.saveUsers();
                    
                    // استيراد الأسئلة
                    this.app.questions.categories = { ...this.app.questions.categories, ...data.questions };
                    this.app.questions.saveQuestions();
                    
                    resolve('تم استيراد البيانات بنجاح');
                    
                } catch (error) {
                    reject('خطأ في قراءة الملف: ' + error.message);
                }
            };
            
            reader.onerror = () => {
                reject('خطأ في قراءة الملف');
            };
            
            reader.readAsText(file);
        });
    }
    
    /**
     * إحصائيات النظام
     */
    getSystemStats() {
        const users = Object.values(this.app.auth.users);
        const questions = this.app.questions.getAllQuestions();
        
        const totalGames = users.reduce((sum, user) => sum + (user.stats?.gamesPlayed || 0), 0);
        const totalBalance = users.reduce((sum, user) => sum + (user.balance || 0), 0);
        const activeToday = users.filter(u => {
            const lastLogin = new Date(u.lastLogin);
            const today = new Date();
            return lastLogin.toDateString() === today.toDateString();
        }).length;
        
        return {
            totalUsers: users.length,
            totalAdmins: users.filter(u => u.isAdmin).length,
            totalQuestions: questions.length,
            totalGames: totalGames,
            totalBalance: totalBalance,
            activeToday: activeToday,
            averageLevel: users.reduce((sum, user) => sum + (user.stats?.level || 1), 0) / users.length || 1
        };
    }
    
    /**
     * إرسال إشعار لجميع المستخدمين
     */
    sendNotificationToAll(title, message) {
        // في تطبيق حقيقي، سيكون هنا كود لإرسال إشعارات push
        // هنا سنحفظها فقط في التخزين المحلي للمستخدمين
        
        const notification = {
            id: 'notification_' + Date.now(),
            title: title,
            message: message,
            date: new Date().toISOString(),
            read: false
        };
        
        // حفظ الإشعار في التخزين المحلي
        const notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
        notifications.push(notification);
        localStorage.setItem('admin_notifications', JSON.stringify(notifications));
        
        return {
            success: true,
            message: 'تم حفظ الإشعار',
            notification: notification
        };
    }
    
    /**
     * حذف المستخدمين القدامى
     */
    cleanupOldUsers(days = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const oldUsers = [];
        for (const username in this.app.auth.users) {
            const user = this.app.auth.users[username];
            const lastLogin = new Date(user.lastLogin);
            
            if (lastLogin < cutoffDate && !user.isAdmin && user.balance === 0) {
                oldUsers.push(username);
            }
        }
        
        // حذف المستخدمين
        oldUsers.forEach(username => {
            delete this.app.auth.users[username];
        });
        
        this.app.auth.saveUsers();
        
        return {
            deleted: oldUsers.length,
            users: oldUsers
        };
    }
    
    /**
     * إعادة تعيين النظام
     */
    resetSystem() {
        return new Promise((resolve) => {
            if (confirm('⚠️ تحذير: هذا سيحذف جميع البيانات. هل أنت متأكد؟')) {
                // حذف جميع البيانات
                localStorage.clear();
                
                // إعادة تحميل الصفحة
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
                
                resolve('تم إعادة تعيين النظام');
            } else {
                resolve('تم الإلغاء');
            }
        });
    }
}

// التصدير للاستخدام
if (typeof window !== 'undefined') {
    window.AdminPanel = AdminPanel;
}
