/**
 * محرك اللعبة الرئيسي - ميليونير الذهبية
 * يدير دورة اللعبة الكاملة
 */

class GameEngine {
    constructor() {
        this.config = GameConfig;
        this.questionManager = new QuestionManager();
        this.authSystem = new AuthSystem();
        this.currentState = null;
        this.gameTimer = null;
        this.isGameActive = false;
        this.currentQuestionIndex = 0;
        this.selectedAnswers = [];
        this.lifelinesUsed = [];
        this.gameStartTime = null;
        this.flashEffect = null;
        
        this.init();
    }
    
    /**
     * تهيئة المحرك
     */
    init() {
        console.log('🚀 محرك اللعبة جاهز - ميليونير الذهبية');
        this.resetGameState();
    }
    
    /**
     * إعادة تعيين حالة اللعبة
     */
    resetGameState() {
        this.currentState = {
            gameId: 'game_' + Date.now(),
            userId: this.authSystem.isLoggedIn() ? this.authSystem.getCurrentUser().username : 'guest',
            status: 'idle', // idle, playing, paused, finished
            score: 0,
            correctAnswers: 0,
            currentQuestion: 0,
            totalQuestions: 15,
            timeLeft: 0,
            timerEnabled: this.config.ENABLE_TIMER,
            difficulty: 'medium',
            categories: ['general'],
            selectedLifelines: [],
            usedLifelines: [],
            questions: [],
            startTime: null,
            endTime: null,
            safeHavenReached: false,
            gameResult: null
        };
        
        this.currentQuestionIndex = 0;
        this.selectedAnswers = [];
        this.lifelinesUsed = [];
        this.isGameActive = false;
        this.clearTimer();
    }
    
    /**
     * بدء لعبة جديدة
     */
    startNewGame(options = {}) {
        const user = this.authSystem.getCurrentUser();
        
        this.resetGameState();
        
        // تطبيق الإعدادات
        this.currentState = {
            ...this.currentState,
            difficulty: options.difficulty || 'medium',
            categories: options.categories || ['general'],
            timerEnabled: options.timerEnabled !== undefined ? options.timerEnabled : true,
            userId: user ? user.username : 'guest'
        };
        
        // توليد الأسئلة
        const questions = this.questionManager.getGameQuestions(
            this.currentState.categories,
            this.currentState.difficulty,
            this.currentState.totalQuestions
        );
        
        if (questions.length === 0) {
            throw new Error('لا توجد أسئلة كافية في التصنيفات المحددة!');
        }
        
        this.currentState.questions = questions;
        
        // تحديد الوقت لكل سؤال
        this.currentState.timeLeft = this.getTimeForQuestion(0);
        
        // تسجيل وقت البدء
        this.currentState.startTime = Date.now();
        this.currentState.status = 'playing';
        this.isGameActive = true;
        
        // إعادة تعيين الأسئلة المستخدمة
        this.questionManager.resetUsedQuestions();
        
        // بدء المؤقت إذا كان مفعلاً
        if (this.currentState.timerEnabled) {
            this.startTimer();
        }
        
        console.log('🎮 بدأت لعبة جديدة:', this.currentState);
        
        return {
            success: true,
            gameId: this.currentState.gameId,
            firstQuestion: this.getCurrentQuestion()
        };
    }
    
    /**
     * الحصول على السؤال الحالي
     */
    getCurrentQuestion() {
        if (!this.currentState.questions || this.currentState.questions.length === 0) {
            return null;
        }
        
        const question = this.currentState.questions[this.currentQuestionIndex];
        return {
            ...question,
            questionNumber: this.currentQuestionIndex + 1,
            totalQuestions: this.currentState.totalQuestions,
            prize: this.config.PRIZES[this.currentQuestionIndex],
            timeLeft: this.currentState.timeLeft
        };
    }
    
    /**
     * اختيار إجابة
     */
    selectAnswer(answerIndex) {
        if (!this.isGameActive || this.currentState.status !== 'playing') {
            return { success: false, message: 'اللعبة غير نشطة!' };
        }
        
        const currentQuestion = this.currentState.questions[this.currentQuestionIndex];
        
        // التحقق من أن الإجابة ضمن النطاق
        if (answerIndex < 0 || answerIndex >= currentQuestion.answers.length) {
            return { success: false, message: 'إجابة غير صالحة!' };
        }
        
        // إيقاف المؤقت
        this.clearTimer();
        
        // تسجيل الإجابة
        this.selectedAnswers.push({
            questionIndex: this.currentQuestionIndex,
            answerIndex: answerIndex,
            isCorrect: answerIndex === currentQuestion.correct,
            timestamp: Date.now(),
            timeSpent: this.currentState.timerEnabled ? 
                this.getTimeForQuestion(this.currentQuestionIndex) - this.currentState.timeLeft : 0
        });
        
        const isCorrect = answerIndex === currentQuestion.correct;
        
        // تحديث النتيجة
        if (isCorrect) {
            this.currentState.score += this.config.PRIZES[this.currentQuestionIndex];
            this.currentState.correctAnswers++;
            
            // التحقق من الضمان
            this.checkSafeHaven();
        }
        
        // تطبيق تأثير الوميض
        this.applyFlashEffect(isCorrect);
        
        // تحديث حالة اللعبة
        this.currentState.status = 'answered';
        
        return {
            success: true,
            isCorrect: isCorrect,
            correctAnswer: currentQuestion.correct,
            prize: this.config.PRIZES[this.currentQuestionIndex],
            totalScore: this.currentState.score,
            explanation: currentQuestion.explanation
        };
    }
    
    /**
     * الانتقال للسؤال التالي
     */
    nextQuestion() {
        if (this.currentQuestionIndex >= this.currentState.totalQuestions - 1) {
            return this.finishGame();
        }
        
        this.currentQuestionIndex++;
        this.currentState.currentQuestion = this.currentQuestionIndex;
        
        // تحديث الوقت للسؤال الجديد
        this.currentState.timeLeft = this.getTimeForQuestion(this.currentQuestionIndex);
        
        // تغيير حالة اللعبة
        this.currentState.status = 'playing';
        
        // إعادة تشغيل المؤقت
        if (this.currentState.timerEnabled) {
            this.startTimer();
        }
        
        return {
            success: true,
            question: this.getCurrentQuestion(),
            progress: this.getGameProgress()
        };
    }
    
    /**
     * استخدام أداة مساعدة
     */
    useLifeline(lifelineId) {
        if (!this.isGameActive) {
            return { success: false, message: 'اللعبة غير نشطة!' };
        }
        
        // التحقق من أن الأداة متاحة
        if (this.lifelinesUsed.includes(lifelineId)) {
            return { success: false, message: 'تم استخدام هذه الأداة مسبقاً!' };
        }
        
        // التحقق من الحد الأقصى للأدوات
        const maxLifelines = this.config.DIFFICULTY_LEVELS.find(
            level => level.id === this.currentState.difficulty
        ).lifelines;
        
        if (this.lifelinesUsed.length >= maxLifelines) {
            return { success: false, message: 'وصلت للحد الأقصى من أدوات المساعدة!' };
        }
        
        const currentQuestion = this.currentState.questions[this.currentQuestionIndex];
        let result = null;
        
        switch (lifelineId) {
            case '50_50':
                result = this.useFiftyFifty(currentQuestion);
                break;
            case 'PHONE_FRIEND':
                result = this.usePhoneFriend(currentQuestion);
                break;
            case 'AUDIENCE':
                result = this.useAudiencePoll(currentQuestion);
                break;
            case 'SKIP_AD':
                // سيتم التعامل معه بشكل منفصل
                return { success: false, message: 'يتطلب مشاهدة إعلان' };
            default:
                return { success: false, message: 'أداة غير معروفة!' };
        }
        
        if (result.success) {
            this.lifelinesUsed.push(lifelineId);
            this.currentState.usedLifelines.push({
                lifeline: lifelineId,
                questionIndex: this.currentQuestionIndex,
                timestamp: Date.now()
            });
        }
        
        return result;
    }
    
    /**
     * استخدام أداة 50:50
     */
    useFiftyFifty(question) {
        const wrongAnswers = [];
        for (let i = 0; i < question.answers.length; i++) {
            if (i !== question.correct) {
                wrongAnswers.push(i);
            }
        }
        
        // اختيار إجابتين خاطئتين عشوائياً
        const shuffled = this.shuffleArray(wrongAnswers);
        const toRemove = shuffled.slice(0, 2);
        
        return {
            success: true,
            lifeline: '50_50',
            removedAnswers: toRemove,
            remainingAnswers: [question.correct, ...shuffled.slice(2)]
        };
    }
    
    /**
     * استخدام اتصال بصديق
     */
    usePhoneFriend(question) {
        // محاكاة نصيحة الصديق
        const confidence = Math.random();
        let suggestedAnswer = question.correct;
        
        if (confidence < 0.3) {
            // صديق غير متأكد
            const wrongAnswers = [];
            for (let i = 0; i < question.answers.length; i++) {
                if (i !== question.correct) {
                    wrongAnswers.push(i);
                }
            }
            suggestedAnswer = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
        }
        
        const confidenceLevel = confidence > 0.7 ? 'متأكد جداً' : 
                               confidence > 0.4 ? 'متأكد' : 'غير متأكد';
        
        return {
            success: true,
            lifeline: 'PHONE_FRIEND',
            suggestedAnswer: suggestedAnswer,
            confidence: confidenceLevel,
            message: `أعتقد أن الإجابة هي ${String.fromCharCode(65 + suggestedAnswer)}`
        };
    }
    
    /**
     * استخدام تصويت الجمهور
     */
    useAudiencePoll(question) {
        const percentages = [0, 0, 0, 0];
        
        // الإجابة الصحيحة تحصل على نسبة عالية
        percentages[question.correct] = 60 + Math.random() * 25;
        
        // توزيع النسبة المتبقية
        let remaining = 100 - percentages[question.correct];
        const wrongAnswers = [];
        
        for (let i = 0; i < question.answers.length; i++) {
            if (i !== question.correct) {
                wrongAnswers.push(i);
            }
        }
        
        wrongAnswers.forEach((answer, index) => {
            if (index === wrongAnswers.length - 1) {
                percentages[answer] = Math.round(remaining);
            } else {
                const share = Math.round(Math.random() * remaining * 0.7);
                percentages[answer] = share;
                remaining -= share;
            }
        });
        
        return {
            success: true,
            lifeline: 'AUDIENCE',
            percentages: percentages
        };
    }
    
    /**
     * تخطي السؤال بمشاهدة إعلان
     */
    async skipWithAd() {
        if (!this.isGameActive) {
            return { success: false, message: 'اللعبة غير نشطة!' };
        }
        
        // محاكاة مشاهدة إعلان
        return new Promise((resolve) => {
            setTimeout(() => {
                this.lifelinesUsed.push('SKIP_AD');
                this.currentState.usedLifelines.push({
                    lifeline: 'SKIP_AD',
                    questionIndex: this.currentQuestionIndex,
                    timestamp: Date.now()
                });
                
                // الانتقال للسؤال التالي
                const nextResult = this.nextQuestion();
                
                resolve({
                    success: true,
                    message: 'تم تخطي السؤال بنجاح!',
                    nextQuestion: nextResult.question
                });
            }, 15000); // 15 ثانية محاكاة للإعلان
        });
    }
    
    /**
     * الحصول على وقت السؤال حسب الصعوبة
     */
    getTimeForQuestion(questionIndex) {
        const difficulty = this.currentState.difficulty;
        const baseTime = this.config.TIME_PER_QUESTION[difficulty.toUpperCase()];
        
        // تقليل الوقت تدريجياً مع تقدم الأسئلة
        if (questionIndex < 5) return baseTime;
        if (questionIndex < 10) return Math.floor(baseTime * 0.75);
        return Math.floor(baseTime * 0.5);
    }
    
    /**
     * بدء المؤقت
     */
    startTimer() {
        if (!this.currentState.timerEnabled) return;
        
        this.clearTimer();
        
        this.gameTimer = setInterval(() => {
            this.currentState.timeLeft--;
            
            if (this.currentState.timeLeft <= 0) {
                this.handleTimeUp();
            }
            
            // تحديث الواجهة (سيتم استدعاؤها من UI)
            if (typeof this.onTimerUpdate === 'function') {
                this.onTimerUpdate(this.currentState.timeLeft);
            }
            
            // تغيير اللون عندما يقل الوقت
            if (this.currentState.timeLeft <= 10 && typeof this.onTimeWarning === 'function') {
                this.onTimeWarning(this.currentState.timeLeft);
            }
        }, 1000);
    }
    
    /**
     * مسح المؤقت
     */
    clearTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }
    
    /**
     * معالجة انتهاء الوقت
     */
    handleTimeUp() {
        this.clearTimer();
        
        if (this.currentState.status === 'playing') {
            // معالجة كأنها إجابة خاطئة
            const wrongAnswerIndex = (this.currentState.questions[this.currentQuestionIndex].correct + 1) % 4;
            this.selectAnswer(wrongAnswerIndex);
            
            if (typeof this.onTimeUp === 'function') {
                this.onTimeUp();
            }
        }
    }
    
    /**
     * التحقق من الوصول إلى ضمان
     */
    checkSafeHaven() {
        const currentQuestionNumber = this.currentQuestionIndex + 1;
        
        if (this.config.SAFE_HAVENS.includes(currentQuestionNumber)) {
            this.currentState.safeHavenReached = true;
            
            if (typeof this.onSafeHaven === 'function') {
                this.onSafeHaven(this.currentState.score);
            }
        }
    }
    
    /**
     * إنهاء اللعبة
     */
    finishGame() {
        this.clearTimer();
        this.isGameActive = false;
        this.currentState.status = 'finished';
        this.currentState.endTime = Date.now();
        
        // حساب الوقت الإجمالي
        const totalTime = Math.floor((this.currentState.endTime - this.currentState.startTime) / 1000);
        
        // حساب النتيجة النهائية
        const finalScore = this.currentState.score;
        
        // تحديد نتيجة اللعبة
        const isWin = this.currentState.correctAnswers === this.currentState.totalQuestions;
        this.currentState.gameResult = {
            score: finalScore,
            correctAnswers: this.currentState.correctAnswers,
            totalQuestions: this.currentState.totalQuestions,
            totalTime: totalTime,
            isWin: isWin,
            accuracy: Math.round((this.currentState.correctAnswers / this.currentState.totalQuestions) * 100),
            level: this.currentState.difficulty
        };
        
        // تحديث إحصائيات المستخدم
        this.updateUserStats();
        
        // حفظ النتيجة في لوحة المتصدرين
        this.saveHighScore();
        
        return {
            success: true,
            gameResult: this.currentState.gameResult,
            finalScore: finalScore,
            currency: this.config.CURRENCY
        };
    }
    
    /**
     * تحديث إحصائيات المستخدم
     */
    updateUserStats() {
        const user = this.authSystem.getCurrentUser();
        if (!user) return;
        
        const gameResult = this.currentState.gameResult;
        
        const updatedStats = {
            gamesPlayed: user.stats.gamesPlayed + 1,
            totalWinnings: user.stats.totalWinnings + gameResult.score,
            correctAnswers: user.stats.correctAnswers + gameResult.correctAnswers,
            totalQuestions: user.stats.totalQuestions + gameResult.totalQuestions,
            highestScore: Math.max(user.stats.highestScore, gameResult.score)
        };
        
        // حساب نقاط الخبرة
        const xpGained = this.calculateXPGained(gameResult);
        updatedStats.xp = user.stats.xp + xpGained;
        
        // التحقق من ارتفاع المستوى
        while (updatedStats.xp >= updatedStats.xpToNextLevel) {
            updatedStats.level = (updatedStats.level || 1) + 1;
            updatedStats.xpToNextLevel = Math.floor(updatedStats.xpToNextLevel * this.config.XP_SYSTEM.LEVEL_MULTIPLIER);
            
            if (typeof this.onLevelUp === 'function') {
                this.onLevelUp(updatedStats.level);
            }
        }
        
        // تحديث بيانات المستخدم
        this.authSystem.updateUser(user.username, {
            stats: updatedStats,
            balance: user.balance + gameResult.score
        });
    }
    
    /**
     * حساب نقاط الخبرة المكتسبة
     */
    calculateXPGained(gameResult) {
        let xp = this.config.XP_SYSTEM.BASE_XP;
        
        // مكافأة الفوز
        if (gameResult.isWin) {
            xp += this.config.XP_SYSTEM.WIN_BONUS;
        }
        
        // مكافأة الإجابات الصحيحة
        xp += gameResult.correctAnswers * this.config.XP_SYSTEM.CORRECT_ANSWER_XP;
        
        // مكافأة الدقة العالية
        if (gameResult.accuracy >= 80) {
            xp += 200;
        }
        
        // مكافأة الصعوبة
        const difficultyMultiplier = {
            easy: 1,
            medium: 1.5,
            hard: 2
        }[this.currentState.difficulty];
        
        xp = Math.floor(xp * difficultyMultiplier);
        
        return xp;
    }
    
    /**
     * حفظ النتيجة في لوحة المتصدرين
     */
    saveHighScore() {
        const user = this.authSystem.getCurrentUser();
        if (!user) return;
        
        try {
            const highScores = JSON.parse(localStorage.getItem(this.config.STORAGE_KEYS.HIGH_SCORES) || '[]');
            
            const scoreEntry = {
                username: user.username,
                score: this.currentState.gameResult.score,
                correctAnswers: this.currentState.gameResult.correctAnswers,
                totalTime: this.currentState.gameResult.totalTime,
                difficulty: this.currentState.difficulty,
                date: new Date().toISOString()
            };
            
            highScores.push(scoreEntry);
            
            // ترتيب حسب النتيجة
            highScores.sort((a, b) => b.score - a.score);
            
            // حفظ أفضل 100 نتيجة فقط
            const top100 = highScores.slice(0, 100);
            localStorage.setItem(this.config.STORAGE_KEYS.HIGH_SCORES, JSON.stringify(top100));
        } catch (error) {
            console.error('خطأ في حفظ النتيجة:', error);
        }
    }
    
    /**
     * الحصول على تقدم اللعبة
     */
    getGameProgress() {
        return {
            current: this.currentQuestionIndex + 1,
            total: this.currentState.totalQuestions,
            percentage: Math.round(((this.currentQuestionIndex + 1) / this.currentState.totalQuestions) * 100)
        };
    }
    
    /**
     * الحصول على حالة اللعبة الحالية
     */
    getGameState() {
        return {
            ...this.currentState,
            progress: this.getGameProgress(),
            currentPrize: this.config.PRIZES[this.currentQuestionIndex],
            nextPrize: this.config.PRIZES[this.currentQuestionIndex + 1] || 0,
            lifelinesAvailable: this.getAvailableLifelines()
        };
    }
    
    /**
     * الحصول على الأدوات المتاحة
     */
    getAvailableLifelines() {
        const maxLifelines = this.config.DIFFICULTY_LEVELS.find(
            level => level.id === this.currentState.difficulty
        ).lifelines;
        
        return {
            total: maxLifelines,
            used: this.lifelinesUsed.length,
            available: maxLifelines - this.lifelinesUsed.length,
            usedList: this.lifelinesUsed
        };
    }
    
    /**
     * تطبيق تأثير الوميض
     */
    applyFlashEffect(isCorrect) {
        // إزالة التأثير السابق إذا كان موجوداً
        if (this.flashEffect) {
            clearTimeout(this.flashEffect);
        }
        
        // تطبيق التأثير
        if (typeof this.onFlashEffect === 'function') {
            this.onFlashEffect(isCorrect ? 'correct' : 'wrong');
        }
        
        // إزالة التأثير بعد مدة
        this.flashEffect = setTimeout(() => {
            if (typeof this.onFlashEnd === 'function') {
                this.onFlashEnd();
            }
            this.flashEffect = null;
        }, this.config.UI.FLASH_DURATION);
    }
    
    /**
     * خلط مصفوفة عشوائياً
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    /**
     * إيقاف اللعبة مؤقتاً
     */
    pauseGame() {
        if (this.isGameActive && this.currentState.status === 'playing') {
            this.clearTimer();
            this.currentState.status = 'paused';
            return true;
        }
        return false;
    }
    
    /**
     * استئناف اللعبة
     */
    resumeGame() {
        if (this.isGameActive && this.currentState.status === 'paused') {
            if (this.currentState.timerEnabled) {
                this.startTimer();
            }
            this.currentState.status = 'playing';
            return true;
        }
        return false;
    }
    
    /**
     * إنهاء اللعبة الحالية
     */
    quitGame() {
        if (this.isGameActive) {
            this.clearTimer();
            this.isGameActive = false;
            this.currentState.status = 'finished';
            
            // تسجيل النتيجة حتى لو لم تنته اللعبة
            this.currentState.gameResult = {
                score: this.currentState.score,
                correctAnswers: this.currentState.correctAnswers,
                totalQuestions: this.currentQuestionIndex + 1,
                totalTime: Math.floor((Date.now() - this.currentState.startTime) / 1000),
                isWin: false,
                accuracy: Math.round((this.currentState.correctAnswers / (this.currentQuestionIndex + 1)) * 100),
                level: this.currentState.difficulty
            };
            
            this.updateUserStats();
            
            return {
                success: true,
                finalScore: this.currentState.score,
                gameResult: this.currentState.gameResult
            };
        }
        
        return { success: false, message: 'لا توجد لعبة نشطة!' };
    }
    
    /**
     * الحصول على لوحة المتصدرين
     */
    getLeaderboard(limit = 10) {
        try {
            const highScores = JSON.parse(localStorage.getItem(this.config.STORAGE_KEYS.HIGH_SCORES) || '[]');
            return highScores.slice(0, limit);
        } catch (error) {
            console.error('خطأ في تحميل لوحة المتصدرين:', error);
            return [];
        }
    }
}

// التصدير للاستخدام
if (typeof window !== 'undefined') {
    window.GameEngine = GameEngine;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEngine;
}
