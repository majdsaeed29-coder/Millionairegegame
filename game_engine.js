// 🎮 محرك اللعبة
class GameEngine {
    constructor() {
        this.currentGame = null;
        this.timer = null;
        this.isActive = false;
        console.log('✅ محرك اللعبة جاهز');
    }
    
    // بدء لعبة جديدة
    startNewGame(options = {}) {
        // إيقاف أي لعبة سابقة
        this.stopGame();
        
        // إعدادات اللعبة
        this.currentGame = {
            id: 'game_' + Date.now(),
            status: 'active',
            player: options.player || 'مجهول',
            difficulty: options.difficulty || 'medium',
            categories: options.categories || ['general'],
            currentQuestion: 0,
            score: 0,
            correctAnswers: 0,
            totalQuestions: options.totalQuestions || GameConfig.MAX_QUESTIONS,
            questions: [],
            startTime: Date.now(),
            endTime: null,
            timeLeft: this.getTimeForDifficulty(options.difficulty || 'medium'),
            lifelines: this.getLifelinesForDifficulty(options.difficulty || 'medium'),
            usedLifelines: [],
            timerEnabled: options.timerEnabled !== false
        };
        
        // تحميل الأسئلة
        if (window.questionManager) {
            this.currentGame.questions = window.questionManager.getGameQuestions(
                this.currentGame.categories,
                this.currentGame.difficulty,
                this.currentGame.totalQuestions
            );
        } else {
            // أسئلة افتراضية
            this.currentGame.questions = this.getDefaultQuestions();
        }
        
        this.isActive = true;
        
        // بدء المؤقت
        if (this.currentGame.timerEnabled) {
            this.startTimer();
        }
        
        console.log('🎮 بدأت لعبة جديدة');
        
        return {
            success: true,
            game: this.currentGame,
            firstQuestion: this.getCurrentQuestion()
        };
    }
    
    // الحصول على الوقت حسب الصعوبة
    getTimeForDifficulty(difficulty) {
        const level = GameConfig.DIFFICULTY_LEVELS.find(l => l.id === difficulty);
        return level ? level.time : 45;
    }
    
    // الحصول على أدوات المساعدة حسب الصعوبة
    getLifelinesForDifficulty(difficulty) {
        const level = GameConfig.DIFFICULTY_LEVELS.find(l => l.id === difficulty);
        return level ? level.lifelines : 2;
    }
    
    // الحصول على السؤال الحالي
    getCurrentQuestion() {
        if (!this.currentGame || !this.isActive) return null;
        
        if (this.currentGame.currentQuestion >= this.currentGame.questions.length) {
            return null;
        }
        
        const question = this.currentGame.questions[this.currentGame.currentQuestion];
        return {
            ...question,
            questionNumber: this.currentGame.currentQuestion + 1,
            totalQuestions: this.currentGame.totalQuestions,
            timeLeft: this.currentGame.timeLeft,
            score: this.getCurrentScore()
        };
    }
    
    // الحصول على النتيجة الحالية
    getCurrentScore() {
        if (!this.currentGame) return 0;
        
        let score = this.currentGame.score;
        const currentQuestionIndex = this.currentGame.currentQuestion;
        
        // إضافة قيمة السؤال الحالي
        if (currentQuestionIndex < GameConfig.PRIZES.length) {
            score += GameConfig.PRIZES[currentQuestionIndex];
        }
        
        return score;
    }
    
    // اختيار إجابة
    selectAnswer(answerIndex) {
        if (!this.isActive || !this.currentGame) {
            return { success: false, message: 'اللعبة غير نشطة' };
        }
        
        const currentQuestion = this.currentGame.questions[this.currentGame.currentQuestion];
        
        if (answerIndex < 0 || answerIndex >= currentQuestion.answers.length) {
            return { success: false, message: 'إجابة غير صالحة' };
        }
        
        // إيقاف المؤقت
        this.stopTimer();
        
        const isCorrect = (answerIndex === currentQuestion.correct);
        
        // تحديث النتيجة
        if (isCorrect) {
            this.currentGame.score += this.getQuestionPoints();
            this.currentGame.correctAnswers++;
        }
        
        // تسجيل الإجابة
        currentQuestion.userAnswer = answerIndex;
        currentQuestion.isCorrect = isCorrect;
        
        return {
            success: true,
            isCorrect: isCorrect,
            correctAnswer: currentQuestion.correct,
            explanation: currentQuestion.explanation,
            score: this.currentGame.score
        };
    }
    
    // الحصول على نقاط السؤال الحالي
    getQuestionPoints() {
        const questionIndex = this.currentGame.currentQuestion;
        if (questionIndex < GameConfig.PRIZES.length) {
            return GameConfig.PRIZES[questionIndex];
        }
        return 100;
    }
    
    // الانتقال للسؤال التالي
    nextQuestion() {
        if (!this.isActive || !this.currentGame) {
            return { success: false, message: 'اللعبة غير نشطة' };
        }
        
        this.currentGame.currentQuestion++;
        
        // التحقق من نهاية اللعبة
        if (this.currentGame.currentQuestion >= this.currentGame.totalQuestions) {
            return this.finishGame();
        }
        
        // إعادة تعيين الوقت
        this.currentGame.timeLeft = this.getTimeForDifficulty(this.currentGame.difficulty);
        
        // إعادة تشغيل المؤقت
        if (this.currentGame.timerEnabled) {
            this.startTimer();
        }
        
        return {
            success: true,
            question: this.getCurrentQuestion()
        };
    }
    
    // استخدام أداة مساعدة
    useLifeline(lifelineId) {
        if (!this.isActive || !this.currentGame) {
            return { success: false, message: 'اللعبة غير نشطة' };
        }
        
        // التحقق من توفر الأدوات
        if (this.currentGame.usedLifelines.length >= this.currentGame.lifelines) {
            return { success: false, message: 'لقد استخدمت جميع أدوات المساعدة' };
        }
        
        // التحقق من عدم استخدام الأداة مسبقاً
        if (this.currentGame.usedLifelines.includes(lifelineId)) {
            return { success: false, message: 'تم استخدام هذه الأداة مسبقاً' };
        }
        
        const currentQuestion = this.currentGame.questions[this.currentGame.currentQuestion];
        let result = null;
        
        switch (lifelineId) {
            case '50_50':
                result = this.useFiftyFifty(currentQuestion);
                break;
            case 'phone_friend':
                result = this.usePhoneFriend(currentQuestion);
                break;
            case 'audience':
                result = this.useAudiencePoll(currentQuestion);
                break;
            default:
                return { success: false, message: 'أداة غير معروفة' };
        }
        
        if (result.success) {
            this.currentGame.usedLifelines.push(lifelineId);
        }
        
        return result;
    }
    
    // أداة 50:50
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
    
    // اتصال بصديق
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
        
        const confidenceLevel = confidence > 0.7 ? 'أنا متأكد جداً' :
                              confidence > 0.4 ? 'لست متأكداً' : 'أعتقد أن';
        
        return {
            success: true,
            lifeline: 'phone_friend',
            suggestedAnswer: suggestedAnswer,
            confidence: confidenceLevel,
            message: `أعتقد أن الإجابة هي: ${String.fromCharCode(65 + suggestedAnswer)}`
        };
    }
    
    // تصويت الجمهور
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
            lifeline: 'audience',
            percentages: percentages
        };
    }
    
    // بدء المؤقت
    startTimer() {
        if (!this.currentGame || !this.currentGame.timerEnabled) return;
        
        this.stopTimer(); // إيقاف أي مؤقت سابق
        
        this.timer = setInterval(() => {
            if (!this.currentGame || !this.isActive) {
                this.stopTimer();
                return;
            }
            
            this.currentGame.timeLeft--;
            
            // تنبيه عندما يقل الوقت
            if (this.currentGame.timeLeft <= 10) {
                // يمكن إضافة صوت تنبيه هنا
            }
            
            // انتهاء الوقت
            if (this.currentGame.timeLeft <= 0) {
                this.handleTimeUp();
            }
        }, 1000);
    }
    
    // إيقاف المؤقت
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    // معالجة انتهاء الوقت
    handleTimeUp() {
        this.stopTimer();
        
        if (this.isActive && this.currentGame) {
            // معالجة كإجابة خاطئة
            const wrongAnswerIndex = (this.currentGame.questions[this.currentGame.currentQuestion].correct + 1) % 4;
            this.selectAnswer(wrongAnswerIndex);
        }
    }
    
    // إنهاء اللعبة
    finishGame() {
        this.stopTimer();
        
        if (!this.currentGame) {
            return { success: false, message: 'لا توجد لعبة نشطة' };
        }
        
        this.isActive = false;
        this.currentGame.status = 'finished';
        this.currentGame.endTime = Date.now();
        
        // حساب الوقت الإجمالي
        const totalTime = Math.floor((this.currentGame.endTime - this.currentGame.startTime) / 1000);
        
        // حساب الدقة
        const accuracy = this.currentGame.totalQuestions > 0 ?
            Math.round((this.currentGame.correctAnswers / this.currentGame.totalQuestions) * 100) : 0;
        
        const result = {
            success: true,
            gameResult: {
                score: this.currentGame.score,
                correctAnswers: this.currentGame.correctAnswers,
                totalQuestions: this.currentGame.totalQuestions,
                totalTime: totalTime,
                accuracy: accuracy,
                isWin: this.currentGame.correctAnswers === this.currentGame.totalQuestions,
                difficulty: this.currentGame.difficulty,
                finalPrize: this.currentGame.score
            }
        };
        
        console.log('🏁 انتهت اللعبة:', result);
        return result;
    }
    
    // إيقاف اللعبة
    stopGame() {
        this.stopTimer();
        this.isActive = false;
        this.currentGame = null;
    }
    
    // أسئلة افتراضية
    getDefaultQuestions() {
        return [
            {
                question: 'ما هي عاصمة فرنسا؟',
                answers: ['لندن', 'برلين', 'باريس', 'روما'],
                correct: 2,
                hint: 'تشتهر ببرج إيفل',
                explanation: 'باريس هي عاصمة فرنسا',
                category: 'general',
                difficulty: 'easy',
                points: 100
            },
            {
                question: 'كم عدد كواكب المجموعة الشمسية؟',
                answers: ['7', '8', '9', '10'],
                correct: 1,
                hint: 'بما في ذلك الأرض',
                explanation: 'المجموعة الشمسية لها 8 كواكب',
                category: 'science',
                difficulty: 'easy',
                points: 100
            }
        ];
    }
    
    // خلط مصفوفة
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

// جعلها متاحة عالمياً
if (typeof window !== 'undefined') {
    window.GameEngine = GameEngine;
}
