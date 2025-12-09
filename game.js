// بيانات اللعبة الكاملة
const gameData = {
    questions: {
        easy: [
            { question: "ما هي عاصمة فرنسا؟", answers: ["لندن", "باريس", "برلين", "روما"], correct: 2 },
            { question: "كم عدد الكواكب في المجموعة الشمسية؟", answers: ["7", "8", "9", "10"], correct: 2 },
            { question: "من هو مؤلف كتاب 'الأمير'؟", answers: ["أفلاطون", "مكيافيللي", "أرسطو", "شكسبير"], correct: 2 },
            { question: "ما هو أكبر محيط في العالم؟", answers: ["الأطلسي", "الهندي", "الهادئ", "المتجمد"], correct: 3 },
            { question: "ما هي أقرب كوكب للشمس؟", answers: ["الزهرة", "المريخ", "عطارد", "الأرض"], correct: 3 },
            { question: "ما هو لون دم الاخطبوط؟", answers: ["أحمر", "أزرق", "أخضر", "أصفر"], correct: 2 },
            { question: "كم عدد أيام السنة الكبيسة؟", answers: ["365", "366", "364", "367"], correct: 2 },
            { question: "من هو أول رئيس لأمريكا؟", answers: ["جيفرسون", "لينكولن", "واشنطن", "أديسون"], correct: 3 },
            { question: "ما هو أسرع حيوان بري؟", answers: ["النمر", "الفهد", "الأسد", "الظبي"], correct: 2 },
            { question: "ما هي عاصمة اليابان؟", answers: ["سيول", "بكين", "طوكيو", "بانكوك"], correct: 3 },
            { question: "كم عدد حروف اللغة العربية؟", answers: ["28", "29", "30", "31"], correct: 1 },
            { question: "ما هو أطول نهر في العالم؟", answers: ["النيل", "الأمازون", "يانجتسي", "المسيسبي"], correct: 2 },
            { question: "من هو مخترع المصباح الكهربائي؟", answers: ["نيوتن", "أديسون", "أينشتاين", "بيل"], correct: 2 },
            { question: "ما هي أقدم حضارة في العالم؟", answers: ["الفرعونية", "السومرية", "البابلية", "الفينيقية"], correct: 2 },
            { question: "ما هو العنصر الكيميائي للذهب؟", answers: ["Au", "Ag", "Fe", "Cu"], correct: 1 }
        ],
        medium: [
            { question: "في أي سنة هبط الإنسان على القمر؟", answers: ["1965", "1969", "1972", "1975"], correct: 2 },
            { question: "ما هي عاصمة استراليا؟", answers: ["سيدني", "ملبورن", "كانبرا", "بريزبان"], correct: 3 },
            { question: "من هو لاعب كرة القدم المعروف بـ'البرازيلي'؟", answers: ["رونالدو", "بيليه", "رونالدينيو", "نيمار"], correct: 1 },
            { question: "كم عدد عظام جسم الإنسان البالغ؟", answers: ["206", "210", "214", "220"], correct: 1 },
            { question: "ما هو أصل نبات البطاطس؟", answers: ["أمريكا الجنوبية", "أفريقيا", "آسيا", "أوروبا"], correct: 1 },
            { question: "من هو مؤلف مسرحية 'هاملت'؟", answers: ["أرسطو", "شكسبير", "ديكارت", "سرفانتس"], correct: 2 },
            { question: "ما هي اللغة الرسمية للبرازيل؟", answers: ["الإسبانية", "البرتغالية", "الإنجليزية", "الفرنسية"], correct: 2 },
            { question: "كم عدد القارات في العالم؟", answers: ["5", "6", "7", "8"], correct: 3 },
            { question: "ما هو الغاز الأكثر وفرة في الغلاف الجوي؟", answers: ["الأكسجين", "ثاني أكسيد الكربون", "النيتروجين", "الهيدروجين"], correct: 3 },
            { question: "من هو أول رائد فضاء عربي؟", answers: ["سلطان بن سلمان", "محمد فارس", "عبد الحكيم", "طارق علي"], correct: 2 }
        ],
        hard: [
            { question: "ما هي أعلى قمة جبل في العالم؟", answers: ["كي 2", "كانغشينجونغا", "إفرست", "لوتسي"], correct: 3 },
            { question: "من هو العالم الذي اكتشف الجاذبية؟", answers: ["أرسطو", "نيوتن", "أينشتاين", "غاليليو"], correct: 2 },
            { question: "ما هو أصل كلمة 'ألجبرا'؟", answers: ["لاتيني", "يوناني", "عربي", "فارسي"], correct: 3 },
            { question: "كم عدد أحرف اللغة الصينية الأساسية؟", answers: ["500", "1000", "5000", "10000"], correct: 3 },
            { question: "ما هو أندر فصيلة دم في العالم؟", answers: ["O-", "AB-", "B-", "A-"], correct: 2 },
            { question: "من هو مؤلف كتاب 'الأصول' في الرياضيات؟", answers: ["فيثاغورس", "أرخميدس", "إقليدس", "بطليموس"], correct: 3 },
            { question: "ما هو أقدم نادي كرة قدم في العالم؟", answers: ["مانشستر يونايتد", "ريال مدريد", "نوتس كاونتي", "شيفيلد"], correct: 4 },
            { question: "كم عدد قلوب الأخطبوط؟", answers: ["1", "2", "3", "4"], correct: 3 },
            { question: "ما هو المعدن الأكثر توصيلاً للكهرباء؟", answers: ["الذهب", "الفضة", "النحاس", "الألمنيوم"], correct: 2 },
            { question: "من هو أول من دار حول الأرض؟", answers: ["كولومبوس", "ماجلان", "ماركو بولو", "فاسكو دا جاما"], correct: 2 }
        ]
    },
    
    prizes: [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000],
    
    lifelines: {
        fiftyFifty: true,
        callFriend: true,
        audience: true
    }
};

// حالة اللعبة
const gameState = {
    difficulty: 'easy',
    currentQuestion: 0,
    score: 0,
    timer: 30,
    timerInterval: null,
    selectedAnswer: null,
    playerName: 'اللاعب',
    startTime: null,
    correctAnswers: 0,
    lifelinesUsed: []
};

// تهيئة العناصر
const elements = {
    screens: {
        start: document.getElementById('start-screen'),
        game: document.getElementById('game-screen'),
        end: document.getElementById('end-screen')
    },
    buttons: {
        start: document.getElementById('start-btn'),
        diff: document.querySelectorAll('.diff-btn'),
        answers: document.querySelectorAll('.answer'),
        next: document.getElementById('next-btn'),
        quit: document.getElementById('quit-btn'),
        restart: document.getElementById('restart-btn'),
        lifelines: {
            fifty: document.getElementById('fifty-fifty'),
            call: document.getElementById('call-friend'),
            audience: document.getElementById('audience')
        },
        share: document.getElementById('share-btn')
    },
    displays: {
        question: document.getElementById('question-text'),
        questionNum: document.getElementById('question-number'),
        questionValue: document.getElementById('question-value'),
        time: document.getElementById('time'),
        money: document.getElementById('current-money'),
        finalMoney: document.getElementById('final-money'),
        playerName: document.getElementById('display-name'),
        correctAnswers: document.getElementById('correct-answers'),
        totalTime: document.getElementById('total-time'),
        level: document.getElementById('achieved-level'),
        resultTitle: document.getElementById('result-title'),
        resultMessage: document.getElementById('result-message'),
        resultIcon: document.getElementById('result-icon')
    },
    progress: {
        bar: document.getElementById('progress-bar'),
        prizes: document.querySelectorAll('.prize-item')
    }
};

// تهيئة اللعبة
function initGame() {
    console.log('🎮 تهيئة لعبة من سيربح المليون...');
    
    // أحداث أزرار الصعوبة
    elements.buttons.diff.forEach(btn => {
        btn.addEventListener('click', () => {
            gameState.difficulty = btn.dataset.level;
            elements.buttons.diff.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });
    
    // زر البدء
    elements.buttons.start.addEventListener('click', startGame);
    
    // زر إعادة التشغيل
    elements.buttons.restart.addEventListener('click', restartGame);
    
    // زر الانسحاب
    elements.buttons.quit.addEventListener('click', quitGame);
    
    // زر المشاركة
    elements.buttons.share.addEventListener('click', shareResult);
    
    // زر التالي
    elements.buttons.next.addEventListener('click', nextQuestion);
    
    // أحداث أزرار الإجابة
    elements.buttons.answers.forEach(answer => {
        answer.addEventListener('click', () => selectAnswer(answer));
    });
    
    // أدوات المساعدة
    elements.buttons.lifelines.fifty.addEventListener('click', useFiftyFifty);
    elements.buttons.lifelines.call.addEventListener('click', useCallFriend);
    elements.buttons.lifelines.audience.addEventListener('click', useAudienceHelp);
    
    // اسم اللاعب
    document.getElementById('player-name').addEventListener('input', (e) => {
        gameState.playerName = e.target.value || 'اللاعب';
        elements.displays.playerName.textContent = gameState.playerName;
    });
    
    // تعبئة الجوائز
    updatePrizeDisplay();
    
    console.log('✅ اللعبة جاهزة للبدء!');
}

// بدء اللعبة
function startGame() {
    gameState.currentQuestion = 0;
    gameState.score = 0;
    gameState.correctAnswers = 0;
    gameState.startTime = Date.now();
    gameState.lifelinesUsed = [];
    
    // إعادة تعيين أدوات المساعدة
    elements.buttons.lifelines.fifty.disabled = false;
    elements.buttons.lifelines.call.disabled = false;
    elements.buttons.lifelines.audience.disabled = false;
    
    // تبديل الشاشات
    elements.screens.start.classList.remove('active');
    elements.screens.game.classList.add('active');
    
    // تحميل السؤال الأول
    loadQuestion();
    startTimer();
    updateScore();
    updateProgress();
}

// تحميل السؤال
function loadQuestion() {
    const questions = gameData.questions[gameState.difficulty];
    
    if (gameState.currentQuestion >= questions.length) {
        endGame(true);
        return;
    }
    
    const question = questions[gameState.currentQuestion];
    const prize = gameData.prizes[gameState.currentQuestion];
    
    // تحديث العرض
    elements.displays.question.textContent = question.question;
    elements.displays.questionNum.textContent = `السؤال ${gameState.currentQuestion + 1}`;
    elements.displays.questionValue.textContent = `${prize.toLocaleString()} دينار`;
    
    // تحديث الإجابات
    elements.buttons.answers.forEach((answer, index) => {
        const answerLetter = ['أ', 'ب', 'ج', 'د'][index];
        answer.querySelector('.answer-letter').textContent = answerLetter;
        answer.querySelector('.answer-text').textContent = question.answers[index];
        
        // إعادة تعيين المظهر
        answer.classList.remove('selected', 'correct', 'wrong');
        answer.disabled = false;
        answer.style.opacity = '1';
        answer.style.display = 'flex';
    });
    
    // إعادة تعيين زر التالي
    elements.buttons.next.disabled = true;
    gameState.selectedAnswer = null;
    
    // تحديث قائمة الجوائز
    highlightCurrentPrize();
}

// بدء المؤقت
function startTimer() {
    clearInterval(gameState.timerInterval);
    gameState.timer = 30;
    elements.displays.time.textContent = gameState.timer;
    
    gameState.timerInterval = setInterval(() => {
        gameState.timer--;
        elements.displays.time.textContent = gameState.timer;
        
        if (gameState.timer <= 0) {
            clearInterval(gameState.timerInterval);
            handleTimeUp();
        }
    }, 1000);
}

// اختيار إجابة
function selectAnswer(answer) {
    if (gameState.selectedAnswer !== null) return;
    
    // إزالة التحديد السابق
    elements.buttons.answers.forEach(a => a.classList.remove('selected'));
    
    // تحديد الإجابة الجديدة
    answer.classList.add('selected');
    gameState.selectedAnswer = parseInt(answer.dataset.id);
    
    // تمكين زر التالي
    elements.buttons.next.disabled = false;
}

// الانتقال للسؤال التالي
function nextQuestion() {
    const questions = gameData.questions[gameState.difficulty];
    const question = questions[gameState.currentQuestion];
    
    // التحقق من الإجابة
    const isCorrect = gameState.selectedAnswer === question.correct;
    
    // عرض النتيجة
    elements.buttons.answers.forEach((answer, index) => {
        const answerId = parseInt(answer.dataset.id);
        
        if (answerId === question.correct) {
            answer.classList.add('correct');
        } else if (answerId === gameState.selectedAnswer && !isCorrect) {
            answer.classList.add('wrong');
        }
        answer.disabled = true;
    });
    
    if (isCorrect) {
        // تحديث النقاط
        gameState.score = gameData.prizes[gameState.currentQuestion];
        gameState.correctAnswers++;
        
        // صوت/تأثير النجاح
        playSound('correct');
        
        // الانتقال للسؤال التالي
        setTimeout(() => {
            gameState.currentQuestion++;
            updateScore();
            updateProgress();
            
            if (gameState.currentQuestion < questions.length) {
                loadQuestion();
                startTimer();
            } else {
                endGame(true);
            }
        }, 2000);
    } else {
        // إجابة خاطئة
        playSound('wrong');
        setTimeout(() => endGame(false), 2000);
    }
}

// استخدام 50:50
function useFiftyFifty() {
    if (gameState.lifelinesUsed.includes('fiftyFifty')) return;
    
    const questions = gameData.questions[gameState.difficulty];
    const question = questions[gameState.currentQuestion];
    
    const wrongAnswers = [1, 2, 3, 4].filter(num => num !== question.correct);
    const toRemove = wrongAnswers.sort(() => Math.random() - 0.5).slice(0, 2);
    
    elements.buttons.answers.forEach(answer => {
        if (toRemove.includes(parseInt(answer.dataset.id))) {
            answer.style.opacity = '0.3';
            answer.disabled = true;
        }
    });
    
    gameState.lifelinesUsed.push('fiftyFifty');
    elements.buttons.lifelines.fifty.disabled = true;
    
    // تأثير
    playSound('lifeline');
}

// الاتصال بصديق
function useCallFriend() {
    if (gameState.lifelinesUsed.includes('callFriend')) return;
    
    const questions = gameData.questions[gameState.difficulty];
    const question = questions[gameState.currentQuestion];
    
    // 75% فرصة للإجابة الصحيحة
    const isConfident = Math.random() < 0.75;
    const friendAnswer = isConfident ? question.correct : 
        [1, 2, 3, 4].find(num => num !== question.correct);
    
    const answerLetters = ['أ', 'ب', 'ج', 'د'];
    const friendText = isConfident ? 
        `أنا متأكد 100% أن الإجابة ${answerLetters[friendAnswer-1]} صحيحة!` :
        `أعتقد أن الإجابة ${answerLetters[friendAnswer-1]} قد تكون صحيحة... لكن لست متأكداً`;
    
    showNotification(`📞 صديقك يقول: "${friendText}"`, 'info');
    
    gameState.lifelinesUsed.push('callFriend');
    elements.buttons.lifelines.call.disabled = true;
    playSound('lifeline');
}

// مساعدة الجمهور
function useAudienceHelp() {
    if (gameState.lifelinesUsed.includes('audienceHelp')) return;
    
    const questions = gameData.questions[gameState.difficulty];
    const question = questions[gameState.currentQuestion];
    
    // محاكاة تصويت الجمهور
    let percentages = [0, 0, 0, 0];
    percentages[question.correct - 1] = 60 + Math.random() * 25; // 60-85% للإجابة الصحيحة
    
    // توزيع النسبة المتبقية
    let remaining = 100 - percentages[question.correct - 1];
    for (let i = 0; i < 4; i++) {
        if (i !== question.correct - 1) {
            percentages[i] = Math.random() * remaining * 0.7;
            remaining -= percentages[i];
        }
    }
    
    // تعديل المجموع ليكون 100%
    const diff = 100 - percentages.reduce((a, b) => a + b);
    percentages[question.correct - 1] += diff;
    
    // عرض النتائج
    const answerLetters = ['أ', 'ب', 'ج', 'د'];
    let message = "📊 تصويت الجمهور:\n\n";
    percentages.forEach((percent, index) => {
        const bar = '█'.repeat(Math.floor(percent / 5));
        message += `${answerLetters[index]}: ${bar} ${Math.round(percent)}%\n`;
    });
    
    showNotification(message, 'info');
    
    gameState.lifelinesUsed.push('audienceHelp');
    elements.buttons.lifelines.audience.disabled = true;
    playSound('lifeline');
}

// انتهاء الوقت
function handleTimeUp() {
    showNotification('⏰ انتهى الوقت!', 'error');
    endGame(false);
}

// إنهاء اللعبة
function endGame(isWin) {
    clearInterval(gameState.timerInterval);
    
    // حساب الوقت المستغرق
    const timeSpent = Math.floor((Date.now() - gameState.startTime) / 1000);
    
    // تحديث الشاشة النهائية
    elements.displays.finalMoney.textContent = gameState.score.toLocaleString();
    elements.displays.correctAnswers.textContent = gameState.correctAnswers;
    elements.displays.totalTime.textContent = timeSpent;
    
    // تحديد المستوى
    let level = 'مبتدئ';
    if (gameState.score >= 32000) level = 'محترف';
    else if (gameState.score >= 1000) level = 'متوسط';
    elements.displays.level.textContent = level;
    
    // تحديث الرسالة حسب النتيجة
    if (isWin) {
        elements.displays.resultIcon.textContent = '🏆';
        elements.displays.resultTitle.textContent = 'مبروك! لقد فزت بالمليون!';
        elements.displays.resultMessage.textContent = `${gameState.playerName}، أنت عبقري!`;
        playSound('win');
    } else {
        elements.displays.resultIcon.textContent = '💡';
        elements.displays.resultTitle.textContent = 'انتهت اللعبة';
        elements.displays.resultMessage.textContent = `${gameState.playerName}، حاول مرة أخرى!`;
        playSound('lose');
    }
    
    // حفظ النتيجة
    saveHighScore();
    
    // تبديل الشاشات
    elements.screens.game.classList.remove('active');
    elements.screens.end.classList.add('active');
}

// تحديث النقاط
function updateScore() {
    elements.displays.money.textContent = gameState.score.toLocaleString();
}

// تحديث شريط التقدم
function updateProgress() {
    const questions = gameData.questions[gameState.difficulty];
    const progress = ((gameState.currentQuestion) / questions.length) * 100;
    elements.progress.bar.style.width = `${progress}%`;
}

// تحديث قائمة الجوائز
function updatePrizeDisplay() {
    elements.progress.prizes.forEach((item, index) => {
        item.textContent = `${index + 1}. ${gameData.prizes[index].toLocaleString()} دينار`;
    });
}

// تمييز الجائزة الحالية
function highlightCurrentPrize() {
    elements.progress.prizes.forEach((item, index) => {
        item.classList.remove('current', 'passed');
        if (index === gameState.currentQuestion) {
            item.classList.add('current');
        } else if (index < gameState.currentQuestion) {
            item.classList.add('passed');
        }
    });
}

// حفظ أعلى النتائج
function saveHighScore() {
    const highScores = JSON.parse(localStorage.getItem('millionaireHighScores') || '[]');
    
    const newScore = {
        name: gameState.playerName,
        score: gameState.score,
        level: gameState.difficulty,
        date: new Date().toLocaleDateString('ar-SA'),
        time: Math.floor((Date.now() - gameState.startTime) / 1000)
    };
    
    highScores.push(newScore);
    
    // ترتيب النتائج من الأعلى للأدنى
    highScores.sort((a, b) => b.score - a.score);
    
    // الاحتفاظ بأفضل 10 نتائج فقط
    const topScores = highScores.slice(0, 10);
    
    localStorage.setItem('millionaireHighScores', JSON.stringify(topScores));
    updateHighScoresDisplay();
}

// تحديث عرض أفضل النتائج
function updateHighScoresDisplay() {
    const highScores = JSON.parse(localStorage.getItem('millionaireHighScores') || '[]');
    const list = document.getElementById('high-scores');
    
    list.innerHTML = '';
    
    highScores.forEach((score, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="rank">${index + 1}.</span>
            <span class="name">${score.name}</span>
            <span class="score">${score.score.toLocaleString()} دينار</span>
        `;
        list.appendChild(li);
    });
}

// مشاركة النتيجة
function shareResult() {
    const shareText = `🎮 ربحت ${gameState.score.toLocaleString()} دينار في لعبة "من سيربح المليون"! 
جربها الآن: ${window.location.href}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'نتيجتي في لعبة من سيربح المليون',
            text: shareText,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(shareText);
        showNotification('✅ تم نسخ النتيجة إلى الحافظة!', 'success');
    }
}

// الخروج من اللعبة
function quitGame() {
    if (confirm('هل تريد الانسحاب والحصول على المبلغ الحالي؟')) {
        endGame(false);
    }
}

// إعادة التشغيل
function restartGame() {
    elements.screens.end.classList.remove('active');
    elements.screens.start.classList.add('active');
}

// تشغيل الأصوات (محاكاة)
function playSound(type) {
    // يمكن إضافة ملفات صوتية لاحقاً
    console.log(`🔊 تشغيل صوت: ${type}`);
}

// عرض الإشعارات
function showNotification(message, type = 'info') {
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // إزالة الإشعار بعد 3 ثوان
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// بدء اللعبة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    updateHighScoresDisplay();
    console.log('🚀 اللعبة جاهزة!');
});

// إضافة أنماط للرسوم المتحركة
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
