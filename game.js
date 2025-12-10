// ===== لعبة من سيربح المليون - نسخة الهاتف =====
class MillionaireGame {
    constructor() {
        this.config = {
            version: '2.0.0',
            maxQuestions: 10,
            prizes: [
                100, 200, 300, 500, 1000,
                2000, 4000, 8000, 16000, 32000
            ],
            timePerQuestion: {
                easy: 30,
                medium: 20,
                hard: 15
            },
            lifelines: {
                easy: 3,
                medium: 2,
                hard: 1
            },
            categories: {},
            difficulty: 'easy',
            currentCategory: 'ثقافة'
        };

        this.state = {
            screen: 'start',
            player: {
                name: 'المتنافس',
                avatar: '👨‍💼',
                score: 0,
                level: 1,
                xp: 0,
                xpToNext: 100,
                streak: 0,
                stats: {
                    gamesPlayed: 0,
                    totalCorrect: 0,
                    totalQuestions: 0,
                    totalMoney: 0,
                    bestScore: 0,
                    avgTime: 0
                }
            },
            game: {
                currentQuestion: 0,
                selectedAnswer: null,
                isAnswered: false,
                timeLeft: 30,
                timer: null,
                lifelinesUsed: [],
                questions: [],
                startTime: null,
                correctAnswers: 0,
                totalTime: 0
            },
            settings: {
                sound: true,
                vibration: true,
                animations: true,
                autoNext: true,
                timerEnabled: true
            }
        };

        this.elements = {};
        this.init();
    }

    // تهيئة اللعبة
    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadSettings();
        this.loadCategories();
        this.updatePlayerInfo();
        this.showNotification('مرحباً في من سيربح المليون!', 'info');
    }

    // تخزين عناصر DOM
    cacheElements() {
        // الشاشات
        this.elements.screens = {
            start: document.getElementById('start-screen'),
            game: document.getElementById('game-screen'),
            results: document.getElementById('results-screen')
        };

        // بيانات اللاعب
        this.elements.player = {
            name: document.getElementById('player-name'),
            avatar: document.getElementById('player-avatar'),
            currentName: document.getElementById('current-player'),
            currentAvatar: document.getElementById('current-avatar'),
            level: document.getElementById('player-level'),
            xpProgress: document.getElementById('xp-progress')
        };

        // الفئات
        this.elements.categories = document.getElementById('categories-container');

        // مستويات الصعوبة
        this.elements.difficultyOptions = document.querySelectorAll('.difficulty-option');

        // إعدادات المؤقت
        this.elements.timerOptions = document.querySelectorAll('.timer-option');

        // الأزرار
        this.elements.startBtns = {
            quick: document.getElementById('quick-play'),
            start: document.getElementById('start-game')
        };

        // معلومات اللعبة
        this.elements.gameInfo = {
            timeLeft: document.getElementById('time-left'),
            currentScore: document.getElementById('current-score'),
            streakCount: document.getElementById('streak-count'),
            questionNumber: document.getElementById('q-number'),
            questionsLeft: document.getElementById('questions-left'),
            currentCategory: document.getElementById('current-category'),
            currentDifficulty: document.getElementById('current-difficulty'),
            questionValue: document.getElementById('question-value'),
            questionText: document.getElementById('question-text'),
            questionHint: document.getElementById('question-hint')
        };

        // الإجابات
        this.elements.answersContainer = document.getElementById('answers-container');

        // أدوات المساعدة
        this.elements.lifelines = {
            '5050': document.getElementById('lifeline-5050'),
            'hint': document.getElementById('lifeline-hint')
        };

        // أزرار التحكم
        this.elements.controls = {
            quit: document.getElementById('quit-btn'),
            next: document.getElementById('next-btn'),
            playAgain: document.getElementById('play-again-btn'),
            share: document.getElementById('share-result-btn'),
            mainMenu: document.getElementById('main-menu-btn')
        };

        // النتائج
        this.elements.results = {
            icon: document.getElementById('result-icon'),
            title: document.getElementById('result-title'),
            subtitle: document.getElementById('result-subtitle'),
            finalAmount: document.getElementById('final-amount'),
            prizeConversion: document.getElementById('prize-conversion'),
            correctCount: document.getElementById('correct-count'),
            totalTime: document.getElementById('total-time'),
            avgTime: document.getElementById('avg-time'),
            accuracy: document.getElementById('accuracy')
        };

        // الأصوات
        this.elements.sounds = {
            correct: document.getElementById('sound-correct'),
            wrong: document.getElementById('sound-wrong'),
            click: document.getElementById('sound-click'),
            win: document.getElementById('sound-win')
        };

        // أزرار التنقل
        this.elements.navBtns = {
            stats: document.getElementById('stats-btn'),
            sound: document.getElementById('sound-btn'),
            help: document.getElementById('help-btn')
        };
    }

    // ربط الأحداث
    bindEvents() {
        // تحديث اسم اللاعب
        this.elements.player.name.addEventListener('input', (e) => {
            this.state.player.name = e.target.value || 'المتنافس';
            this.elements.player.currentName.textContent = this.state.player.name;
        });

        // تحديث الصورة الرمزية
        this.elements.player.avatar.addEventListener('change', (e) => {
            this.state.player.avatar = e.target.value;
            this.elements.player.currentAvatar.textContent = this.state.player.avatar;
        });

        // اختيار الفئة
        this.elements.categories.addEventListener('click', (e) => {
            const categoryBtn = e.target.closest('.category-btn');
            if (categoryBtn) {
                this.selectCategory(categoryBtn.dataset.category);
            }
        });

        // اختيار مستوى الصعوبة
        this.elements.difficultyOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.selectDifficulty(option.dataset.level);
            });
        });

        // إعدادات المؤقت
        this.elements.timerOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.elements.timerOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                this.state.settings.timerEnabled = option.dataset.timer === 'true';
                this.saveSettings();
                if (this.state.settings.sound) {
                    this.playSound('click');
                }
            });
        });

        // أزرار البدء
        this.elements.startBtns.quick.addEventListener('click', () => this.startQuickGame());
        this.elements.startBtns.start.addEventListener('click', () => this.startGame());

        // أدوات المساعدة
        Object.keys(this.elements.lifelines).forEach(key => {
            this.elements.lifelines[key].addEventListener('click', () => {
                if (!this.elements.lifelines[key].disabled) {
                    this.useLifeline(key);
                }
            });
        });

        // أزرار التحكم
        this.elements.controls.quit.addEventListener('click', () => this.quitGame());
        this.elements.controls.next.addEventListener('click', () => this.nextQuestion());
        this.elements.controls.playAgain.addEventListener('click', () => this.restartGame());
        this.elements.controls.share.addEventListener('click', () => this.shareResults());
        this.elements.controls.mainMenu.addEventListener('click', () => this.goToMainMenu());

        // أزرار التنقل
        this.elements.navBtns.sound.addEventListener('click', () => this.toggleSound());
        this.elements.navBtns.stats.addEventListener('click', () => this.showStats());
        this.elements.navBtns.help.addEventListener('click', () => this.showHelp());

        // زر الهروب
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.screen === 'game') {
                this.quitGame();
            }
        });

        // تحسينات اللمس
        this.setupTouchEvents();
    }

    // إعداد أحداث اللمس
    setupTouchEvents() {
        // منع التمرير غير المقصود
        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('.answers-grid') || e.target.closest('.lifelines-grid')) {
                e.preventDefault();
            }
        }, { passive: false });

        // تأثيرات اللمس
        document.addEventListener('touchstart', (e) => {
            const target = e.target.closest('.answer-btn, .lifeline-btn, .btn, .control-btn, .action-btn');
            if (target) {
                target.style.transform = 'scale(0.95)';
            }
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            const target = e.target.closest('.answer-btn, .lifeline-btn, .btn, .control-btn, .action-btn');
            if (target) {
                target.style.transform = '';
            }
        }, { passive: true });
    }

    // تحميل الفئات
    loadCategories() {
        const categories = [
            { id: 'ثقافة', name: 'ثقافة', icon: '📚' },
            { id: 'تاريخ', name: 'تاريخ', icon: '🏛️' },
            { id: 'جغرافيا', name: 'جغرافيا', icon: '🌍' },
            { id: 'علوم', name: 'علوم', icon: '🔬' },
            { id: 'رياضة', name: 'رياضة', icon: '⚽' },
            { id: 'أطفال', name: 'أطفال', icon: '🧸' },
            { id: 'سياسة', name: 'سياسة', icon: '💼' },
            { id: 'شاملة', name: 'شاملة', icon: '🎯' }
        ];

        this.config.categories = {};
        categories.forEach(cat => {
            this.config.categories[cat.id] = cat;
        });

        this.renderCategories();
    }

    // عرض الفئات
    renderCategories() {
        if (!this.elements.categories) return;

        this.elements.categories.innerHTML = '';
        Object.values(this.config.categories).forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'category-btn';
            btn.dataset.category = category.id;
            btn.innerHTML = `
                <div class="category-icon">${category.icon}</div>
                <div class="category-name">${category.name}</div>
            `;

            if (category.id === this.state.game.currentCategory) {
                btn.classList.add('selected');
            }

            this.elements.categories.appendChild(btn);
        });
    }

    // اختيار الفئة
    selectCategory(category) {
        this.state.game.currentCategory = category;
        
        // تحديث الواجهة
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.category === category) {
                btn.classList.add('selected');
            }
        });

        this.elements.gameInfo.currentCategory.textContent = category;
        
        if (this.state.settings.sound) {
            this.playSound('click');
        }
    }

    // اختيار مستوى الصعوبة
    selectDifficulty(level) {
        this.config.difficulty = level;
        
        // تحديث الواجهة
        this.elements.difficultyOptions.forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.level === level) {
                option.classList.add('selected');
            }
        });

        this.elements.gameInfo.currentDifficulty.textContent =
            level === 'easy' ? 'سهل' :
            level === 'medium' ? 'متوسط' : 'صعب';

        if (this.state.settings.sound) {
            this.playSound('click');
        }
    }

    // بدء لعبة سريعة
    startQuickGame() {
        const categories = Object.keys(this.config.categories);
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        this.selectCategory(randomCategory);

        const levels = ['easy', 'medium', 'hard'];
        const randomLevel = levels[Math.floor(Math.random() * levels.length)];
        this.selectDifficulty(randomLevel);

        this.startGame();
    }

    // بدء اللعبة الرئيسية
    startGame() {
        // إعادة تعيين حالة اللعبة
        this.resetGameState();

        // تحميل الأسئلة
        this.loadQuestions();

        if (this.state.game.questions.length === 0) {
            this.showNotification('لا توجد أسئلة في هذه الفئة', 'error');
            return;
        }

        // تبديل الشاشة
        this.switchScreen('game');

        // بدء المؤقت
        this.startTimer();

        // عرض السؤال الأول
        this.displayQuestion();

        // تحديث معلومات اللعبة
        this.updateGameInfo();

        // تسجيل وقت البدء
        this.state.game.startTime = Date.now();

        this.showNotification('بدأت اللعبة! حظاً موفقاً', 'success');
    }

    // إعادة تعيين حالة اللعبة
    resetGameState() {
        this.state.game = {
            currentQuestion: 0,
            selectedAnswer: null,
            isAnswered: false,
            timeLeft: this.config.timePerQuestion[this.config.difficulty],
            timer: null,
            lifelinesUsed: [],
            questions: [],
            startTime: null,
            correctAnswers: 0,
            totalTime: 0
        };

        // إعادة تعيين أدوات المساعدة
        Object.keys(this.elements.lifelines).forEach(key => {
            const lifeline = this.elements.lifelines[key];
            lifeline.disabled = false;
            lifeline.style.opacity = '1';
        });

        // تعطيل زر التالي
        this.elements.controls.next.disabled = true;
    }

    // تحميل الأسئلة
    loadQuestions() {
        // هذا هو مكان الربط بقاعدة البيانات
        // حالياً نستخدم أسئلة تجريبية
        
        const sampleQuestions = this.getSampleQuestions();
        const shuffled = [...sampleQuestions].sort(() => Math.random() - 0.5);
        this.state.game.questions = shuffled.slice(0, this.config.maxQuestions);
    }

    // الحصول على أسئلة تجريبية
    getSampleQuestions() {
        return [
            {
                question: "ما هي عاصمة فرنسا؟",
                answers: ["روما", "برلين", "باريس", "لندن"],
                correct: 2,
                hint: "تقع في أوروبا الغربية",
                category: "ثقافة"
            },
            {
                question: "كم عدد أيام الأسبوع؟",
                answers: ["5", "6", "7", "8"],
                correct: 2,
                hint: "من السبت إلى الجمعة",
                category: "أطفال"
            },
            {
                question: "ما هو أطول نهر في العالم؟",
                answers: ["الأمازون", "النيل", "يانغتسي", "الميسيسيبي"],
                correct: 1,
                hint: "يوجد في أفريقيا",
                category: "جغرافيا"
            },
            {
                question: "من هو مخترع المصباح الكهربائي؟",
                answers: ["نيوتن", "أينشتاين", "اديسون", "تسلا"],
                correct: 2,
                hint: "أمريكي شهير",
                category: "علوم"
            },
            {
                question: "في أي سنة هجرية حدثت معركة بدر؟",
                answers: ["1 هـ", "2 هـ", "3 هـ", "4 هـ"],
                correct: 1,
                hint: "السنة الثانية للهجرة",
                category: "تاريخ"
            },
            {
                question: "ما هي عاصمة الولايات المتحدة الأمريكية؟",
                answers: ["نيويورك", "لوس أنجلوس", "واشنطن", "شيكاغو"],
                correct: 2,
                hint: "سميت على اسم رئيس",
                category: "سياسة"
            },
            {
                question: "كم عدد لاعبي كرة القدم في كل فريق؟",
                answers: ["10", "11", "12", "13"],
                correct: 1,
                hint: "بما فيهم حارس المرمى",
                category: "رياضة"
            },
            {
                question: "من هو مؤلف كتاب 'الأمير'؟",
                answers: ["أفلاطون", "ميكافيلي", "أرسطو", "هوبز"],
                correct: 1,
                hint: "إيطالي من عصر النهضة",
                category: "ثقافة"
            },
            {
                question: "ما هو لون التفاحة الناضجة؟",
                answers: ["أخضر", "أحمر", "أصفر", "برتقالي"],
                correct: 1,
                hint: "عادة ما تكون حمراء",
                category: "أطفال"
            },
            {
                question: "ما هو أكبر محيط في العالم؟",
                answers: ["المحيط الهندي", "المحيط الأطلسي", "المحيط الهادئ", "المحيط المتجمد"],
                correct: 2,
                hint: "أكبر من جميع المحيطات",
                category: "جغرافيا"
            }
        ];
    }

    // عرض السؤال الحالي
    displayQuestion() {
        const question = this.state.game.questions[this.state.game.currentQuestion];
        if (!question) return;

        // تحديث معلومات السؤال
        this.elements.gameInfo.questionNumber.textContent = this.state.game.currentQuestion + 1;
        this.elements.gameInfo.questionValue.textContent = 
            this.config.prizes[this.state.game.currentQuestion].toLocaleString() + ' دينار';
        this.elements.gameInfo.questionText.textContent = question.question;
        this.elements.gameInfo.questionsLeft.textContent = 
            `${this.config.maxQuestions - this.state.game.currentQuestion - 1} أسئلة متبقية`;

        // إخفاء التلميح
        this.elements.gameInfo.questionHint.style.display = 'none';

        // عرض الإجابات
        this.renderAnswers(question.answers);
    }

    // عرض الإجابات
    renderAnswers(answers) {
        if (!this.elements.answersContainer) return;

        this.elements.answersContainer.innerHTML = '';
        const letters = ['أ', 'ب', 'ج', 'د'];

        answers.forEach((answer, index) => {
            const btn = document.createElement('button');
            btn.className = 'answer-btn';
            btn.dataset.index = index;
            btn.innerHTML = `
                <div class="answer-letter">${letters[index]}</div>
                <div class="answer-text">${answer}</div>
            `;

            btn.addEventListener('click', () => this.selectAnswer(index));

            this.elements.answersContainer.appendChild(btn);
        });
    }

    // اختيار إجابة
    selectAnswer(index) {
        if (this.state.game.isAnswered) return;

        this.state.game.selectedAnswer = index;
        this.state.game.isAnswered = true;

        // تحديث واجهة المستخدم
        document.querySelectorAll('.answer-btn').forEach((btn, i) => {
            if (i === index) {
                btn.classList.add('selected');
            }
            btn.disabled = true;
        });

        // تمكين زر التالي
        this.elements.controls.next.disabled = false;

        // التحقق من الإجابة
        const question = this.state.game.questions[this.state.game.currentQuestion];
        const isCorrect = index === question.correct;

        // تسجيل الوقت المستغرق
        const timeUsed = this.config.timePerQuestion[this.config.difficulty] - this.state.game.timeLeft;
        this.state.game.totalTime += timeUsed;

        if (isCorrect) {
            this.handleCorrectAnswer(index);
        } else {
            this.handleWrongAnswer(index, question.correct);
        }

        // إيقاف المؤقت
        clearInterval(this.state.game.timer);
    }

    // التعامل مع الإجابة الصحيحة
    handleCorrectAnswer(selectedIndex) {
        const btn = document.querySelector(`.answer-btn[data-index="${selectedIndex}"]`);
        if (btn) {
            btn.classList.add('correct');
        }

        // تحديث النقاط
        this.state.player.score = this.config.prizes[this.state.game.currentQuestion];
        this.state.game.correctAnswers++;

        // تحديث التتابع
        this.state.player.streak++;
        this.elements.gameInfo.streakCount.textContent = this.state.player.streak;

        // تحديث النقاط على الشاشة
        this.elements.gameInfo.currentScore.textContent = this.state.player.score.toLocaleString();

        // تشغيل الصوت
        if (this.state.settings.sound) {
            this.playSound('correct');
        }

        // الاهتزاز
        if (this.state.settings.vibration && navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }

        this.showNotification('إجابة صحيحة! مبروك', 'success');
    }

    // التعامل مع الإجابة الخاطئة
    handleWrongAnswer(selectedIndex, correctIndex) {
        // إبراز الإجابة الخاطئة
        const wrongBtn = document.querySelector(`.answer-btn[data-index="${selectedIndex}"]`);
        if (wrongBtn) {
            wrongBtn.classList.add('wrong');
        }

        // إبراز الإجابة الصحيحة
        const correctBtn = document.querySelector(`.answer-btn[data-index="${correctIndex}"]`);
        if (correctBtn) {
            correctBtn.classList.add('correct');
        }

        // إعادة تعيين التتابع
        this.state.player.streak = 0;
        this.elements.gameInfo.streakCount.textContent = '0';

        // تشغيل الصوت
        if (this.state.settings.sound) {
            this.playSound('wrong');
        }

        // الاهتزاز
        if (this.state.settings.vibration && navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 200]);
        }

        this.showNotification('إجابة خاطئة! حاول مرة أخرى', 'error');
        
        // الانتقال لشاشة النتائج بعد تأخير
        setTimeout(() => {
            this.endGame(false);
        }, 3000);
    }

    // الانتقال للسؤال التالي
    nextQuestion() {
        this.state.game.currentQuestion++;

        if (this.state.game.currentQuestion >= this.config.maxQuestions) {
            this.endGame(true);
            return;
        }

        if (this.state.game.currentQuestion >= this.state.game.questions.length) {
            this.showNotification('لا توجد أسئلة كافية', 'warning');
            this.endGame(true);
            return;
        }

        // إعادة تعيين حالة السؤال
        this.state.game.selectedAnswer = null;
        this.state.game.isAnswered = false;
        this.state.game.timeLeft = this.config.timePerQuestion[this.config.difficulty];

        // تحديث الواجهة
        this.elements.controls.next.disabled = true;
        this.elements.gameInfo.timeLeft.textContent = this.state.game.timeLeft;

        // عرض السؤال الجديد
        this.displayQuestion();

        // إعادة تشغيل المؤقت
        this.startTimer();
    }

    // بدء المؤقت
    startTimer() {
        clearInterval(this.state.game.timer);

        if (!this.state.settings.timerEnabled) {
            this.elements.gameInfo.timeLeft.textContent = '∞';
            return;
        }

        this.state.game.timeLeft = this.config.timePerQuestion[this.config.difficulty];
        this.elements.gameInfo.timeLeft.textContent = this.state.game.timeLeft;

        this.state.game.timer = setInterval(() => {
            this.state.game.timeLeft--;
            this.elements.gameInfo.timeLeft.textContent = this.state.game.timeLeft;

            if (this.state.game.timeLeft <= 10) {
                this.elements.gameInfo.timeLeft.style.color = '#e17055';
            }

            if (this.state.game.timeLeft <= 0) {
                clearInterval(this.state.game.timer);
                this.handleTimeout();
            }
        }, 1000);
    }

    // انتهاء الوقت
    handleTimeout() {
        if (!this.state.settings.timerEnabled) return;

        clearInterval(this.state.game.timer);
        this.showNotification("انتهى الوقت!", 'error');

        // تعطيل جميع الإجابات
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.disabled = true;
        });

        // إظهار الإجابة الصحيحة
        const question = this.state.game.questions[this.state.game.currentQuestion];
        const correctBtn = document.querySelector(`.answer-btn[data-index="${question.correct}"]`);
        if (correctBtn) {
            correctBtn.classList.add('correct');
        }

        // الانتقال لشاشة النتائج بعد تأخير
        setTimeout(() => {
            this.endGame(false);
        }, 3000);
    }

    // استخدام أداة المساعدة
    useLifeline(type) {
        if (this.state.game.lifelinesUsed.includes(type)) {
            return;
        }

        const question = this.state.game.questions[this.state.game.currentQuestion];
        const lifeline = this.elements.lifelines[type];

        switch(type) {
            case '5050':
                this.useFiftyFifty(question);
                break;
            case 'hint':
                this.useHint(question);
                break;
        }

        // تحديث حالة الأداة
        this.state.game.lifelinesUsed.push(type);
        lifeline.disabled = true;
        lifeline.style.opacity = '0.6';
        
        if (this.state.settings.sound) {
            this.playSound('click');
        }
    }

    // 50:50
    useFiftyFifty(question) {
        const wrongAnswers = [0, 1, 2, 3].filter(index => index !== question.correct);
        const toRemove = wrongAnswers.sort(() => Math.random() - 0.5).slice(0, 2);

        document.querySelectorAll('.answer-btn').forEach((btn, index) => {
            if (toRemove.includes(index)) {
                btn.style.opacity = '0.3';
                btn.disabled = true;
            }
        });

        this.showNotification('تم حذف إجابتين خاطئتين', 'info');
    }

    // استخدام التلميح
    useHint(question) {
        const hint = question.hint || 'حاول التفكير بشكل مختلف';
        this.elements.gameInfo.questionHint.innerHTML = `
            <i class="fas fa-lightbulb"></i>
            <span>${hint}</span>
        `;
        this.elements.gameInfo.questionHint.style.display = 'flex';
        this.showNotification('تلميح: ' + hint, 'info');
    }

    // إنهاء اللعبة
    endGame(isWin) {
        clearInterval(this.state.game.timer);

        const totalTime = Math.floor((Date.now() - this.state.game.startTime) / 1000);
        const avgTime = Math.floor(totalTime / (this.state.game.currentQuestion + 1));
        const accuracy = Math.floor((this.state.game.correctAnswers / (this.state.game.currentQuestion + 1)) * 100);

        // تحديث شاشة النتائج
        this.elements.results.icon.textContent = isWin ? '🏆' : '💡';
        this.elements.results.title.textContent = isWin ? 'مبروك! لقد فزت' : 'انتهت اللعبة';
        this.elements.results.subtitle.textContent = isWin ? 
            'إنجاز رائع يستحق الاحتفال' : 'حاول مرة أخرى لتحقيق نتيجة أفضل';

        this.elements.results.finalAmount.textContent = this.state.player.score.toLocaleString() + ' دينار';
        this.elements.results.prizeConversion.textContent = `≈ ${Math.floor(this.state.player.score / 1000)} دولار`;

        this.elements.results.correctCount.textContent = this.state.game.correctAnswers;
        this.elements.results.totalTime.textContent = totalTime;
        this.elements.results.avgTime.textContent = avgTime;
        this.elements.results.accuracy.textContent = accuracy + '%';

        // تحديث إحصائيات اللاعب
        this.state.player.stats.gamesPlayed++;
        this.state.player.stats.totalCorrect += this.state.game.correctAnswers;
        this.state.player.stats.totalQuestions += this.state.game.currentQuestion + 1;
        this.state.player.stats.totalMoney += this.state.player.score;

        if (this.state.player.score > this.state.player.stats.bestScore) {
            this.state.player.stats.bestScore = this.state.player.score;
        }

        // حساب XP الجديدة
        const xpGained = this.calculateXP(isWin, this.state.player.score, accuracy);
        this.state.player.xp += xpGained;

        // التحقق من الترقية
        this.checkLevelUp();

        // حفظ بيانات اللاعب
        this.savePlayerData();

        // تبديل الشاشة
        this.switchScreen('results');

        // تشغيل الصوت
        if (this.state.settings.sound) {
            if (isWin) {
                this.playSound('win');
            } else {
                this.playSound('wrong');
            }
        }

        this.showNotification(
            isWin ? 'إنجاز رائع! شاهد نتائجك' : 'حاول مرة أخرى، أنت تستطيع!',
            isWin ? 'success' : 'info'
        );
    }

    // حساب نقاط الخبرة
    calculateXP(isWin, score, accuracy) {
        let xp = Math.floor(score / 100);
        xp += isWin ? 50 : 10;
        xp += Math.floor(accuracy / 10);
        return xp;
    }

    // التحقق من الترقية
    checkLevelUp() {
        while (this.state.player.xp >= this.state.player.xpToNext) {
            this.state.player.xp -= this.state.player.xpToNext;
            this.state.player.level++;
            this.state.player.xpToNext = Math.floor(this.state.player.xpToNext * 1.5);

            this.showNotification(`مبروك! لقد وصلت للمستوى ${this.state.player.level}`, 'success');
        }

        this.updatePlayerInfo();
    }

    // تحديث معلومات اللاعب
    updatePlayerInfo() {
        this.elements.player.currentName.textContent = this.state.player.name;
        this.elements.player.currentAvatar.textContent = this.state.player.avatar;
        this.elements.player.level.textContent = `مستوى ${this.state.player.level}`;

        const xpPercentage = (this.state.player.xp / this.state.player.xpToNext) * 100;
        this.elements.player.xpProgress.style.width = xpPercentage + '%';
    }

    // تحديث معلومات اللعبة
    updateGameInfo() {
        this.elements.gameInfo.currentScore.textContent = this.state.player.score.toLocaleString();
        this.elements.gameInfo.streakCount.textContent = this.state.player.streak;
        this.elements.gameInfo.currentCategory.textContent = this.state.game.currentCategory;
        this.elements.gameInfo.currentDifficulty.textContent =
            this.config.difficulty === 'easy' ? 'سهل' :
            this.config.difficulty === 'medium' ? 'متوسط' : 'صعب';
    }

    // تبديل الشاشات
    switchScreen(screenName) {
        Object.values(this.elements.screens).forEach(screen => {
            screen.classList.remove('active');
        });

        this.elements.screens[screenName].classList.add('active');
        this.state.screen = screenName;
    }

    // تشغيل الصوت
    playSound(type) {
        if (!this.state.settings.sound) return;

        const sound = this.elements.sounds[type];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log('خطأ في تشغيل الصوت:', e));
        }
    }

    // تبديل الصوت
    toggleSound() {
        this.state.settings.sound = !this.state.settings.sound;
        const icon = this.elements.navBtns.sound.querySelector('i');
        icon.className = this.state.settings.sound ? 'fas fa-volume-up' : 'fas fa-volume-mute';

        this.saveSettings();
        this.showNotification(this.state.settings.sound ? 'تم تشغيل الصوت' : 'تم إيقاف الصوت', 'info');
    }

    // عرض الإحصائيات
    showStats() {
        const stats = this.state.player.stats;
        const winRate = stats.gamesPlayed > 0 ? 
            Math.floor((stats.totalCorrect / stats.totalQuestions) * 100) : 0;

        const content = `
            <div class="stats-popup">
                <h3><i class="fas fa-chart-line"></i> إحصائيات اللاعب</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-icon">🎮</div>
                        <div class="stat-value">${stats.gamesPlayed}</div>
                        <div class="stat-label">عدد الألعاب</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-icon">✅</div>
                        <div class="stat-value">${stats.totalCorrect}</div>
                        <div class="stat-label">إجابات صحيحة</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-icon">💰</div>
                        <div class="stat-value">${stats.totalMoney.toLocaleString()}</div>
                        <div class="stat-label">مجموع الأرباح</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-icon">🏆</div>
                        <div class="stat-value">${stats.bestScore.toLocaleString()}</div>
                        <div class="stat-label">أفضل نتيجة</div>
                    </div>
                </div>
                <div class="advanced-stats">
                    <h4>إحصائيات متقدمة</h4>
                    <p>معدل الفوز: ${winRate}%</p>
                    <p>متوسط وقت الإجابة: ${stats.avgTime || 0} ثانية</p>
                    <p>الدقة العامة: ${stats.totalQuestions > 0 ? Math.floor((stats.totalCorrect / stats.totalQuestions) * 100) : 0}%</p>
                </div>
            </div>
        `;

        this.showModal('إحصائيات اللاعب', content);
    }

    // عرض التعليمات
    showHelp() {
        const content = `
            <div class="help-content">
                <h3><i class="fas fa-graduation-cap"></i> كيفية اللعب</h3>
                <ol>
                    <li>اختر اسمك وصورتك الرمزية</li>
                    <li>اختر فئة الأسئلة المفضلة لديك</li>
                    <li>اختر مستوى الصعوبة المناسب</li>
                    <li>حدد إذا كنت تريد مؤقت أم لا</li>
                    <li>اضغط على "بدء اللعبة"</li>
                    <li>اختر الإجابة الصحيحة قبل انتهاء الوقت</li>
                    <li>استخدم أدوات المساعدة بحكمة</li>
                    <li>احصل على أكبر قدر من المال!</li>
                </ol>
                
                <h4>نظام الجوائز</h4>
                <p>10 أسئلة مع جوائز متزايدة تصل إلى 32,000 دينار</p>
                
                <h4>نظام الإنجازات</h4>
                <p>اكسب نقاط خبرة وارتفع في المستويات</p>
            </div>
        `;

        this.showModal('تعليمات اللعبة', content);
    }

    // عرض نافذة
    showModal(title, content) {
        // إنشاء عناصر النافذة
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">${content}</div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // إظهار النافذة
        setTimeout(() => overlay.classList.add('active'), 10);

        // إغلاق النافذة
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.onclick = () => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
            if (this.state.settings.sound) {
                this.playSound('click');
            }
        };

        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
                setTimeout(() => overlay.remove(), 300);
                if (this.state.settings.sound) {
                    this.playSound('click');
                }
            }
        };
    }

    // إظهار إشعار
    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-icon">
                ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
            </div>
            <div class="notification-message">${message}</div>
        `;

        container.appendChild(notification);

        // إزالة الإشعار بعد 5 ثواني
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // الخروج من اللعبة
    quitGame() {
        if (confirm('هل تريد الانسحاب والحصول على المبلغ الحالي؟')) {
            this.endGame(false);
        }
    }

    // إعادة تشغيل اللعبة
    restartGame() {
        this.switchScreen('start');
        this.loadCategories();
        this.updatePlayerInfo();
        this.showNotification('استعد للجولة القادمة!', 'info');
    }

    // العودة للقائمة الرئيسية
    goToMainMenu() {
        this.switchScreen('start');
        this.showNotification('العودة للقائمة الرئيسية', 'info');
    }

    // مشاركة النتائج
    shareResults() {
        const shareText = `💰 ربحت ${this.state.player.score.toLocaleString()} دينار في لعبة من سيربح المليون!`;

        if (navigator.share) {
            navigator.share({
                title: "نتيجتي في لعبة من سيربح المليون",
                text: shareText,
                url: window.location.href
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification('تم نسخ النتيجة إلى الحافظة', 'success');
            }).catch(() => {
                alert(shareText);
            });
        }
    }

    // تحميل الإعدادات
    loadSettings() {
        const saved = localStorage.getItem('millionaire_settings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                Object.assign(this.state.settings, settings);
                
                // تحديث زر الصوت
                const icon = this.elements.navBtns.sound.querySelector('i');
                if (icon) {
                    icon.className = this.state.settings.sound ? 'fas fa-volume-up' : 'fas fa-volume-mute';
                }
            } catch (e) {
                console.log('خطأ في تحميل الإعدادات:', e);
            }
        }
    }

    // حفظ الإعدادات
    saveSettings() {
        try {
            localStorage.setItem('millionaire_settings', JSON.stringify(this.state.settings));
        } catch (e) {
            console.log('خطأ في حفظ الإعدادات:', e);
        }
    }

    // حفظ بيانات اللاعب
    savePlayerData() {
        try {
            localStorage.setItem('millionaire_player', JSON.stringify(this.state.player));
        } catch (e) {
            console.log('خطأ في حفظ بيانات اللاعب:', e);
        }
    }
}

// ===== تهيئة اللعبة عند تحميل الصفحة =====
let game;

document.addEventListener('DOMContentLoaded', function() {
    game = new MillionaireGame();
    window.game = game;
    console.log('من سيربح المليون - نسخة الهاتف جاهزة!');
});
