// ===== نظام الاشتراك المميز =====
class SubscriptionManager {
    constructor(game) {
        this.game = game;
        this.plans = {
            monthly: {
                id: 'monthly',
                name: 'اشتراك شهري',
                price: 9.99,
                currency: 'USD',
                period: 'شهر',
                features: [
                    'إزالة جميع الإعلانات',
                    '4 أدوات مساعدة إضافية',
                    'أسئلة حصرية',
                    'خلفيات مميزة',
                    'إحصائيات متقدمة'
                ],
                popular: true
            },
            yearly: {
                id: 'yearly',
                name: 'اشتراك سنوي',
                price: 99.99,
                currency: 'USD',
                period: 'سنة',
                discount: '20%',
                features: [
                    'كل ميزات الشهري',
                    '3 حيوات مجانية شهرياً',
                    'شارة مميزة في الملف',
                    'دعم مباشر',
                    'دخول البطولة السنوية'
                ]
            },
            lifetime: {
                id: 'lifetime',
                name: 'اشتراك دائم',
                price: 299.99,
                currency: 'USD',
                period: 'مدى الحياة',
                features: [
                    'كل الميزات مدى الحياة',
                    'دخول جميع البطولات',
                    'مستشار شخصي',
                    'تحديثات مجانية دائمة',
                    'رعاية خاصة'
                ]
            }
        };
        
        this.paymentMethods = [
            { id: 'visa', name: 'Visa', icon: 'fab fa-cc-visa' },
            { id: 'mastercard', name: 'MasterCard', icon: 'fab fa-cc-mastercard' },
            { id: 'paypal', name: 'PayPal', icon: 'fab fa-cc-paypal' },
            { id: 'applepay', name: 'Apple Pay', icon: 'fab fa-cc-apple-pay' },
            { id: 'googlepay', name: 'Google Pay', icon: 'fab fa-google-pay' },
            { id: 'stcpay', name: 'STC Pay', icon: 'fas fa-mobile-alt' }
        ];
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
                    <p>استمتع بتجربة خالية من الإعلانات وميزات حصرية</p>
                    
                    <div class="premium-badge">
                        <i class="fas fa-gem"></i>
                        <span>مميز</span>
                    </div>
                </div>
                
                <div class="subscription-plans" id="subscription-plans">
                    ${this.generatePlansHTML()}
                </div>
                
                <div class="subscription-features">
                    <h3><i class="fas fa-star"></i> مميزات الاشتراك</h3>
                    <div class="features-grid">
                        <div class="feature-item">
                            <i class="fas fa-ban"></i>
                            <span>لا إعلانات</span>
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-life-ring"></i>
                            <span>أدوات مساعدة إضافية</span>
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-question-circle"></i>
                            <span>أسئلة حصرية</span>
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-palette"></i>
                            <span>خلفيات مميزة</span>
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-chart-line"></i>
                            <span>إحصائيات متقدمة</span>
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-headset"></i>
                            <span>دعم فني متميز</span>
                        </div>
                    </div>
                </div>
                
                <div class="payment-methods">
                    <h3><i class="fas fa-credit-card"></i> طرق الدفع المتاحة</h3>
                    <div class="methods-grid">
                        ${this.generatePaymentMethodsHTML()}
                    </div>
                </div>
                
                <div class="subscription-footer">
                    <p class="terms">
                        <i class="fas fa-shield-alt"></i>
                        الدفع آمن ومشفر. يمكنك الإلغاء في أي وقت.
                    </p>
                    <p class="trial">
                        <i class="fas fa-gift"></i>
                        جرب 3 أيام مجاناً قبل الاشتراك!
                    </p>
                </div>
                
                <button class="close-subscription">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        // معالجة اختيار الخطة
        modal.querySelectorAll('.plan-card').forEach(card => {
            card.addEventListener('click', () => {
                modal.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            });
        });

        // زر الاشتراك
        modal.querySelectorAll('.subscribe-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const planId = btn.dataset.plan;
                this.processSubscription(planId, modal);
            });
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

    // توليد HTML للخطط
    generatePlansHTML() {
        let html = '';
        
        Object.values(this.plans).forEach(plan => {
            const monthlyPrice = plan.period === 'سنة' ? (plan.price / 12).toFixed(2) : plan.price;
            const discountBadge = plan.discount ? `<div class="discount-badge">توفير ${plan.discount}</div>` : '';
            
            html += `
                <div class="plan-card ${plan.popular ? 'popular' : ''}">
                    ${discountBadge}
                    <div class="plan-header">
                        <h3>${plan.name}</h3>
                        ${plan.popular ? '<div class="popular-badge">الأكثر شيوعاً</div>' : ''}
                    </div>
                    
                    <div class="plan-price">
                        <span class="price">${plan.price}</span>
                        <span class="currency">${plan.currency}</span>
                        <span class="period">/${plan.period}</span>
                    </div>
                    
                    ${plan.period === 'سنة' ? `
                        <p class="monthly-equivalent">
                            ≈ ${monthlyPrice} ${plan.currency}/شهر
                        </p>
                    ` : ''}
                    
                    <ul class="plan-features">
                        ${plan.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                    </ul>
                    
                    <button class="subscribe-btn" data-plan="${plan.id}">
                        <i class="fas fa-gem"></i>
                        <span>اشترك الآن</span>
                    </button>
                </div>
            `;
        });
        
        return html;
    }

    // توليد HTML لطرق الدفع
    generatePaymentMethodsHTML() {
        return this.paymentMethods.map(method => `
            <div class="method-item">
                <i class="${method.icon}"></i>
                <span>${method.name}</span>
            </div>
        `).join('');
    }

    // معالجة الاشتراك
    async processSubscription(planId, modal) {
        const plan = this.plans[planId];
        
        // عرض نافذة الدفع
        const paymentModal = document.createElement('div');
        paymentModal.className = 'payment-modal';
        paymentModal.innerHTML = `
            <div class="payment-content">
                <div class="payment-header">
                    <i class="fas fa-lock"></i>
                    <h3>إتمام عملية الدفع</h3>
                </div>
                
                <div class="payment-body">
                    <div class="payment-summary">
                        <div class="summary-item">
                            <span>الخطة:</span>
                            <span>${plan.name}</span>
                        </div>
                        <div class="summary-item">
                            <span>المبلغ:</span>
                            <span>${plan.price} ${plan.currency}</span>
                        </div>
                        <div class="summary-item">
                            <span>الفترة:</span>
                            <span>${plan.period}</span>
                        </div>
                        <div class="summary-item total">
                            <span>الإجمالي:</span>
                            <span class="total-amount">${plan.price} ${plan.currency}</span>
                        </div>
                    </div>
                    
                    <div class="payment-form">
                        <div class="form-group">
                            <label for="card-number">
                                <i class="fas fa-credit-card"></i>
                                رقم البطاقة
                            </label>
                            <input type="text" id="card-number" placeholder="1234 5678 9012 3456" maxlength="19">
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="expiry-date">
                                    <i class="fas fa-calendar-alt"></i>
                                    تاريخ الانتهاء
                                </label>
                                <input type="text" id="expiry-date" placeholder="MM/YY" maxlength="5">
                            </div>
                            
                            <div class="form-group">
                                <label for="cvv">
                                    <i class="fas fa-lock"></i>
                                    رمز الأمان
                                </label>
                                <input type="text" id="cvv" placeholder="123" maxlength="3">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="card-name">
                                <i class="fas fa-user"></i>
                                اسم حامل البطاقة
                            </label>
                            <input type="text" id="card-name" placeholder="الاسم كما هو مدون على البطاقة">
                        </div>
                        
                        <div class="form-check">
                            <input type="checkbox" id="save-card" checked>
                            <label for="save-card">حفظ بيانات البطاقة للمرة القادمة</label>
                        </div>
                    </div>
                    
                    <div class="payment-security">
                        <i class="fas fa-shield-alt"></i>
                        <span>
