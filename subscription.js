// subscription.js - النسخة المبسطة
class SubscriptionManager {
    constructor(game) {
        this.game = game;
        this.isPremium = false;
        this.checkPremiumStatus();
    }

    // التحقق من حالة الاشتراك
    checkPremiumStatus() {
        const saved = localStorage.getItem('millionaire_premium');
        if (saved) {
            const data = JSON.parse(saved);
            const expiry = new Date(data.expiry);
            
            if (expiry > new Date()) {
                this.isPremium = true;
                this.game.state.isPremium = true;
                this.showPremiumBadge();
            } else {
                // انتهاء الاشتراك
                localStorage.removeItem('millionaire_premium');
            }
        }
    }

    // عرض شارة الاشتراك
    showPremiumBadge() {
        const badge = document.getElementById('premium-indicator');
        if (badge) {
            badge.style.display = 'inline-flex';
        }
    }

    // عرض نافذة الاشتراك
    showSubscriptionModal() {
        const modal = document.createElement('div');
        modal.className = 'subscription-modal';
        modal.innerHTML = `
            <div class="subscription-content">
                <div class="subscription-header">
                    <div class="gold-crown">
                        <i class="fas fa-crown"></i>
                    </div>
                    <h2>النسخة المميزة</h2>
                    <p>أزل الإعلانات واستمبل بلعبة خالية من المزعجات</p>
                </div>

                <div class="plan-card popular">
                    <div class="popular-badge">الأكثر اختياراً</div>
                    <h3>الاشتراك الشهري</h3>
                    <div class="plan-price">
                        <span class="price">9.99</span>
                        <span class="currency">$</span>
                        <span class="period">/شهر</span>
                    </div>
                    
                    <ul class="plan-features">
                        <li><i class="fas fa-check"></i> إزالة جميع الإعلانات</li>
                        <li><i class="fas fa-check"></i> أدوات مساعدة إضافية</li>
                        <li><i class="fas fa-check"></i> خلفيات حصرية</li>
                        <li><i class="fas fa-check"></i> دعم فني متميز</li>
                    </ul>
                    
                    <button class="subscribe-btn" id="subscribe-monthly">
                        <i class="fas fa-gem"></i>
                        اشترك الآن
                    </button>
                </div>

                <div class="subscription-footer">
                    <p class="terms">
                        <i class="fas fa-shield-alt"></i>
                        الدفع آمن. يمكنك الإلغاء في أي وقت.
                    </p>
                    <button class="close-subscription">
                        <i class="fas fa-times"></i> إغلاق
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // زر الاشتراك
        document.getElementById('subscribe-monthly').addEventListener('click', () => {
            this.processSubscription();
        });

        // إغلاق النافذة
        modal.querySelector('.close-subscription').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // معالجة الاشتراك
    processSubscription() {
        // محاكاة عملية الدفع
        this.showPaymentProcessing();
        
        setTimeout(() => {
            // بعد 2 ثانية نجاح الدفع
            this.activatePremium();
            
            // إخفاء جميع النوافذ
            document.querySelectorAll('.subscription-modal, .payment-processing').forEach(el => {
                if (el) el.remove();
            });
            
            this.game.showNotification('🎉 تم تفعيل الاشتراك المميز بنجاح!', 'success');
        }, 2000);
    }

    // عرض شاشة معالجة الدفع
    showPaymentProcessing() {
        const processing = document.createElement('div');
        processing.className = 'payment-processing';
        processing.innerHTML = `
            <div class="processing-content">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <h3>جاري معالجة الدفع...</h3>
                <p>يرجى الانتظار، العملية تستغرق بضع ثواني</p>
                <div class="processing-steps">
                    <div class="step active"><i class="fas fa-shopping-cart"></i> تأكيد الطلب</div>
                    <div class="step"><i class="fas fa-credit-card"></i> معالجة الدفع</div>
                    <div class="step"><i class="fas fa-check-circle"></i> التنشيط</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(processing);
    }

    // تفعيل الاشتراك المميز
    activatePremium() {
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 1); // شهر واحد
        
        const premiumData = {
            active: true,
            expiry: expiry.toISOString(),
            plan: 'monthly',
            activated: new Date().toISOString()
        };
        
        localStorage.setItem('millionaire_premium', JSON.stringify(premiumData));
        
        this.isPremium = true;
        this.game.state.isPremium = true;
        
        // تحديث الواجهة
        this.showPremiumBadge();
        
        // إعادة تعيين عداد الإعلانات
        if (this.game.adsManager) {
            this.game.adsManager.resetAdCounter();
        }
    }

    // التحقق من صلاحية الاشتراك
    checkAccess() {
        return this.isPremium;
    }
}

// CSS الإضافي
const subscriptionStyles = `
    /* نافذة الاشتراك */
    .subscription-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
        animation: fadeIn 0.3s ease;
    }

    .subscription-content {
        background: white;
        border-radius: 20px;
        padding: 30px;
        max-width: 400px;
        width: 100%;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        position: relative;
        animation: slideUp 0.4s ease;
    }

    @keyframes slideUp {
        from {
            transform: translateY(50px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .subscription-header {
        margin-bottom: 25px;
    }

    .gold-crown {
        font-size: 3.5rem;
        color: #FFD700;
        margin-bottom: 15px;
        animation: crownGlow 2s infinite;
    }

    @keyframes crownGlow {
        0%, 100% { 
            filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.5)); 
            transform: scale(1);
        }
        50% { 
            filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8)); 
            transform: scale(1.1);
        }
    }

    .subscription-content h2 {
        color: #2d3436;
        margin-bottom: 10px;
        font-size: 1.8rem;
    }

    .subscription-content p {
        color: #636e72;
        font-size: 1rem;
        line-height: 1.5;
    }

    /* بطاقة الخطة */
    .plan-card {
        background: white;
        border-radius: 15px;
        padding: 25px;
        border: 3px solid #dfe6e9;
        position: relative;
        margin-bottom: 20px;
        transition: all 0.3s ease;
    }

    .plan-card.popular {
        border-color: #FFD700;
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.05), white);
    }

    .popular-badge {
        position: absolute;
        top: -12px;
        right: 20px;
        background: #FFD700;
        color: #2d3436;
        padding: 6px 15px;
        border-radius: 20px;
        font-weight: 700;
        font-size: 0.8rem;
    }

    .plan-card h3 {
        color: #2d3436;
        margin-bottom: 15px;
        font-size: 1.3rem;
    }

    .plan-price {
        margin: 20px 0;
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: 5px;
    }

    .plan-price .price {
        font-size: 2.5rem;
        font-weight: 800;
        color: #2d3436;
    }

    .plan-price .currency {
        font-size: 1.2rem;
        font-weight: 600;
        color: #0984e3;
    }

    .plan-price .period {
        color: #636e72;
        font-size: 0.9rem;
    }

    .plan-features {
        list-style: none;
        padding: 0;
        margin: 20px 0;
        text-align: right;
    }

    .plan-features li {
        padding: 8px 0;
        border-bottom: 1px solid #f1f2f6;
        display: flex;
        align-items: center;
        gap: 10px;
        color: #2d3436;
        font-size: 0.9rem;
    }

    .plan-features li i {
        color: #00b894;
    }

    /* زر الاشتراك */
    .subscribe-btn {
        background: linear-gradient(135deg, #FFD700, #FF9500);
        color: #2d3436;
        border: none;
        border-radius: 12px;
        padding: 15px 30px;
        font-size: 1.1rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        width: 100%;
        margin-top: 15px;
    }

    .subscribe-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 25px rgba(255, 215, 0, 0.3);
    }

    .subscribe-btn:active {
        transform: scale(0.98);
    }

    /* تذييل النافذة */
    .subscription-footer {
        margin-top: 25px;
        padding-top: 20px;
        border-top: 2px solid #dfe6e9;
    }

    .terms {
        color: #636e72;
        font-size: 0.8rem;
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }

    .close-subscription {
        background: #dfe6e9;
        color: #2d3436;
        border: none;
        border-radius: 10px;
        padding: 10px 25px;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .close-subscription:hover {
        background: #b2bec3;
    }

    /* معالجة الدفع */
    .payment-processing {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
        animation: fadeIn 0.3s ease;
    }

    .processing-content {
        background: white;
        border-radius: 20px;
        padding: 30px;
        max-width: 400px;
        width: 90%;
        text-align: center;
    }

    .loading-spinner {
        font-size: 3rem;
        color: #0984e3;
        margin-bottom: 20px;
    }

    .processing-content h3 {
        color: #2d3436;
        margin-bottom: 10px;
        font-size: 1.5rem;
    }

    .processing-content p {
        color: #636e72;
        margin-bottom: 25px;
    }

    .processing-steps {
        display: flex;
        justify-content: space-between;
        margin-top: 30px;
        position: relative;
    }

    .processing-steps:before {
        content: '';
        position: absolute;
        top: 15px;
        left: 10%;
        right: 10%;
        height: 3px;
        background: #dfe6e9;
        z-index: 1;
    }

    .step {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        color: #b2bec3;
        font-size: 0.8rem;
    }

    .step i {
        background: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid #dfe6e9;
    }

    .step.active {
        color: #0984e3;
    }

    .step.active i {
        border-color: #0984e3;
        background: #0984e3;
        color: white;
    }

    /* شارة الاشتراك في الشريط */
    .premium-badge {
        background: linear-gradient(45deg, #FFD700, #FF9500);
        color: #2d3436;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.7rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        margin-right: 10px;
        animation: badgePulse 2s infinite;
    }

    @keyframes badgePulse {
        0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.4);
        }
        50% { 
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(255, 215, 0, 0);
        }
    }
`;

// إضافة الأنماط للصفحة
const styleSheet = document.createElement('style');
styleSheet.textContent = subscriptionStyles;
document.head.appendChild(styleSheet);
