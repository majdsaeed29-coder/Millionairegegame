/**
 * 🎨 مدير الواجهة - المليونير الذهبية
 * يدير عرض العناصر والتفاعلات
 */

class UIManager {
    constructor(appInstance) {
        this.app = appInstance;
        this.currentScreen = 'auth';
        this.init();
    }
    
    /**
     * تهيئة مدير الواجهة
     */
    init() {
        console.log('✅ مدير الواجهة جاهز');
    }
    
    /**
     * تحديث عرض المستخدم
     */
    updateUserDisplay(user) {
        // تحديث القائمة الرئيسية إذا كانت ظاهرة
        if (this.currentScreen === 'main-menu') {
            const welcomeEl = document.querySelector('.user-welcome');
            const balanceEl = document.querySelector('.stat-value');
            
            if (welcomeEl) {
                welcomeEl.textContent = `مرحباً ${user.username}!`;
            }
            
            if (balanceEl) {
                balanceEl.textContent = `${user.balance.toLocaleString()} $`;
            }
        }
    }
    
    /**
     * إنشاء شاشة اللعبة
     */
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
                            <div class="stat-value">${question.score.toLocaleString()} $</div>
                        </div>
                    </div>
                </div>
                
                <div class="question-box">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                        <div style="background: var(--gold-primary); color: black; padding: 10px 20px; border-radius: 20px; font-weight: bold;">
                            السؤال ${question.questionNumber} من ${question.totalQuestions}
                        </div>
                        <div style="color: var(--gold-secondary); font-size: 1.5rem; font-weight: bold;">
                            ${this.calculatePrize(question.questionNumber).toLocaleString()} $
                        </div>
                    </div>
                    
                    <h2 class="question-text">${question.question}</h2>
                    
                    <div class="answers-grid">
                        ${question.answers.map((answer, index) => `
                            <button class="answer-btn" data-answer="${index}">
                                <div class="answer-letter">${String.fromCharCode(65 + index)}</div>
                                <div class="answer-text">${answer}</div>
                            </button>
                        `).join('')}
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-top: 30px;">
                        <button class="btn btn-secondary" id="quit-game">
                            <i class="fas fa-sign-out-alt"></i> إنهاء اللعبة
                        </button>
                        
                        <button class="btn btn-primary" id="next-question" disabled>
                            <i class="fas fa-arrow-left"></i> التالي
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // إضافة الأحداث
        this.setupGameEvents();
    }
    
    /**
     * حساب الجائزة حسب رقم السؤال
     */
    calculatePrize(questionNumber) {
        if (questionNumber - 1 < GameConfig.PRIZES.length) {
            return GameConfig.PRIZES[questionNumber - 1];
        }
        return 100;
    }
    
    /**
     * إعداد أحداث اللعبة
     */
    setupGameEvents() {
        // أحداث الإجابات
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const answerIndex = parseInt(e.currentTarget.dataset.answer);
                this.app.game.selectAnswer(answerIndex);
            });
        });
        
        // زر التالي
        document.getElementById('next-question')?.addEventListener('click', () => {
            this.app.game.nextQuestion();
        });
        
        // زر إنهاء اللعبة
        document.getElementById('quit-game')?.addEventListener('click', () => {
            if (confirm('هل تريد إنهاء اللعبة؟')) {
                this.app.game.stopGame();
                this.app.showMainMenu();
            }
        });
    }
    
    /**
     * تمييز الإجابات بعد الاختيار
     */
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
        
        // تفعيل زر التالي
        const nextBtn = document.getElementById('next-question');
        if (nextBtn) {
            nextBtn.disabled = false;
        }
    }
    
    /**
     * تحديث المؤقت
     */
    updateTimer(timeLeft) {
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.textContent = timeLeft;
            
            // تغيير اللون عندما يقل الوقت
            if (timeLeft <= 10) {
                timerDisplay.style.color = '#e74c3c';
            }
        }
    }
    
    /**
     * عرض النتائج النهائية
     */
    showResults(results) {
        const resultsHTML = `
            <div class="results-container">
                <h1 style="color: var(--gold-primary); font-size: 3rem; margin-bottom: 20px;">
                    ${results.isWin ? '🏆 مبروك! فزت!' : '🎮 لعبة رائعة!'}
                </h1>
                
                <div style="background: rgba(212, 175, 55, 0.1); padding: 30px; border-radius: 20px; margin: 30px 0;">
                    <div style="font-size: 3.5rem; color: var(--gold-secondary); font-weight: bold;">
                        ${results.finalPrize.toLocaleString()} $
                    </div>
                    <div style="color: #aaa; margin-top: 10px;">المبلغ النهائي</div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 40px 0;">
                    <div class="result-stat">
                        <div style="font-size: 2rem;">${results.correctAnswers}/${results.totalQuestions}</div>
                        <div style="color: #aaa;">الإجابات الصحيحة</div>
                    </div>
                    
                    <div class="result-stat">
                        <div style="font-size: 2rem;">${results.accuracy}%</div>
                        <div style="color: #aaa;">الدقة</div>
                    </div>
                    
                    <div class="result-stat">
                        <div style="font-size: 2rem;">${Math.floor(results.totalTime / 60)}:${(results.totalTime % 60).toString().padStart(2, '0')}</div>
                        <div style="color: #aaa;">الوقت الكلي</div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px;">
                    <button class="btn btn-primary" id="play-again">
                        <i class="fas fa-redo"></i> لعب مرة أخرى
                    </button>
                    
                    <button class="btn btn-secondary" id="back-to-menu">
                        <i class="fas fa-home"></i> القائمة الرئيسية
                    </button>
                </div>
            </div>
        `;
        
        // عرض النتائج
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) {
            gameScreen.innerHTML = resultsHTML;
        }
        
        // أحداث الأزرار
        document.getElementById('play-again')?.addEventListener('click', () => {
            this.app.startNewGame();
        });
        
        document.getElementById('back-to-menu')?.addEventListener('click', () => {
            this.app.showMainMenu();
        });
    }
}

// التصدير للاستخدام
if (typeof window !== 'undefined') {
    window.UIManager = UIManager;
}
