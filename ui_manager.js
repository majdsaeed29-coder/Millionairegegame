// 🎨 مدير الواجهة
class UIManager {
    constructor(appInstance) {
        this.app = appInstance;
        this.currentScreen = 'auth';
        this.notifications = [];
        console.log('✅ مدير الواجهة جاهز');
    }
    
    // إظهار شاشة
    showScreen(screenName) {
        // إخفاء جميع الشاشات
        const screens = ['auth', 'main-menu', 'game', 'admin', 'results'];
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
            this.currentScreen = screenName;
        }
    }
    
    // تحديث بيانات المستخدم
    updateUserDisplay(user) {
        const welcomeEl = document.querySelector('.user-welcome');
        const balanceEl = document.querySelector('.stat-value');
        
        if (welcomeEl) {
            welcomeEl.textContent = `مرحباً ${user.username}!`;
        }
        
        if (balanceEl) {
            balanceEl.textContent = `${user.balance.toLocaleString()} $`;
        }
    }
    
    // إنشاء شاشة اللعبة
    createGameScreen(question) {
        const gameScreen = document.getElementById('game-screen');
        if (!gameScreen) return;
        
        gameScreen.innerHTML = `
            <div style="max-width: 1000px; width: 100%;">
                <div class="game-header">
                    <div class="player-info">
                        <div class="player-avatar">👤</div>
                        <div class="player-details">
                            <h3>${this.app.auth.getCurrentUser()?.username || 'المتنافس'}</h3>
                            <p>المستوى ${this.app.auth.getCurrentUser()?.stats?.level || 1}</p>
                        </div>
                    </div>
                    
                    <div class="game-stats">
                        <div class="stat-box">
                            <div class="stat-label">الوقت</div>
                            <div class="stat-value" id="timer-display">${question.timeLeft}</div>
                        </div>
                        
                        <div class="stat-box">
                            <div class="stat-label">الرصيد</div>
                            <div class="stat-value" id="score-display">${this.app.game.currentGame?.score || 0} $</div>
                        </div>
                        
                        <div class="stat-box">
                            <div class="stat-label">السؤال</div>
                            <div class="stat-value">${question.questionNumber}/${question.totalQuestions}</div>
                        </div>
                    </div>
                </div>
                
                <div class="question-box">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
                        <div style="background: var(--gold-primary); color: black; padding: 10px 20px; border-radius: 20px; font-weight: bold;">
                            السؤال ${question.questionNumber} من ${question.totalQuestions}
                        </div>
                        <div style="color: var(--gold-secondary); font-size: 1.5rem; font-weight: bold;">
                            ${this.calculatePrize(question.questionNumber).toLocaleString()} $
                        </div>
                    </div>
                    
                    <h2 class="question-text">${question.question}</h2>
                    
                    <div class="answers-grid" id="answers-container">
                        ${question.answers.map((answer, index) => `
                            <button class="answer-btn" data-answer="${index}">
                                <div class="answer-letter">${String.fromCharCode(65 + index)}</div>
                                <div class="answer-text">${answer}</div>
                            </button>
                        `).join('')}
                    </div>
                    
                    <div style="margin-top: 30px;">
                        <div class="hint-box" id="hint-box" style="display: none; background: rgba(52, 152, 219, 0.1); padding: 15px; border-radius: 10px; border-right: 4px solid #3498db;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-lightbulb" style="color: #3498db;"></i>
                                <div id="hint-text" style="color: #ddd;"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-top: 30px; flex-wrap: wrap; gap: 10px;">
                        <button class="btn btn-secondary" id="quit-game">
                            <i class="fas fa-sign-out-alt"></i> إنهاء اللعبة
                        </button>
                        
                        <div style="display: flex; gap: 10px;">
                            <button class="btn btn-primary" id="show-hint">
                                <i class="fas fa-lightbulb"></i> تلميح
                            </button>
                            
                            <button class="btn btn-primary" id="next-question" disabled>
                                <i class="fas fa-arrow-left"></i> التالي
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // إعداد الأحداث
        this.setupGameEvents(question);
    }
    
    // إعداد أحداث اللعبة
    setupGameEvents(question) {
        // أحداث الإجابات
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const answerIndex = parseInt(e.currentTarget.dataset.answer);
                const result = this.app.game.selectAnswer(answerIndex);
                
                if (result.success) {
                    // تمييز الإجابات
                    this.highlightAnswers(answerIndex, result.correctAnswer);
                    
                    // إظهار التلميح
                    setTimeout(() => {
                        this.showNotification(
                            result.isCorrect ? '🎉 إجابة صحيحة!' : '❌ إجابة خاطئة',
                            result.isCorrect ? 'success' : 'error'
                        );
                        
                        if (!result.isCorrect && result.explanation) {
                            document.getElementById('hint-text').textContent = result.explanation;
                            document.getElementById('hint-box').style.display = 'block';
                        }
                    }, 500);
                    
                    // تفعيل زر التالي
                    document.getElementById('next-question').disabled = false;
                }
            });
        });
        
        // زر التالي
        document.getElementById('next-question')?.addEventListener('click', () => {
            const result = this.app.game.nextQuestion();
            if (result.success && result.question) {
                this.createGameScreen(result.question);
            } else if (result.success && result.gameResult) {
                this.showResults(result.gameResult);
            }
        });
        
        // زر إنهاء اللعبة
        document.getElementById('quit-game')?.addEventListener('click', () => {
            if (confirm('هل تريد إنهاء اللعبة؟ سيتم فقدان تقدمك الحالي.')) {
                this.app.game.stopGame();
                this.app.showMainMenu();
            }
        });
        
        // زر التلميح
        document.getElementById('show-hint')?.addEventListener('click', () => {
            if (question.hint) {
                document.getElementById('hint-text').textContent = question.hint;
                document.getElementById('hint-box').style.display = 'block';
            }
        });
    }
    
    // تمييز الإجابات
    highlightAnswers(selectedIndex, correctIndex) {
        const buttons = document.querySelectorAll('.answer-btn');
        
        buttons.forEach((btn, index) => {
            btn.disabled = true;
            
            if (index === correctIndex) {
                btn.classList.add('correct');
            } else if (index === selectedIndex) {
                btn.classList.add('wrong');
            }
        });
    }
    
    // حساب الجائزة
    calculatePrize(questionNumber) {
        if (questionNumber - 1 < GameConfig.PRIZES.length) {
            return GameConfig.PRIZES[questionNumber - 1];
        }
        return 100;
    }
    
    // تحديث المؤقت
    updateTimer(timeLeft) {
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.textContent = timeLeft;
            
            if (timeLeft <= 10) {
                timerDisplay.style.color = '#e74c3c';
            }
        }
    }
    
    // إظهار النتائج
    showResults(results) {
        const resultsScreen = document.getElementById('results-screen');
        if (!resultsScreen) return;
        
        resultsScreen.innerHTML = `
            <div class="results-container">
                <div class="result-icon">${results.isWin ? '🏆' : '🎮'}</div>
                
                <h1 style="color: var(--gold-light); margin-bottom: 10px;">
                    ${results.isWin ? 'مبروك! فزت!' : 'لعبة رائعة!'}
                </h1>
                <p style="color: #aaa; margin-bottom: 30px;">${results.isWin ? 'لقد فزت بمليون دولار!' : 'حاول مرة أخرى للفوز!'}</p>
                
                <div style="background: rgba(212, 175, 55, 0.1); padding: 30px; border-radius: 20px; margin: 30px 0;">
                    <div style="font-size: 3.5rem; color: var(--gold-secondary); font-weight: bold;">
                        ${results.finalPrize.toLocaleString()} $
                    </div>
                    <div style="color: #aaa; margin-top: 10px;">المبلغ النهائي</div>
                </div>
                
                <div class="results-stats">
                    <div class="result-stat">
                        <div class="stat-icon">✅</div>
                        <div class="stat-value">${results.correctAnswers}/${results.totalQuestions}</div>
                        <div class="stat-label">الإجابات الصحيحة</div>
                    </div>
                    
                    <div class="result-stat">
                        <div class="stat-icon">🎯</div>
                        <div class="stat-value">${results.accuracy}%</div>
                        <div class="stat-label">الدقة</div>
                    </div>
                    
                    <div class="result-stat">
                        <div class="stat-icon">⏱️</div>
                        <div class="stat-value">${Math.floor(results.totalTime / 60)}:${(results.totalTime % 60).toString().padStart(2, '0')}</div>
                        <div class="stat-label">الوقت الكلي</div>
                    </div>
                    
                    <div class="result-stat">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-value">${results.difficulty}</div>
                        <div class="stat-label">الصعوبة</div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px; flex-wrap: wrap;">
                    <button class="btn btn-primary" id="play-again">
                        <i class="fas fa-redo"></i> لعب مرة أخرى
                    </button>
                    
                    <button class="btn btn-secondary" id="back-to-menu">
                        <i class="fas fa-home"></i> القائمة الرئيسية
                    </button>
                    
                    <button class="btn btn-secondary" id="share-results">
                        <i class="fas fa-share-alt"></i> مشاركة
                    </button>
                </div>
            </div>
        `;
        
        this.showScreen('results');
        
        // أحداث الأزرار
        document.getElementById('play-again')?.addEventListener('click', () => {
            this.app.startNewGame();
        });
        
        document.getElementById('back-to-menu')?.addEventListener('click', () => {
            this.app.showMainMenu();
        });
        
        document.getElementById('share-results')?.addEventListener('click', () => {
            this.shareResults(results);
        });
    }
    
    // مشاركة النتائج
    shareResults(results) {
        const text = `🎮 لعبة المليونير الذهبية
🏆 النتيجة: ${results.finalPrize.toLocaleString()} $
✅ الإجابات الصحيحة: ${results.correctAnswers}/${results.totalQuestions}
🎯 الدقة: ${results.accuracy}%
⏱️ الوقت: ${Math.floor(results.totalTime / 60)}:${(results.totalTime % 60).toString().padStart(2, '0')}

جرب اللعبة الآن!`;
        
        if (navigator.share) {
            navigator.share({
                title: 'نتيجة المليونير الذهبية',
                text: text,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(text);
            this.showNotification('تم نسخ النتائج إلى الحافظة 📋', 'success');
        }
    }
    
    // إظهار إشعار
    showNotification(message, type = 'info') {
        // إنصراف الإشعارات القديمة
        this.notifications.forEach(notif => {
            if (notif.element && notif.element.parentNode) {
                notif.element.remove();
            }
        });
        
        // إنشاء إشعار جديد
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="font-size: 1.5rem;">
                    ${type === 'success' ? '✅' : 
                      type === 'error' ? '❌' : 
                      type === 'warning' ? '⚠️' : 'ℹ️'}
                </div>
                <div>${message}</div>
                <button style="background: none; border: none; color: white; cursor: pointer; margin-right: auto;">
                    ×
                </button>
            </div>
        `;
        
        // إضافة الإشعار
        document.body.appendChild(notification);
        
        // حدث الإغلاق
        notification.querySelector('button').addEventListener('click', () => {
            notification.remove();
        });
        
        // حفظ الإشعار
        const notifObj = {
            element: notification,
            timeout: null
        };
        
        this.notifications.push(notifObj);
        
        // إزالة تلقائية بعد 5 ثواني
        notifObj.timeout = setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.5s';
                setTimeout(() => notification.remove(), 500);
            }
        }, 5000);
    }
    
    // تأثير الفلاش
    flashEffect(type) {
        const flash = document.createElement('div');
        flash.className = `flash ${type}`;
        document.body.appendChild(flash);
        
        setTimeout(() => {
            if (flash.parentNode) {
                flash.remove();
            }
        }, 1000);
    }
}

// جعلها متاحة عالمياً
if (typeof window !== 'undefined') {
    window.UIManager = UIManager;
}
