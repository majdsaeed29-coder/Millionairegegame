// ===== نظام الإعلانات =====
class AdManager {
    constructor(game) {
        this.game = game;
        this.adCounter = 0;
        this.maxAdsPerSession = 3;
        this.adCooldown = 60; // ثانية بين الإعلانات
        this.lastAdTime = 0;
        
        // أنواع الإعلانات والمكافآت
        this.adTypes = {
            'skip': {
                name: 'تخطي السؤال',
                reward: 'تخطي السؤال الحالي',
                duration: 15
            },
            'lifeline': {
                name: 'أداة مساعدة',
                reward: 'أداة مساعدة إضافية',
                duration: 20
            },
            'coins': {
                name: 'عملات',
                reward: '1000 دينار إضافي',
                duration: 25
            }
        };
    }

    // عرض إعلان
    async showAd(adType) {
        // التحقق من الاشتراك المميز
        if (this.game.state.isPremium) {
            this.game.showNotification('أنت مشترك في النسخة المميزة، لا توجد إعلانات! 👑', 'success');
            return true;
        }

        // التحقق من الحد الأقصى للإعلانات
        if (this.adCounter >= this.maxAdsPerSession) {
            this.showMaxAdsReached();
            return false;
        }

        // التحقق من الوقت بين الإعلانات
        const now = Date.now();
        if (now - this.lastAdTime < this.adCooldown * 1000) {
            const remaining = Math.ceil((this.adCooldown * 1000 - (now - this.lastAdTime)) / 1000);
            this.game.showNotification(`انتظر ${remaining} ثواني قبل مشاهدة إعلان آخر ⏳`, 'warning');
            return false;
        }

        return new Promise((resolve) => {
            this.showAdModal(adType, resolve);
        });
    }

    // عرض نافذة الإعلان
    showAdModal(adType, callback) {
        const adConfig = this.adTypes[adType] || this.adTypes.skip;
        
        const modal = document.createElement('div');
        modal.className = 'ad-modal';
        modal.innerHTML = `
            <div class="ad-content">
                <div class="ad-header">
                    <i class="fas fa-ad"></i>
                    <h3>مشاهدة إعلان</h3>
                </div>
                
                <div class="ad-body">
                    <p class="ad-reward">
                        <i class="fas fa-gift"></i>
                        <span>ستحصل على: ${adConfig.reward}</span>
                    </p>
                    
                    <div class="ad-timer">
                        <div class="timer-circle">
                            <div class="timer-fill"></div>
                            <div class="timer-text" id="ad-timer">${adConfig.duration}</div>
                        </div>
                        <p class="timer-label">جاري تشغيل الإعلان...</p>
                    </div>
                    
                    <div class="ad-preview">
                        <div class="ad-placeholder">
                            <i class="fas fa-play-circle"></i>
                            <p>إعلان تجريبي - ${adConfig.duration} ثانية</p>
                            <div class="ad-progress">
                                <div class="progress-bar"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="ad-actions">
                        <button class="btn ad-skip" id="skip-ad">
                            <i class="fas fa-forward"></i>
                            <span>تخطي (5)</span>
                        </button>
                        
                        <button class="btn ad-premium" id="remove-ads">
                            <i class="fas fa-crown"></i>
                            <span>اشترك لإزالة الإعلانات</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // عداد الإعلان
        let seconds = adConfig.duration;
        let skipSeconds = 5;
        const timerElement = document.getElementById('ad-timer');
        const skipButton = document.getElementById('skip-ad');
        const progressBar = modal.querySelector('.progress-bar');
        
        const timer = setInterval(() => {
            seconds--;
            timerElement.textContent = seconds;
            
            // تحديث شريط التقدم
            const progress = ((adConfig.duration - seconds) / adConfig.duration) * 100;
            progressBar.style.width = progress + '%';
            
            // تحديث زر التخطي
            if (skipSeconds > 0) {
                skipSeconds--;
                skipButton.innerHTML = `<i class="fas fa-forward"></i><span>تخطي (${skipSeconds})</span>`;
                if (skipSeconds === 0) {
                    skipButton.disabled = false;
                    skipButton.innerHTML = `<i class="fas fa-forward"></i><span>تخطي</span>`;
                }
            }
            
            if (seconds <= 0) {
                clearInterval(timer);
                this.handleAdComplete(modal, adType, callback);
            }
        }, 1000);

        // زر تخطي الإعلان
        skipButton.addEventListener('click', () => {
            if (skipSeconds > 0) return;
            clearInterval(timer);
            modal.remove();
            this.game.showNotification('تم تخطي الإعلان، لم تحصل على المكافأة ❌', 'warning');
            callback(false);
        });

        // زر الاشتراك
        document.getElementById('remove-ads').addEventListener('click', () => {
            clearInterval(timer);
            modal.remove();
            this.game.showSubscriptionModal();
            callback(false);
        });

        // إغلاق النافذة
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                clearInterval(timer);
                modal.remove();
                callback(false);
            }
        });
    }

    // معالجة اكتمال الإعلان
    handleAdComplete(modal, adType, callback) {
        modal.remove();
        this.adCounter++;
        this.lastAdTime = Date.now();
        
        // تطبيق المكافأة
        this.applyReward(adType);
        
        // إظهار رسالة النجاح
        this.game.showNotification('تمت مشاهدة الإعلان بنجاح! 🎉', 'success');
        
        callback(true);
    }

    // تطبيق المكافأة
    applyReward(adType) {
        switch(adType) {
            case 'skip':
                this.game.skipQuestion();
                break;
            case 'lifeline':
                this.grantExtraLifeline();
                break;
            case 'coins':
                this.grantExtraCoins();
                break;
        }
    }

    // منح أداة مساعدة إضافية
    grantExtraLifeline() {
        // إعادة تفعيل أداة مساعدة مستخدمة
        const lifelines = Object.keys(this.game.elements.lifelines);
        const usedLifelines = this.game.state.game.lifelinesUsed;
        
        if (usedLifelines.length > 0) {
            const lifelineToRestore = usedLifelines[0];
            this.game.state.game.lifelinesUsed = usedLifelines.filter(l => l !== lifelineToRestore);
            this.game.elements.lifelines[lifelineToRestore].disabled = false;
            this.game.elements.lifelines[lifelineToRestore].style.opacity = '1';
            this.game.showNotification(`تم استعادة أداة ${this.getLifelineName(lifelineToRestore)}! 🛠️`, 'success');
        } else {
            this.game.state.player.score += 1000;
            this.game.showNotification('تم إضافة 1000 دينار إلى رصيدك! 💰', 'success');
        }
    }

    // منح عملات إضافية
    grantExtraCoins() {
        this.game.state.player.score += 1000;
        this.game.showNotification('تم إضافة 1000 دينار إلى رصيدك! 💰', 'success');
    }

    // الحصول على اسم أداة المساعدة
    getLifelineName(type) {
        const names = {
            '5050': '50:50',
            'call': 'اتصال بصديق',
            'audience': 'رأي الجمهور',
            'skip': 'تخطي السؤال'
        };
        return names[type] || 'أداة مساعدة';
    }

    // عرض رسالة الحد الأقصى للإعلانات
    showMaxAdsReached() {
        const modal = document.createElement('div');
        modal.className = 'ad-limit-modal';
        modal.innerHTML = `
            <div class="ad-limit-content">
                <div class="ad-limit-header">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>وصلت للحد الأقصى</h3>
                </div>
                
                <div class="ad-limit-body">
                    <p>لقد وصلت للحد الأقصى من الإعلانات في هذه الجلسة (${this.maxAdsPerSession} إعلانات).</p>
                    
                    <div class="ad-limit-options">
                        <div class="option-card">
                            <i class="fas fa-sync-alt"></i>
                            <h4>انتظر قليلاً</h4>
                            <p>يمكنك مشاهدة المزيد من الإعلانات لاحقاً</p>
                        </div>
                        
                        <div class="option-card premium">
                            <i class="fas fa-crown"></i>
                            <h4>اشترك الآن</h4>
                            <p>استمتع بلعبة خالية من الإعلانات</p>
                            <button class="btn premium-btn" id="subscribe-now">
                                <i class="fas fa-gem"></i>
                                <span>اشترك لإزالة الإعلانات</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // زر الاشتراك
        document.getElementById('subscribe-now').addEventListener('click', () => {
            modal.remove();
            this.game.showSubscriptionModal();
        });

        // إغلاق النافذة
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // إعادة تعيين عداد الإعلانات
    resetAdCounter() {
        this.adCounter = 0;
        this.lastAdTime = 0;
    }

    // الحصول على معلومات الإعلانات
    getAdInfo() {
        return {
            counter: this.adCounter,
            max: this.maxAdsPerSession,
            remaining: this.maxAdsPerSession - this.adCounter,
            cooldown: this.adCooldown,
            isPremium: this.game.state.isPremium
        };
    }
}
