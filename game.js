// ==== نظام لعبة من سريع المليون ====
class MillionaireGame {
    constructor() {
        this.config = {
            version: '2.1.0',
            maxQuestions: 15,
            prizes: [
                100, 200, 300, 500, 1000,
                2000, 4000, 8000, 16000, 32000,
                64000, 125000, 250000, 500000, 1000000
            ],
            safeLevels: [5, 10],
            timePerQuestion: {
                easy: 45,
                medium: 30,
                hard: 20
            },
            lifelines: {
                easy: 4,
                medium: 3,
                hard: 2
            }
        };

        this.state = {
            screen: 'start',
            player: {
                name: 'المتنافس',
                avatar: '👨‍💼',
                score: 0,
                level: 1,
                xp: 0,
                xpToNext: 1000,
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
                animations: true,
                autoNext: true,
                timerEnabled: true,
                background: 'blue'
            },
            currentCategory: 'ثقافة',
            currentDifficulty: 'easy'
        };

        this.elements = {};
        this.init();
    }

    // ==== تهيئة النظام ====
    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadSettings();
        this.loadPlayerData();
        this.updateCategories();
        this.updatePlayerInfo();
        this.showNotification('🎮 النظام جاهز للعب!', 'success');
    }

    // ==== تخزين عناصر DOM ====
    cacheElements() {
        // الشاشات
        this.elements.screens = {
            start: document.getElementById('start-screen'),
            game: document.getElementById('game-screen'),
            results: document.getElementById('results-screen')
        };

        // أزرار التنقل
        this.elements.navBtns = {
            stats: document.getElementById('stats-btn'),
            sound: document.getElementById('sound-btn'),
            help: document.getElementById('help-btn'),
            admin: document.getElementById('admin-btn')
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

        // التصنيفات
        this.elements.categories = document.getElementById('categories-container');

        // مستويات الصعوبة
        this.elements.difficultyOptions = document.querySelectorAll('.difficulty-option');

        // إعدادات المؤقت
        this.elements.timerOptions = document.querySelectorAll('.timer-option');

        // الخلفيات
        this.elements.bgOptions = document.querySelectorAll('.bg-option');

        // الإعدادات
        this.elements.settings = {
            sound: document.getElementById('sound-enabled'),
            animations: document.getElementById('animations-enabled'),
            autoNext: document.getElementById('auto-next')
        };

        // أزرار البدء
        this.elements.startBtns = {
            quick: document.getElementById('quick-play'),
            start: document.getElementById('start-game'),
            tutorial: document.getElementById('tutorial-btn')
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
            questionHint: document.getElementById('question-hint'),
            gameProgress: document.getElementById('game-progress')
        };

        // الإجابات
        this.elements.answersContainer = document.getElementById('answers-container');

        // أدوات المساعدة
        this.elements.lifelines = {
            '5050': document.getElementById('lifeline-5050'),
            'call': document.getElementById('lifeline-call'),
            'audience': document.getElementById('lifeline-audience'),
            'hint': document.getElementById('lifeline-hint')
        };

        // التحكم
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
            accuracy: document.getElementById('accuracy'),
            achievementsContainer: document.getElementById('achievements-container'),
            leaderboard: document.getElementById('leaderboard')
        };

        // الأصوات
        this.elements.sounds = {
            correct: document.getElementById('sound-correct'),
            wrong: document.getElementById('sound-wrong'),
            click: document.getElementById('sound-click'),
            win: document.getElementById('sound-win')
        };

        // النافذة المنبثقة
        this.elements.modal = {
            overlay: document.getElementById('modal-overlay'),
            title: document.getElementById('modal-title'),
            body: document.getElementById('modal-body'),
            close: document.getElementById('modal-close')
        };
    }

    // ==== ربط الأحداث ====
    bindEvents() {
        // تحديث اسم اللاعب
        this.elements.player.name.addEventListener('input', (e) => {
            this.state.player.name = e.target.value || 'المتنافس';
            this.elements.player.currentName.textContent = this.state.player.name;
        });

        // تغيير الصورة الرمزية
        this.elements.player.avatar.addEventListener('change', (e) => {
            this.state.player.avatar = e.target.value;
            this.elements.player.currentAvatar.textContent = this.state.player.avatar;
        });

        // اختيار التصنيف
        this.elements.categories.addEventListener('click', (e) => {
            const categoryBtn = e.target.closest('.category-btn');
            if (categoryBtn) {
                this.selectCategory(categoryBtn.dataset.category);
            }
        });

        // خيار مستوى الصعوبة
        this.elements.difficultyOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.selectDifficulty(option.dataset.level);
            });
        });

        // تحديث الإعدادات
        Object.keys(this.elements.settings).forEach(key => {
            this.elements.settings[key].addEventListener('change', (e) => {
                this.state.settings[key] = e.target.checked;
                this.saveSettings();
            });
        });

        // إعدادات المؤقت
        this.elements.timerOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.elements.timerOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                this.state.settings.timerEnabled = option.dataset.timer === 'true';
                this.saveSettings();
                if (this.state.settings.sound) this.playSound('click');
            });
        });

        // خلفية اللعبة
        this.elements.bgOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.elements.bgOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                this.state.settings.background = option.dataset.bg;
                this.setBackground(this.state.settings.background);
                this.saveSettings();
                if (this.state.settings.sound) this.playSound('click');
            });
        });

        // أزرار البدء
        this.elements.startBtns.quick.addEventListener('click', () => this.startQuickGame());
        this.elements.startBtns.start.addEventListener('click', () => this.startGame());
        this.elements.startBtns.tutorial.addEventListener('click', () => this.showTutorial());

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
        this.elements.navBtns.admin.addEventListener('click', () => this.showAdminPanel());

        // زر إغلاق النافذة المنبثقة
        this.elements.modal.close.addEventListener('click', () => this.hideModal());
        this.elements.modal.overlay.addEventListener('click', (e) => {
            if (e.target === this.elements.modal.overlay) this.hideModal();
        });

        // زر Escape للخروج
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.screen === 'game') {
                this.quitGame();
            }
        });
    }

    // ==== تحميل الإعدادات ====
    loadSettings() {
        const saved = localStorage.getItem('millionaire_settings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                Object.assign(this.state.settings, settings);
                
                // تطبيق الإعدادات
                this.elements.settings.sound.checked = this.state.settings.sound;
                this.elements.settings.animations.checked = this.state.settings.animations;
                this.elements.settings.autoNext.checked = this.state.settings.autoNext;
                
                // تطبيق إعدادات المؤقت
                const timerOption = document.querySelector(`.timer-option[data-timer="${this.state.settings.timerEnabled}"]`);
                if (timerOption) {
                    this.elements.timerOptions.forEach(opt => opt.classList.remove('active'));
                    timerOption.classList.add('active');
                }
                
                // تطبيق الخلفية
                this.setBackground(this.state.settings.background);
                const bgOption = document.querySelector(`.bg-option[data-bg="${this.state.settings.background}"]`);
                if (bgOption) {
                    this.elements.bgOptions.forEach(opt => opt.classList.remove('selected'));
                    bgOption.classList.add('selected');
                }
            } catch (error) {
                console.error('❌ خطأ في تحميل الإعدادات:', error);
            }
        }
    }

    // ==== حفظ الإعدادات ====
    saveSettings() {
        localStorage.setItem('millionaire_settings', JSON.stringify(this.state.settings));
    }

    // ==== تحميل بيانات اللاعب ====
    loadPlayerData() {
        const saved = localStorage.getItem('millionaire_player');
        if (saved) {
            try {
                const playerData = JSON.parse(saved);
                Object.assign(this.state.player, playerData);
                this.updatePlayerInfo();
            } catch (error) {
                console.error('❌ خطأ في تحميل بيانات اللاعب:', error);
            }
        }
    }

    // ==== حفظ بيانات اللاعب ====
    savePlayerData() {
        localStorage.setItem('millionaire_player', JSON.stringify(this.state.player));
    }

    // ==== تعيين الخلفية ====
    setBackground(type) {
        const gradients = {
            blue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            gold: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
            green: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
        };
        
        document.body.style.background = gradients[type] || gradients.blue;
        document.body.style.backgroundAttachment = 'fixed';
        document.body.style.backgroundSize = 'cover';
    }

    // ==== تحديث الفئات المتاحة ====
    updateCategories() {
        if (typeof window.questionBank === 'undefined') {
            console.error('❌ بنك الأسئلة غير موجود');
            this.showNotification('⚠️ جاري تحميل الأسئلة...', 'warning');
            return;
        }

        const categories = window.questionBank.getCategories();
        this.elements.categories.innerHTML = '';

        categories.forEach(category => {
            const questionCount = window.questionBank.getQuestionsCount(category, this.state.currentDifficulty);
            const btn = document.createElement('button');
            btn.className = 'category-btn';
            btn.dataset.category = category;
            btn.innerHTML = `
                <div class="category-icon">${window.questionBank.categories[category].icon}</div>
                <div class="category-name">${category}</div>
                <div class="category-count">${questionCount} سؤال</div>
            `;

            if (category === this.state.currentCategory) {
                btn.classList.add('selected');
            }

            this.elements.categories.appendChild(btn);
        });
    }

    // ==== اختيار التصنيف ====
    selectCategory(category) {
        this.state.currentCategory = category;
        
        // تحديث الواجهة
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.category === category) {
                btn.classList.add('selected');
            }
        });

        this.elements.gameInfo.currentCategory.textContent = category;
        if (this.state.settings.sound) this.playSound('click');
    }

    // ==== اختيار مستوى الصعوبة ====
    selectDifficulty(level) {
        this.state.currentDifficulty = level;
        
        // تحديث الواجهة
        this.elements.difficultyOptions.forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.level === level) {
                option.classList.add('selected');
            }
        });

        // تحديث وصف المستوى
        this.elements.gameInfo.currentDifficulty.textContent = 
            level === 'easy' ? 'سهل' : 
            level === 'medium' ? 'متوسط' : 'صعب';

        // تحديث الفئات
        this.updateCategories();
        
        if (this.state.settings.sound) this.playSound('click');
    }

    // ==== بدء لعبة سريعة ====
    startQuickGame() {
        // اختيار عشوائي للتصنيف
        const categories = window.questionBank.getCategories();
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        this.selectCategory(randomCategory);

        // اختيار عشوائي للمستوى
        const levels = ['easy', 'medium', 'hard'];
        const randomLevel = levels[Math.floor(Math.random() * levels.length)];
        this.selectDifficulty(randomLevel);

        // بدء اللعبة
        this.startGame();
    }

    // ==== بدء اللعبة الرئيسية ====
    startGame() {
        // التحقق من وجود تصنيف مختار
        if (!this.state.currentCategory) {
            this.showNotification('⚠️ الرجاء اختيار تصنيف', 'warning');
            return;
        }

        // إعادة تعيين حالة اللعبة
        this.resetGameState();

        // تحميل الأسئلة
        this.loadQuestions();

        if (this.state.game.questions.length === 0) {
            this.showNotification('❌ لا توجد أسئلة في هذا التصنيف', 'error');
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

        this.showNotification('🎮 بدأت اللعبة، حظاً موفقاً!', 'success');
    }

    // ==== إعادة تعيين حالة اللعبة ====
    resetGameState() {
        this.state.game = {
            currentQuestion: 0,
            selectedAnswer: null,
            isAnswered: false,
            timeLeft: this.config.timePerQuestion[this.state.currentDifficulty],
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
            const status = lifeline.querySelector('.lifeline-status');
            if (status) status.textContent = '🔓';
        });

        // إعادة تعيين زر التالي
        this.elements.controls.next.disabled = true;
    }

    // ==== تحميل الأسئلة ====
    loadQuestions() {
        const category = window.questionBank.categories[this.state.currentCategory];
        if (!category) return;

        const questions = category.levels[this.state.currentDifficulty] || [];
        if (questions.length === 0) {
            // إذا لم توجد أسئلة في هذا المستوى، استخدم المستوى السهل
            this.state.game.questions = category.levels.easy || [];
        } else {
            // خلط الأسئلة وأخذ العدد المطلوب
            const shuffled = [...questions].sort(() => Math.random() - 0.5);
            this.state.game.questions = shuffled.slice(0, this.config.maxQuestions);
        }
    }

    // ==== عرض السؤال الحالي ====
    displayQuestion() {
        const question = this.state.game.questions[this.state.game.currentQuestion];
        if (!question) return;

        // تحديث معلومات السؤال
        this.elements.gameInfo.questionNumber.textContent = this.state.game.currentQuestion + 1;
        this.elements.gameInfo.questionValue.textContent = 
            this.config.prizes[this.state.game.currentQuestion].toLocaleString() + ' دينار';
        this.elements.gameInfo.questionText.textContent = question.question;
        this.elements.gameInfo.questionsLeft.textContent = 
            `${this.config.maxQuestions - this.state.game.currentQuestion - 1} سؤال متبقى`;

        // تحديث التلميح
        this.elements.gameInfo.questionHint.innerHTML = `
            <i class="fas fa-lightbulb"></i>
            <span>${question.hint || "استخدم أدوات المساعدة للحصول على تلميحات"}</span>
        `;

        // عرض الإجابات
        this.renderAnswers(question.answers);

        // تحديث شريط التقدم
        this.updateProgressBar();
    }

    // ==== عرض الإجابات ====
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

    // ==== اختيار إجابة ====
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
        const timeUsed = this.config.timePerQuestion[this.state.currentDifficulty] - this.state.game.timeLeft;
        this.state.game.totalTime += timeUsed;

        if (isCorrect) {
            this.handleCorrectAnswer(index);
        } else {
            this.handleWrongAnswer(index, question.correct);
        }

        // إيقاف المؤقت
        clearInterval(this.state.game.timer);

        // تحديث الإحصائيات
        this.updatePlayerStats(isCorrect);
    }

    // ==== التعامل مع الإجابة الصحيحة ====
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

        this.showNotification('✅ إجابة صحيحة!', 'success');
    }

    // ==== التعامل مع الإجابة الخاطئة ====
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

        this.showNotification('❌ إجابة خاطئة', 'error');
        
        // الانتقال لشاشة النتائج بعد تأخير
        setTimeout(() => {
            this.endGame(false);
        }, 2000);
    }

    // ==== الانتقال للسؤال التالي ====
    nextQuestion() {
        this.state.game.currentQuestion++;

        if (this.state.game.currentQuestion >= this.config.maxQuestions) {
            // فوز بالمليون - انتهت جميع الأسئلة
            this.endGame(true);
            return;
        }

        if (this.state.game.currentQuestion >= this.state.game.questions.length) {
            // لا توجد أسئلة كافية
            this.showNotification('⚠️ انتهت الأسئلة المتاحة', 'warning');
            this.endGame(true);
            return;
        }

        // إعادة تعيين حالة السؤال
        this.state.game.selectedAnswer = null;
        this.state.game.isAnswered = false;
        this.state.game.timeLeft = this.config.timePerQuestion[this.state.currentDifficulty];

        // تحديث الواجهة
        this.elements.controls.next.disabled = true;
        this.elements.gameInfo.timeLeft.textContent = this.state.game.timeLeft;

        // عرض السؤال الجديد
        this.displayQuestion();

        // إعادة تشغيل المؤقت
        this.startTimer();
    }

    // ==== بدء المؤقت ====
    startTimer() {
        clearInterval(this.state.game.timer);

        if (!this.state.settings.timerEnabled) {
            // لعب بدون مؤقت
            this.elements.gameInfo.timeLeft.textContent = '∞';
            this.elements.gameInfo.timeLeft.parentElement.parentElement.classList.add('no-timer');
            return;
        }

        // بدء المؤقت
        this.state.game.timeLeft = this.config.timePerQuestion[this.state.currentDifficulty];
        this.elements.gameInfo.timeLeft.textContent = this.state.game.timeLeft;
        this.elements.gameInfo.timeLeft.parentElement.parentElement.classList.remove('no-timer');

        this.state.game.timer = setInterval(() => {
            this.state.game.timeLeft--;
            this.elements.gameInfo.timeLeft.textContent = this.state.game.timeLeft;

            if (this.state.game.timeLeft <= 10) {
                this.elements.gameInfo.timeLeft.parentElement.parentElement.style.color = '#e17055';
            }

            if (this.state.game.timeLeft <= 0) {
                clearInterval(this.state.game.timer);
                this.handleTimeout();
            }
        }, 1000);
    }

    // ==== التعامل مع انتهاء الوقت ====
    handleTimeout() {
        if (!this.state.settings.timerEnabled) return;

        clearInterval(this.state.game.timer);
        this.showNotification('⏰ انتهى الوقت!', 'error');

        // تعطيل جميع الإجابات
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.disabled = true;
        });

        // إبراز الإجابة الصحيحة
        const question = this.state.game.questions[this.state.game.currentQuestion];
        const correctBtn = document.querySelector(`.answer-btn[data-index="${question.correct}"]`);
        if (correctBtn) {
            correctBtn.classList.add('correct');
        }

        // الانتقال لشاشة النتائج بعد تأخير
        setTimeout(() => {
            this.endGame(false);
        }, 2000);
    }

    // ==== استخدام أداة المساعدة ====
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
            case 'call':
                this.useCallFriend(question);
                break;
            case 'audience':
                this.useAudienceHelp(question);
                break;
            case 'hint':
                this.useHint(question);
                break;
        }

        // تحديث حالة الأداة
        this.state.game.lifelinesUsed.push(type);
        lifeline.disabled = true;
        const status = lifeline.querySelector('.lifeline-status');
        if (status) status.textContent = '🔒';
        
        if (this.state.settings.sound) {
            this.playSound('click');
        }
    }

    // ==== 50:50 ====
    useFiftyFifty(question) {
        const wrongAnswers = [0, 1, 2, 3].filter(index => index !== question.correct);
        const toRemove = wrongAnswers.sort(() => Math.random() - 0.5).slice(0, 2);

        document.querySelectorAll('.answer-btn').forEach((btn, index) => {
            if (toRemove.includes(index)) {
                btn.style.opacity = '0.3';
                btn.disabled = true;
            }
        });

        this.showNotification('✅ حُذفت إجابتان خاطئتان', 'info');
    }

    // ==== الاتصال بصديق ====
    useCallFriend(question) {
        // محاكاة نصيحة الصديق
        const isConfident = Math.random() < 0.7;
        const suggestedAnswer = isConfident ? question.correct :
            [0, 1, 2, 3].filter(num => num !== question.correct)[0];

        const answerLetters = ['أ', 'ب', 'ج', 'د'];
        const friendText = isConfident ?
            `أعتقد أن الإجابة ${answerLetters[suggestedAnswer]} صحيحة بنسبة 80%` :
            `لا أعرف بالتأكيد، لكن ربما الإجابة ${answerLetters[suggestedAnswer]}`;

        this.showModal('📞 اتصال بصديق', `
            <div class="friend-call">
                <div class="friend-avatar">👨‍💼</div>
                <div class="friend-message">
                    <p>"${friendText}"</p>
                    <p class="friend-confidence">مستوى الثقة: ${isConfident ? 'عالٍ' : 'منخفض'}</p>
                </div>
            </div>
        `);
    }

    // ==== مساعدة الجمهور ====
    useAudienceHelp(question) {
        // محاكاة تصويت الجمهور
        let percentages = [0, 0, 0, 0];
        percentages[question.correct] = 60 + Math.random() * 25;

        let remaining = 100 - percentages[question.correct];
        for (let i = 0; i < 4; i++) {
            if (i !== question.correct) {
                percentages[i] = Math.random() * remaining * 0.7;
                remaining -= percentages[i];
            }
        }

        // التعديل ليكون المجموع 100%
        const diff = 100 - percentages.reduce((a, b) => a + b);
        percentages[question.correct] += diff;

        const answerLetters = ['أ', 'ب', 'ج', 'د'];
        let message = '<div class="audience-vote">';
        percentages.forEach((percent, index) => {
            message += `
                <div class="vote-item">
                    <div class="vote-letter">${answerLetters[index]}</div>
                    <div class="vote-bar">
                        <div class="vote-fill" style="width: ${percent}%"></div>
                    </div>
                    <div class="vote-percent">${Math.round(percent)}%</div>
                </div>
            `;
        });
        message += '</div>';

        this.showModal('👥 مساعدة الجمهور', message);
    }

    // ==== استخدام التلميح ====
    useHint(question) {
        const hints = question.hints || [
            'حاول التفكير بشكل مختلف',
            'راجع معلوماتك الأساسية',
            'التركيز على الكلمات المفتاحية'
        ];
        const randomHint = hints[Math.floor(Math.random() * hints.length)];

        this.elements.gameInfo.questionHint.innerHTML = `
            <i class="fas fa-lightbulb"></i>
            <span>${randomHint}</span>
        `;

        this.elements.gameInfo.questionHint.style.display = 'flex';
        this.showNotification('💡 تلميح: ' + randomHint, 'info');
    }

    // ==== إنهاء اللعبة ====
    endGame(isWin) {
        clearInterval(this.state.game.timer);

        const totalTime = Math.floor((Date.now() - this.state.game.startTime) / 1000);
        const avgTime = Math.floor(totalTime / (this.state.game.currentQuestion + 1));
        const accuracy = Math.floor((this.state.game.correctAnswers / (this.state.game.currentQuestion + 1)) * 100);

        // تحديث شاشة النتائج
        this.elements.results.icon.textContent = isWin ? '🏆' : '😢';
        this.elements.results.title.textContent = isWin ? 'مبروك! فزت!' : 'انتهت اللعبة';
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

        // التحقق من الترقية للمستوى
        this.checkLevelUp();

        // حفظ بيانات اللاعب
        this.savePlayerData();

        // عرض الإنجازات
        this.showAchievements(isWin);

        // عرض أفضل النتائج
        this.showLeaderboard();

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

        // إشعار
        this.showNotification(
            isWin ? '🎉 مبروك على الفوز!' : '💪 حاول مرة أخرى، أنت تستطيع!',
            isWin ? 'success' : 'info'
        );
    }

    // ==== حساب نقاط الخبرة ====
    calculateXP(isWin, score, accuracy) {
        let xp = Math.floor(score / 100);
        xp += isWin ? 500 : 100;
        xp += Math.floor(accuracy);
        return xp;
    }

    // ==== التحقق من الترقية ====
    checkLevelUp() {
        while (this.state.player.xp >= this.state.player.xpToNext) {
            this.state.player.xp -= this.state.player.xpToNext;
            this.state.player.level++;
            this.state.player.xpToNext = Math.floor(this.state.player.xpToNext * 1.5);

            this.showNotification(`🎉 ترقية! المستوى ${this.state.player.level}`, 'success');
        }

        this.updatePlayerInfo();
    }

    // ==== تحديث معلومات اللاعب ====
    updatePlayerInfo() {
        this.elements.player.currentName.textContent = this.state.player.name;
        this.elements.player.currentAvatar.textContent = this.state.player.avatar;
        this.elements.player.level.textContent = `المستوى ${this.state.player.level}`;

        const xpPercentage = (this.state.player.xp / this.state.player.xpToNext) * 100;
        this.elements.player.xpProgress.style.width = xpPercentage + '%';
    }

    // ==== تحديث معلومات اللعبة ====
    updateGameInfo() {
        this.elements.gameInfo.currentScore.textContent = this.state.player.score.toLocaleString();
        this.elements.gameInfo.streakCount.textContent = this.state.player.streak;
        this.elements.gameInfo.currentCategory.textContent = this.state.currentCategory;
        this.elements.gameInfo.currentDifficulty.textContent =
            this.state.currentDifficulty === 'easy' ? 'سهل' :
            this.state.currentDifficulty === 'medium' ? 'متوسط' : 'صعب';
    }

    // ==== تحديث شريط التقدم ====
    updateProgressBar() {
        const progress = ((this.state.game.currentQuestion) / this.config.maxQuestions) * 100;
        this.elements.gameInfo.gameProgress.style.width = progress + '%';
    }

    // ==== تحديث إحصائيات اللاعب ====
    updatePlayerStats(isCorrect) {
        // تحديث متوسط الوقت
        const totalQuestions = this.state.game.currentQuestion + 1;
        this.state.player.stats.avgTime = Math.floor(this.state.game.totalTime / totalQuestions);
    }

    // ==== عرض الإنجازات ====
    showAchievements(isWin) {
        if (!this.elements.results.achievementsContainer) return;

        const achievements = [
            { 
                id: 'first_game', 
                name: 'اللعبة الأولى', 
                desc: 'إكمال لعبة كاملة', 
                icon: '🎮', 
                unlocked: true 
            },
            { 
                id: 'perfect_game', 
                name: 'الكمال', 
                desc: 'الإجابة على جميع الأسئلة بشكل صحيح', 
                icon: '⭐', 
                unlocked: isWin && this.state.game.correctAnswers === this.config.maxQuestions 
            },
            { 
                id: 'millionaire', 
                name: 'المليونير', 
                desc: 'الفوز بمليون دينار', 
                icon: '💰', 
                unlocked: isWin && this.state.player.score === 1000000 
            },
            { 
                id: 'speed_demon', 
                name: 'السرعة البرقية', 
                desc: 'متوسط وقت إجابة أقل من 10 ثواني', 
                icon: '⚡', 
                unlocked: this.state.game.totalTime / (this.state.game.currentQuestion + 1) < 10 
            }
        ];

        this.elements.results.achievementsContainer.innerHTML = '';

        achievements.forEach(achievement => {
            if (achievement.unlocked) {
                const div = document.createElement('div');
                div.className = 'achievement unlocked';
                div.innerHTML = `
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.desc}</div>
                `;
                this.elements.results.achievementsContainer.appendChild(div);
            }
        });
    }

    // ==== عرض أفضل النتائج ====
    showLeaderboard() {
        if (!this.elements.results.leaderboard) return;

        const leaderboardData = JSON.parse(localStorage.getItem('millionaire_leaderboard') || '[]');

        // إضافة النتيجة الحالية
        const currentScore = {
            name: this.state.player.name,
            score: this.state.player.score,
            date: new Date().toLocaleDateString('ar-SA'),
            level: this.state.player.level
        };

        leaderboardData.push(currentScore);

        // ترتيب من الأعلى للأدنى
        leaderboardData.sort((a, b) => b.score - a.score);

        // أخذ أفضل 10 نتائج فقط
        const top10 = leaderboardData.slice(0, 10);
        localStorage.setItem('millionaire_leaderboard', JSON.stringify(top10));

        this.elements.results.leaderboard.innerHTML = '';

        top10.forEach((player, index) => {
            const isCurrent = player.name === this.state.player.name && player.score === this.state.player.score;

            const item = document.createElement('div');
            item.className = `leaderboard-item ${isCurrent ? 'current' : ''}`;
            item.innerHTML = `
                <div class="leaderboard-rank">${index + 1}</div>
                <div class="leaderboard-name">${player.name}</div>
                <div class="leaderboard-score">${player.score.toLocaleString()}</div>
            `;
            this.elements.results.leaderboard.appendChild(item);
        });
    }

    // ==== الخروج من اللعبة ====
    quitGame() {
        if (confirm('هل تريد الانسحاب والحصول على المبلغ الحالي؟')) {
            this.endGame(false);
        }
    }

    // ==== إعادة تشغيل اللعبة ====
    restartGame() {
        this.switchScreen('start');
        this.updateCategories();
        this.updatePlayerInfo();
        this.showNotification('🔄 استعد للجولة القادمة!', 'info');
    }

    // ==== العودة للقائمة الرئيسية ====
    goToMainMenu() {
        this.switchScreen('start');
        this.showNotification('🏠 العودة للقائمة الرئيسية', 'info');
    }

    // ==== مشاركة النتائج ====
    shareResults() {
        const shareText = `🎮 ربحت ${this.state.player.score.toLocaleString()} دينار في لعبة "من سريع المليون"!\n${window.location.href}`;

        if (navigator.share) {
            navigator.share({
                title: "نتيجتي في لعبة من سريع المليون",
                text: shareText,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification('✅ تم نسخ النتيجة إلى الحافظة', 'success');
            });
        }
    }

    // ==== تبديل الشاشات ====
    switchScreen(screenName) {
        Object.values(this.elements.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        this.elements.screens[screenName].classList.add('active');
        this.state.screen = screenName;
    }

    // ==== تشغيل الصوت ====
    playSound(type) {
        if (!this.state.settings.sound) return;

        const sound = this.elements.sounds[type];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log('❌ خطأ في تشغيل الصوت:', e));
        }
    }

    // ==== تبديل الصوت ====
    toggleSound() {
        this.state.settings.sound = !this.state.settings.sound;
        this.elements.settings.sound.checked = this.state.settings.sound;
        this.saveSettings();

        const icon = this.elements.navBtns.sound.querySelector('i');
        icon.className = this.state.settings.sound ? 'fas fa-volume-up' : 'fas fa-volume-mute';

        this.showNotification(
            this.state.settings.sound ? '🔊 تم تشغيل الصوت' : '🔇 تم إيقاف الصوت',
            'info'
        );
    }

    // ==== عرض الإحصائيات ====
    showStats() {
        const stats = this.state.player.stats;
        const winRate = stats.gamesPlayed > 0 ?
            Math.floor((stats.totalCorrect / stats.totalQuestions) * 100) : 0;

        this.showModal('📊 إحصائيات اللاعب', `
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
                    <div class="stat-label">دينار مكتسب</div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon">🏆</div>
                    <div class="stat-value">${stats.bestScore.toLocaleString()}</div>
                    <div class="stat-label">أفضل نتيجة</div>
                </div>
            </div>
            <div class="advanced-stats">
                <h4>إحصائيات متقدمة</h4>
                <p>📈 معدل الفوز: ${winRate}%</p>
                <p>⏱️ متوسط وقت الإجابة: ${stats.avgTime || 0} ثانية</p>
                <p>🎯 الدقة العامة: ${stats.totalQuestions > 0 ? Math.floor((stats.totalCorrect / stats.totalQuestions) * 100) : 0}%</p>
            </div>
        `);
    }

    // ==== عرض التعليمات ====
    showHelp() {
        this.showModal('❓ تعليمات اللعبة', `
            <div class="help-content">
                <h3>🎮 كيفية اللعب</h3>
                <ol>
                    <li>اختر فئة الأسئلة (ثقافة، تاريخ، جغرافيا، إلخ)</li>
                    <li>اختر مستوى الصعوبة (سهل، متوسط، صعب)</li>
                    <li>اختر إعدادات المؤقت (مع أو بدون مؤقت)</li>
                    <li>اختر خلفية اللعبة المناسبة</li>
                    <li>أدخل اسمك واختر صورتك الرمزية</li>
                    <li>اضغط على "بدء اللعبة"</li>
                </ol>
                
                <h3>⚡ أثناء اللعبة</h3>
                <ul>
                    <li>لكل سؤال 4 إجابات محتملة</li>
                    <li>اختر الإجابة الصحيحة قبل انتهاء الوقت</li>
                    <li>استخدم أدوات المساعدة بحكمة (4 أدوات)</li>
                    <li>يمكنك الانسحاب في أي وقت والحصول على المبلغ الحالي</li>
                </ul>
                
                <h3>💰 نظام الجوائز</h3>
                <ul>
                    <li>15 سؤال مع جوائز متزايدة</li>
                    <li>1,000 - 32,000 - 1,000,000 دينار</li>
                    <li>مستويات آمنة عند 1,000 و32,000 دينار</li>
                </ul>
                
                <h3>🏆 نظام الإنجازات</h3>
                <p>اكسب نقاط خبرة وارتفع في المستويات، واحصل على إنجازات خاصة!</p>
            </div>
        `);
    }

    // ==== عرض التعليمات التفصيلية ====
    showTutorial() {
        this.showModal('🎓 دليل اللاعب المتقدم', `
            <div class="tutorial-content">
                <h3>🚀 نصائح احترافية:</h3>
                
                <div class="tip-card">
                    <h4>📚 إدارة المعرفة:</h4>
                    <p>ركز على الفئات التي تجيدها، ولكن لا تهمل المجالات الأخرى.</p>
                </div>
                
                <div class="tip-card">
                    <h4>⏱️ إدارة الوقت:</h4>
                    <p>لا تستعجل في الإجابة الأولى، ولكن لا تضيع الوقت أيضاً.</p>
                </div>
                
                <div class="tip-card">
                    <h4>🛠️ استخدام أدوات المساعدة:</h4>
                    <p>احفظ أدوات المساعدة للأسئلة الصعبة والقرارات الحرجة.</p>
                </div>
                
                <div class="tip-card">
                    <h4>💰 استراتيجية الجوائز:</h4>
                    <p>ضع أهدافاً واقعية: 1,000 - 32,000 - 1,000,000 دينار.</p>
                </div>
                
                <h3>🎯 مستويات الصعوبة:</h3>
                <ul>
                    <li><strong>سهل:</strong> الوقت: 45 ثانية، أدوات مساعدة: 4</li>
                    <li><strong>متوسط:</strong> الوقت: 30 ثانية، أدوات مساعدة: 3</li>
                    <li><strong>صعب:</strong> الوقت: 20 ثانية، أدوات مساعدة: 2</li>
                </ul>
                
                <h3>⚙️ إعدادات المؤقت:</h3>
                <ul>
                    <li><strong>مع مؤقت:</strong> مناسب للتحدي والسرعة</li>
                    <li><strong>بدون مؤقت:</strong> مناسب للتعلم والتفكير العميق</li>
                </ul>
                
                <p>💡 تذكر: كلما لعبت أكثر، زادت نقاط خبرتك وارتفع مستواك!</p>
            </div>
        `);
    }

    // ==== عرض لوحة التحكم ====
    showAdminPanel() {
        this.showModal('⚙️ لوحة التحكم', `
            <div class="admin-panel">
                <h3>🛠️ الإدارة المتقدمة</h3>
                <div class="admin-actions">
                    <button class="btn primary" onclick="game.resetAllData()">
                        <i class="fas fa-trash"></i> مسح جميع البيانات
                    </button>
                    <button class="btn secondary" onclick="game.exportData()">
                        <i class="fas fa-download"></i> تصدير البيانات
                    </button>
                    <button class="btn outline" onclick="game.importData()">
                        <i class="fas fa-upload"></i> استيراد البيانات
                    </button>
                </div>
                <div class="system-info">
                    <h4>معلومات النظام</h4>
                    <p>الإصدار: ${this.config.version}</p>
                    <p>إجمالي الأسئلة: ${window.questionBank.getTotalQuestions()}</p>
                    <p>اللاعبون المسجلون: ${JSON.parse(localStorage.getItem('millionaire_leaderboard') || '[]').length}</p>
                    <p>أعلى نتيجة: ${Math.max(...JSON.parse(localStorage.getItem('millionaire_leaderboard') || '[]').map(p => p.score || 0)).toLocaleString()} دينار</p>
                </div>
            </div>
        `);
    }

    // ==== مسح جميع البيانات ====
    resetAllData() {
        if (confirm('⚠️ هل أنت متأكد من حذف جميع الإحصائيات والنتائج؟')) {
            localStorage.clear();
            location.reload();
        }
    }

    // ==== تصدير البيانات ====
    exportData() {
        const data = {
            player: this.state.player,
            settings: this.state.settings,
            leaderboard: JSON.parse(localStorage.getItem('millionaire_leaderboard') || '[]')
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `millionaire_data_${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        this.showNotification('✅ تم تصدير البيانات بنجاح', 'success');
    }

    // ==== استيراد البيانات ====
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (data.player) this.state.player = { ...this.state.player, ...data.player };
                    if (data.settings) this.state.settings = { ...this.state.settings, ...data.settings };
                    if (data.leaderboard) localStorage.setItem('millionaire_leaderboard', JSON.stringify(data.leaderboard));
                    
                    this.saveSettings();
                    this.savePlayerData();
                    this.updatePlayerInfo();

                    this.showNotification('✅ تم استيراد البيانات بنجاح', 'success');
                } catch (error) {
                    this.showNotification('❌ ملف غير صالح', 'error');
                }
            };
            reader.readAsText(file);
        };

        input.click();
    }

    // ==== عرض الإشعار ====
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
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // ==== عرض النافذة المنبثقة ====
    showModal(title, content) {
        this.elements.modal.title.textContent = title;
        this.elements.modal.body.innerHTML = content;
        this.elements.modal.overlay.classList.add('active');
        
        if (this.state.settings.sound) {
            this.playSound('click');
        }
    }

    // ==== إخفاء النافذة المنبثقة ====
    hideModal() {
        this.elements.modal.overlay.classList.remove('active');
        if (this.state.settings.sound) {
            this.playSound('click');
        }
    }
}

// ==== تهيئة اللعبة عند تحميل الصفحة ====
let game;

document.addEventListener('DOMContentLoaded', function() {
    game = new MillionaireGame();
    window.game = game;

    console.log('🎮 من سريع المليون 2.1 - الإصدار المحترف');
    console.log('✅ تم تهيئة النظام بنجاح');
    console.log('🚀 جاهز للعب!');
});
