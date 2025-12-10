/**
 * نظام الاشتراك والإعلانات المتكامل
 */

class SubscriptionManager {
    constructor(game) {
        this.game = game;
        this.isPremium = false;
        this.adsCounter = 0;
        this.maxAdsPerSession = 3;
        this.lastAdTime = 0;
        
        this.init();
    }
    
    /**
     * التهيئة
     */
    init() {
        this.checkSubscriptionStatus();
        this.setupEventListeners();
    }
    
    /**
     * التحقق من حالة الاشتراك
     */
    checkSubscriptionStatus() {
        try {
            const saved = localStorage.getItem('millionaire_premium');
            if (saved) {
                const data = JSON.parse(saved);
                
                // التحقق من تاريخ الانتهاء
                if (data.expiry && new Date(data.expiry) > new Date()) {
                    this.isPremium = true;
                    this.updatePremiumUI(true);
                    console.log('✅ اشتراك مميز مفعل');
                } else {
                    // اشتراك منتهي
                    localStorage.removeItem('millionaire_premium');
                    this.isPremium = false;
                    this.updatePremiumUI(false);
                }
            }
        } catch (error) {
            console.error('خطأ في تحميل حالة الاشتراك:', error);
        }
    }
    
    /**
     * تحديث واجهة الاشتراك
     */
    updatePremiumUI(isPremium) {
        const badge = document.getElementById('premium-badge');
        const subscribeBtn = document.querySelector('[data-action="subscribe"]');
        
        if (badge) {
            badge.classList.toggle('hidden', !isPremium);
        }
        
        if (subscribeBtn) {
            if (isPremium) {
                subscribeBtn.innerHTML = '<i class="fas fa-crown"></i> مميز';
                subscribeBtn.disabled = true;
            } else {
                subscribeBtn.innerHTML = '<i class="fas fa-gem"></i> اشترك';
                subscribeBtn.disabled = false;
            }
        }
    }
    
    /**
     * إعداد مستمعي الأحداث
     */
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-action="subscribe"]')) {
                this.showSubscriptionModal();
            }
            
            if (e.target.closest('[data-action="remove-ads"]')) {
                this.showSubscriptionModal();
            }
        });
    }
    
    /**
     * عرض نافذة الاشتراك
     */
    showSubscriptionModal() {
        const modalHTML = `
            <div class="modal-overlay active">
                <div class="modal">
                    <div class="modal-header">
                        <h3><i class="fas fa-crown"></i> النسخة المميزة</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="subscription-hero">
                            <div class="crown-icon">
                                <i class="fas fa-crown"></i>
                            </div>
                            <h4>استمتع بتجربة خالية من الإعلانات</h4>
                            <p>اشترك الآن واحصل على جميع المزايا الحصرية</p>
                        </div>
                        
                        <div class="plans-container">
                            <div class="plan-card popular">
                                <div class="plan-badge">الأكثر شهرة</div>
                                <h5>الاشتراك الشهري</h5>
                                <div class="plan-price">
                                    <span class="price">9.99</span>
                                    <span class="currency">$</span>
                                    <span class="period">/شهر</span>
                                </div>
                                
                                <ul class="plan-features">
                                    <li><i class="fas fa-check"></i> إزالة جميع الإعلانات</li>
                                    <li><i class="fas fa-check"></i> أدوات مساعدة إضافية</li>
                                    <li><i class="fas fa-check"></i> أسئلة حصرية</li>
                                    <li><i class="fas fa-check"></i> دعم مباشر</li>
                                </ul>
                                
                                <button class="btn btn-primary subscribe-btn" data-plan="monthly">
                                    <i class="fas fa-gem"></i> اشترك الآن
                                </button>
                            </div>
                            
                            <div class="plan-card">
                                <h5>الاشتراك السنوي</h5>
                                <div class="plan-price">
                                    <span class="price">99.99</span>
                                    <span class="currency">$</span>
                                    <span class="period">/سنة</span>
                                </div>
                                <p class="plan-save">وفر 20%</p>
                                
                                <ul class="plan-features">
                                    <li><i class="fas fa-check"></i> جميع مزايا الاشتراك الشهري</li>
                                    <li><i class="fas fa-check"></i> أسئلة حصرية متجددة</li>
                                    <li><i class="fas fa-check"></i> أولوية الدعم</li>
                                </ul>
                                
                                <button class="btn btn-secondary subscribe-btn" data-plan="yearly">
                                    <i class="fas fa-gem"></i> اشترك سنوياً
                                </button>
                            </div>
                        </div>
                        
                        <div class="subscription-footer">
                            <p class="terms">
                                <i class="fas fa-shield-alt"></i> الدفع آمن ومشفر. يمكنك الإلغاء في أي وقت.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const modalContainer = document.getElementById('modals-container');
        modalContainer.innerHTML = modalHTML;
        
        // إضافة الأحداث
        const overlay = modalContainer.querySelector('.modal-overlay');
        const closeBtn = modalContainer.querySelector('.modal-close');
        const subscribeBtns = modalContainer.querySelectorAll('.subscribe-btn');
        
        closeBtn.addEventListener('click', () => {
            overlay.classList.remove('active');
            setTimeout(() => modalContainer.innerHTML = '', 300);
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
                setTimeout(() => modalContainer.innerHTML = '', 300);
            }
        });
        
        subscribeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const plan = btn.dataset.plan;
                this.processSubscription(plan);
            });
        });
    }
    
    /**
     * معالجة الاشتراك
     */
    processSubscription(plan) {
        // في الإنتاج: الاتصال ببوابة الدفع
        // هنا: محاكاة عملية الدفع
        
        this.showPaymentProcessing();
        
        setTimeout(() => {
            this.activateSubscription(plan);
            
            // إغلاق النوافذ
            document.querySelector('.modal-overlay')?.remove();
            document.querySelector('.payment-processing')?.remove();
            
            // عرض رسالة النجاح
            this.showNotification('تم تفعيل الاشتراك المميز بنجاح!', 'success');
        }, 2000);
    }
    
    /**
     * عرض شاشة معالجة الدفع
     */
    showPaymentProcessing() {
        const processingHTML = `
            <div class="payment-processing">
                <div class="processing-content">
                    <div class="spinner">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                    <h4>جاري معالجة الدفع...</h4>
                    <p>يرجى الانتظار، العملية تستغرق بضع ثوانٍ</p>
                    
                    <div class="processing-steps">
                        <div class="step active">
                            <i class="fas fa-shopping-cart"></i>
                            <span>الطلب</span>
                        </div>
                        <div class="step">
                            <i class="fas fa-credit-card"></i>
                            <span>الدفع</span>
                        </div>
                        <div class="step">
                            <i class="fas fa-check-circle"></i>
                            <span>التأكيد</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', processingHTML);
    }
    
    /**
     * تفعيل الاشتراك
     */
    activateSubscription(plan) {
        const expiryDate = new Date();
        
        if (plan === 'monthly') {
            expiryDate.setMonth(expiryDate.getMonth() + 1);
        } else {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        }
        
        const subscriptionData = {
            plan: plan,
            price: plan === 'monthly' ? 9.99 : 99.99,
            expiry: expiryDate.toISOString(),
            activated: new Date().toISOString()
        };
        
        // حفظ في التخزين المحلي
        localStorage.setItem('millionaire_premium', JSON.stringify(subscriptionData));
        
        // تحديث الحالة
        this.isPremium = true;
        this.updatePremiumUI(true);
        
        // إعادة تعيين عداد الإعلانات
        this.adsCounter = 0;
        
        // إرسال إشعار
        if (this.game && typeof this.game.showNotification === 'function') {
            this.game.showNotification('🎉 تم تفعيل الاشتراك المميز!', 'success');
        }
    }
    
    /**
     * التحقق مما إذا كان يمكن عرض إعلان
     */
    canShowAd() {
        if (this.isPremium) return false;
        if (this.adsCounter >= this.maxAdsPerSession) return false;
        
        const now = Date.now();
        if (now - this.lastAdTime < 60000) return false; // دقيقة بين الإعلانات
        
        return true;
    }
    
    /**
     * عرض إعلان
     */
    showAd(adType = 'skip') {
        if (!this.canShowAd()) {
            this.showAdLimitReached();
            return Promise.resolve(false);
        }
        
        return new Promise((resolve) => {
            this.showAdModal(adType, resolve);
        });
    }
    
    /**
     * عرض نافذة الإعلان
     */
    showAdModal(adType, callback) {
        const adTypes = {
            'skip': { reward: 'تخطي السؤال الحالي', duration: 15 },
            'lifeline': { reward: 'أداة مساعدة إضافية', duration: 20 },
            'coins': { reward: '1000 دينار إضافي', duration: 25 }
        };
        
        const adConfig = adTypes[adType] || adTypes.skip;
        
        const adHTML = `
            <div class="ad-modal">
                <div class="ad-header">
                    <i class="fas fa-ad"></i>
                    <h4>إعلان</h4>
                </div>
                
                <div class="ad-body">
                    <p class="ad-reward">
                        <i class="fas fa-gift"></i>
                        <span>ستحصل على: ${adConfig.reward}</span>
                    </p>
                    
                    <div class="ad-timer">
                        <div class="timer-circle">
                            <div class="timer-fill"></div>
                            <div class="timer-text">${adConfig.duration}</div>
                        </div>
                        <p>جاري تشغيل الإعلان</p>
                    </div>
                    
                    <div class="ad-actions">
                        <button class="btn btn-secondary skip-ad" disabled>
                            <i class="fas fa-forward"></i>
                            تخطي (5)
                        </button>
                        
                        <button class="btn btn-primary remove-ads">
                            <i class="fas fa-crown"></i>
                            إزالة الإعلانات
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        const modalContainer = document.getElementById('modals-container');
        modalContainer.innerHTML = adHTML;
        
        const adModal = modalContainer.querySelector('.ad-modal');
        const timerText = adModal.querySelector('.timer-text');
        const timerFill = adModal.querySelector('.timer-fill');
        const skipBtn = adModal.querySelector('.skip-ad');
        const removeBtn = adModal.querySelector('.remove-ads');
        
        let seconds = adConfig.duration;
        let skipSeconds = 5;
        const timerInterval = setInterval(() => {
            seconds--;
            timerText.textContent = seconds;
            
            // تحديث شريط التقدم
            const progress = ((adConfig.duration - seconds) / adConfig.duration) * 100;
            timerFill.style.width = `${progress}%`;
            
            // تحديث زر التخطي
            if (skipSeconds > 0) {
                skipSeconds--;
                skipBtn.innerHTML = `<i class="fas fa-forward"></i> تخطي (${skipSeconds})`;
                if (skipSeconds === 0) {
                    skipBtn.disabled = false;
                    skipBtn.innerHTML = '<i class="fas fa-forward"></i> تخطي';
                }
            }
            
            // انتهاء الوقت
            if (seconds <= 0) {
                clearInterval(timerInterval);
                this.handleAdComplete(adModal, adType, callback);
            }
        }, 1000);
        
        // أحداث الأزرار
        skipBtn.addEventListener('click', () => {
            if (skipSeconds > 0) return;
            clearInterval(timerInterval);
            adModal.remove();
            callback(false);
        });
        
        removeBtn.addEventListener('click', () => {
            clearInterval(timerInterval);
            adModal.remove();
            this.showSubscriptionModal();
            callback(false);
        });
    }
    
    /**
     * معالجة اكتمال الإعلان
     */
    handleAdComplete(adModal, adType, callback) {
        adModal.remove();
        
        this.adsCounter++;
        this.lastAdTime = Date.now();
        
        // تطبيق المكافأة
        this.applyAdReward(adType);
        
        callback(true);
    }
    
    /**
     * تطبيق مكافأة الإعلان
     */
    applyAdReward(adType) {
        if (!this.game) return;
        
        switch(adType) {
            case 'skip':
                if (typeof this.game.skipQuestion === 'function') {
                    this.game.skipQuestion();
                }
                break;
                
            case 'lifeline':
                if (typeof this.game.grantExtraLifeline === 'function') {
                    this.game.grantExtraLifeline();
                }
                break;
                
            case 'coins':
                if (this.game.state && this.game.state.player) {
                    this.game.state.player.score += 1000;
                    if (typeof this.game.updateUI === 'function') {
                        this.game.updateUI();
                    }
                }
                break;
        }
    }
    
    /**
     * عرض رسالة الوصول للحد الأقصى
     */
    showAdLimitReached() {
        this.showNotification('وصلت للحد الأقصى من الإعلانات في هذه الجلسة', 'warning');
    }
    
    /**
     * إظهار إشعار
     */
    showNotification(message, type = 'info') {
        const notificationHTML = `
            <div class="notification ${type}">
                <div class="notification-icon">
                    ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
                </div>
                <div class="notification-message">${message}</div>
            </div>
        `;
        
        const container = document.getElementById('notification-container');
        container.insertAdjacentHTML('afterbegin', notificationHTML);
        
        // إزالة الإشعار بعد 5 ثوانٍ
        setTimeout(() => {
            const notification = container.querySelector('.notification');
            if (notification) {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    /**
     * الحصول على معلومات الاشتراك
     */
    getSubscriptionInfo() {
        return {
            isPremium: this.isPremium,
            adsCounter: this.adsCounter,
            maxAds: this.maxAdsPerSession,
            adsRemaining: this.maxAdsPerSession - this.adsCounter
        };
    }
}

// التصديع
if (typeof window !== 'undefined') {
    window.SubscriptionManager = SubscriptionManager;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SubscriptionManager;
}
