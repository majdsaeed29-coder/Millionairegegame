// ملف واحد شامل يعمل مباشرة
(function() {
    console.log('🎮 المليونير الذهبي يبدأ...');
    
    // إعدادات اللعبة
    const GameSettings = {
        VERSION: '1.0.0',
        PRIZES: [100, 200, 300, 500, 1000, 2000, 5000, 10000, 16000, 32000, 64000, 128000, 256000, 500000, 1000000],
        QUESTIONS: [
            {
                question: 'ما هي عاصمة فرنسا؟',
                answers: ['روما', 'باريس', 'برلين', 'لندن'],
                correct: 1
            },
            {
                question: 'كم عدد أيام الأسبوع؟',
                answers: ['5', '6', '7', '8'],
                correct: 2
            },
            {
                question: 'ما هو لون التفاحة الناضجة؟',
                answers: ['أحمر', 'أصفر', 'أخضر', 'برتقالي'],
                correct: 0
            }
        ]
    };
    
    // التطبيق الرئيسي
    class MillionaireGame {
        constructor() {
            this.currentUser = null;
            this.score = 0;
            this.currentQuestion = 0;
            this.isPlaying = false;
            
            this.init();
        }
        
        init() {
            console.log('✅ التطبيق جاهز');
            this.setupUI();
            this.loadFromStorage();
        }
        
        setupUI() {
            // تحديث الواجهة
            this.updateUI();
            
            // إضافة الأحداث
            this.addEvents();
        }
        
        updateUI() {
            // تحديث النصوص
            const user = this.getCurrentUser();
            if (user) {
                document.getElementById('welcome-text')?.textContent = `مرحباً ${user.username}!`;
                document.getElementById('balance-text')?.textContent = `رصيدك: ${user.balance}$`;
            }
        }
        
        addEvents() {
            // الأحداث الأساسية
            document.getElementById('login-btn')?.addEventListener('click', () => this.handleLogin());
            document.getElementById('register-btn')?.addEventListener('click', () => this.handleRegister());
            document.getElementById('play-btn')?.addEventListener('click', () => this.startGame());
            document.getElementById('logout-btn')?.addEventListener('click', () => this.handleLogout());
        }
        
        handleLogin() {
            const username = document.getElementById('username')?.value.trim();
            const password = document.getElementById('password')?.value;
            
            if (!username || !password) {
                this.showAlert('أدخل اسم المستخدم وكلمة المرور');
                return;
            }
            
            // تسجيل دخول بسيط
            this.currentUser = {
                username: username,
                balance: 1000,
                level: 1
            };
            
            this.saveToStorage();
            this.showScreen('menu');
            this.showAlert(`مرحباً ${username}!`);
            this.updateUI();
        }
        
        handleRegister() {
            const username = document.getElementById('username')?.value.trim();
            const password = document.getElementById('password')?.value;
            
            if (!username || !password) {
                this.showAlert('أدخل بيانات التسجيل');
                return;
            }
            
            if (password.length < 4) {
                this.showAlert('كلمة المرور يجب أن تكون 4 أحرف على الأقل');
                return;
            }
            
            // تسجيل جديد
            this.currentUser = {
                username: username,
                balance: 500,
                level: 1,
                registered: new Date().toISOString()
            };
            
            this.saveToStorage();
            this.showScreen('menu');
            this.showAlert(`تم تسجيل ${username} بنجاح!`);
            this.updateUI();
        }
        
        handleLogout() {
            this.currentUser = null;
            this.showScreen('auth');
            this.showAlert('تم الخروج بنجاح');
        }
        
        startGame() {
            if (!this.currentUser) {
                this.showAlert('يجب تسجيل الدخول أولاً');
                this.showScreen('auth');
                return;
            }
            
            this.score = 0;
            this.currentQuestion = 0;
            this.isPlaying = true;
            
            this.showScreen('game');
            this.showQuestion();
        }
        
        showQuestion() {
            if (this.currentQuestion >= GameSettings.QUESTIONS.length) {
                this.endGame();
                return;
            }
            
            const question = GameSettings.QUESTIONS[this.currentQuestion];
            const prize = GameSettings.PRIZES[this.currentQuestion] || 100;
            
            // عرض السؤال
            const gameScreen = document.getElementById('game-screen');
            if (gameScreen) {
                gameScreen.innerHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <h2 style="color: #FFD700;">السؤال ${this.currentQuestion + 1}</h2>
                        <p style="font-size: 20px; margin: 30px 0;">${question.question}</p>
                        <p style="color: #FFD700; font-size: 24px;">الجائزة: ${prize}$</p>
                        
                        <div style="display: grid; gap: 10px; margin: 30px 0;">
                            ${question.answers.map((answer, index) => `
                                <button class="answer-btn" data-index="${index}" style="
                                    background: rgba(255,255,255,0.1);
                                    border: 2px solid #FFD700;
                                    color: white;
                                    padding: 15px;
                                    border-radius: 10px;
                                    font-size: 18px;
                                    cursor: pointer;">
                                    ${answer}
                                </button>
                            `).join('')}
                        </div>
                        
                        <div style="margin-top: 30px;">
                            <p style="color: #aaa;">الرصيد الحالي: ${this.score}$</p>
                            <button id="quit-game" style="
                                background: #e74c3c;
                                color: white;
                                border: none;
                                padding: 15px;
                                border-radius: 10px;
                                font-size: 16px;
                                cursor: pointer;">
                                إنهاء اللعبة
                            </button>
                        </div>
                    </div>
                `;
                
                // إضافة أحداث للإجابات
                document.querySelectorAll('.answer-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const selectedIndex = parseInt(e.target.dataset.index);
                        this.checkAnswer(selectedIndex);
                    });
                });
                
                // زر إنهاء اللعبة
                document.getElementById('quit-game').addEventListener('click', () => {
                    if (confirm('هل تريد إنهاء اللعبة؟')) {
                        this.endGame();
                    }
                });
            }
        }
        
        checkAnswer(selectedIndex) {
            const question = GameSettings.QUESTIONS[this.currentQuestion];
            const prize = GameSettings.PRIZES[this.currentQuestion] || 100;
            
            if (selectedIndex === question.correct) {
                // إجابة صحيحة
                this.score += prize;
                this.showAlert(`✅ إجابة صحيحة! ربحت ${prize}$`);
                
                // تحديث رصيد المستخدم
                if (this.currentUser) {
                    this.currentUser.balance += prize;
                }
                
                this.currentQuestion++;
                
                if (this.currentQuestion >= GameSettings.QUESTIONS.length) {
                    this.endGame();
                } else {
                    setTimeout(() => this.showQuestion(), 1500);
                }
            } else {
                // إجابة خاطئة
                this.showAlert('❌ إجابة خاطئة!');
                this.endGame();
            }
        }
        
        endGame() {
            this.isPlaying = false;
            
            // حفظ الرصيد الجديد
            if (this.currentUser) {
                this.saveToStorage();
            }
            
            // عرض النتائج
            const resultScreen = document.getElementById('results-screen');
            if (resultScreen) {
                resultScreen.innerHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <h1 style="color: #FFD700;">🎉 النتائج</h1>
                        <p style="font-size: 24px; margin: 20px 0;">الرصيد النهائي: ${this.score}$</p>
                        <p style="color: #aaa;">أجبت على ${this.currentQuestion} أسئلة</p>
                        
                        <div style="margin: 30px 0;">
                            <button id="play-again" style="
                                background: #FFD700;
                                color: black;
                                border: none;
                                padding: 15px 30px;
                                border-radius: 10px;
                                font-size: 18px;
                                cursor: pointer;
                                margin: 10px;">
                                لعب مرة أخرى
                            </button>
                            <button id="back-to-menu" style="
                                background: #4a69bd;
                                color: white;
                                border: none;
                                padding: 15px 30px;
                                border-radius: 10px;
                                font-size: 18px;
                                cursor: pointer;
                                margin: 10px;">
                                القائمة الرئيسية
                            </button>
                        </div>
                    </div>
                `;
                
                document.getElementById('play-again').addEventListener('click', () => {
                    this.startGame();
                });
                
                document.getElementById('back-to-menu').addEventListener('click', () => {
                    this.showScreen('menu');
                });
                
                this.showScreen('results');
            }
        }
        
        showScreen(screenName) {
            // إخفاء جميع الشاشات
            const screens = ['auth', 'menu', 'game', 'results'];
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
        
        showAlert(message) {
            // إنشاء نافذة تنبيه بسيطة
            const alertDiv = document.createElement('div');
            alertDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(30, 39, 46, 0.95);
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                border-right: 5px solid #FFD700;
                z-index: 10000;
                max-width: 300px;
                animation: slideIn 0.3s;
            `;
            
            alertDiv.textContent = message;
            document.body.appendChild(alertDiv);
            
            setTimeout(() => {
                alertDiv.style.opacity = '0';
                alertDiv.style.transition = 'opacity 0.5s';
                setTimeout(() => alertDiv.remove(), 500);
            }, 3000);
            
            // إضافة الـ CSS للـ animation
            if (!document.querySelector('#alert-style')) {
                const style = document.createElement('style');
                style.id = 'alert-style';
                style.textContent = `
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                `;
                document.head.appendChild(style);
            }
        }
        
        getCurrentUser() {
            return this.currentUser;
        }
        
        saveToStorage() {
            if (this.currentUser) {
                localStorage.setItem('millionaire_user', JSON.stringify(this.currentUser));
            }
        }
        
        loadFromStorage() {
            try {
                const saved = localStorage.getItem('millionaire_user');
                if (saved) {
                    this.currentUser = JSON.parse(saved);
                    this.showScreen('menu');
                    this.updateUI();
                }
            } catch (e) {
                console.log('لا يوجد بيانات محفوظة');
            }
        }
    }
    
    // بدء التطبيق عندما تكون الصفحة جاهزة
    window.addEventListener('DOMContentLoaded', () => {
        // إخفاء شاشة التحميل بعد 2 ثانية
        setTimeout(() => {
            const loading = document.getElementById('loading');
            if (loading) {
                loading.style.display = 'none';
            }
            
            const app = document.getElementById('app');
            if (app) {
                app.style.display = 'block';
            }
            
            // بدء اللعبة
            window.game = new MillionaireGame();
        }, 2000);
    });
    
    // جعل الكائن متاحاً عالمياً
    window.MillionaireGame = MillionaireGame;
})();
