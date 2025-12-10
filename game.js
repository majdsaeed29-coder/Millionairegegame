// ===== لعبة من سيربح المليون - النسخة الاحترافية =====
class MillionaireGame {
    constructor() {
        // الإعدادات الأساسية
        this.config = {
            version: '3.0.0',
            maxQuestions: 15, // 15 سؤالاً للوصول إلى المليون
            prizes: [
                100,        // 1
                200,        // 2
                300,        // 3
                500,        // 4
                1000,       // 5 - Safe Haven
                2000,       // 6
                5000,       // 7
                10000,      // 8
                16000,      // 9
                32000,      // 10 - Safe Haven
                64000,      // 11
                125000,     // 12
                250000,     // 13
                500000,     // 14
                1000000     // 15 - المليون!
            ],
            safeHavens: [5, 10], // الأسئلة المضمونة
            timePerQuestion: {
                easy: 45,   // الأسئلة 1-5
                medium: 30, // الأسئلة 6-10
                hard: 20    // الأسئلة 11-15
            },
            lifelines: {
                easy: 4,    // 4 أدوات للأسئلة السهلة
                medium: 3,  // 3 أدوات للأسئلة المتوسطة
                hard: 2     // 2 أداة للأسئلة الصعبة
            },
            categories: {},
            currentCategory: 'ثقافة'
        };

        // حالة اللعبة
        this.state = {
            screen: 'start',
            player: {
                name: 'المتنافس',
                avatar: '👑',
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
                    avgTime: 0,
                    highestStreak: 0
                }
            },
            game: {
                currentQuestion: 0,
                selectedAnswer: null,
                isAnswered: false,
                timeLeft: 45,
                timer: null,
                lifelinesUsed: [],
                questions: [],
                startTime: null,
                correctAnswers: 0,
                totalTime: 0,
                difficultyLevel: 'easy',
                category: 'ثقافة'
            },
            settings: {
                sound: true,
                vibration: true,
                animations: true,
                autoNext: true,
                timerEnabled: true
            },
            isPremium: false // للاشتراك المميز
        };

        this.elements = {};
        this.adsManager = null;
        this.subscriptionManager = null;
        this.init();
    }

    // تهيئة اللعبة
    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadSettings();
        this.loadSubscriptionStatus();
        this.loadCategories();
        this.updatePlayerInfo();
        this.showNotification('مرحباً في من سيربح المليون!', 'info');
        
        // تهيئة نظام الإعلانات والاشتراك
        this.initAdsSystem();
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
            level: document.getElementById('player-level')
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
            start: document.getElementById('start-game'),
            subscribe: document.getElementById('subscribe-btn')
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
            'call': document.getElementById('lifeline-call'),
            'audience': document.getElementById('lifeline-audience'),
            'skip': document.getElementById('lifeline-skip')
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
            accuracy: document.getElementById('accuracy'),
            leaderboard: document.getElementById('leaderboard')
        };

        // الأصوات
        this.elements.sounds = {
            correct: document.getElementById('sound-correct'),
            wrong: document.getElementById('sound-wrong'),
            click: document.getElementById('sound-click'),
            win: document.getElementById('sound-win')
        };

        // التنقل
        this.elements.navBtns = {
            stats: document.getElementById('stats-btn'),
            sound: document.getElementById('sound-btn'),
            help: document.getElementById('help-btn'),
            subscribe: document.getElementById('subscribe-btn')
        };

        // تأثير الوميض
        this.elements.flashOverlay = document.getElementById('flash-overlay');
        
        // مؤشر الاشتراك
        this.elements.premiumIndicator = document.getElementById('premium-indicator');
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
                this.playSound('click');
            });
        });

        // أزرار البدء
        this.elements.startBtns.quick.addEventListener('click', () => this.startQuickGame());
        this.elements.startBtns.start.addEventListener('click', () => this.startGame());
        this.elements.startBtns.subscribe.addEventListener('click', () => this.showSubscriptionModal());

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
        this.elements.navBtns.subscribe.addEventListener('click', () => this.showSubscriptionModal());

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
        document.addEventListener('touchstart', (e) => {
            // تأثيرات اللمس
            const target = e.target.closest('.answer-btn, .lifeline-btn, .btn, .control-btn, .action-btn');
            if (target) {
                target.style.transform = 'scale(0.95)';
                target.style.transition = 'transform 0.1s ease';
            }
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            const target = e.target.closest('.answer-btn, .lifeline-btn, .btn, .control-btn, .action-btn');
            if (target) {
                target.style.transform = '';
                target.style.transition = 'transform 0.3s ease';
            }
        }, { passive: true });
    }

    // تهيئة نظام الإعلانات
    initAdsSystem() {
        this.adsManager = new AdManager(this);
        this.subscriptionManager = new SubscriptionManager(this);
    }

    // تحميل حالة الاشتراك
    loadSubscriptionStatus() {
        const isPremium = localStorage.getItem('millionaire_premium') === 'true';
        this.state.isPremium = isPremium;
        
        if (isPremium && this.elements.premiumIndicator) {
            this.elements.premiumIndicator.style.display = 'inline-flex';
        }
    }

    // تحميل الفئات
    loadCategories() {
        const categories = [
            { id: 'ثقافة', name: 'ثقافة', icon: '📚', description: 'أدب، فن، سينما، موسيقى' },
            { id: 'تاريخ', name: 'تاريخ', icon: '🏛️', description: 'تاريخ عربي وعالمي' },
            { id: 'جغرافيا', name: 'جغرافيا', icon: '🌍', description: 'دول، عواصم، طبيعة' },
            { id: 'علوم', name: 'علوم', icon: '🔬', description: 'فيزياء، كيمياء، أحياء، فضاء' },
            { id: 'رياضة', name: 'رياضة', icon: '⚽', description: 'كرة قدم، أولمبياد، ألعاب' },
            { id: 'أطفال', name: 'أطفال', icon: '🧸', description: 'أسئلة تعليمية وترفيهية' },
            { id: 'سياسة', name: 'سياسة', icon: '💼', description: 'سياسة عربية ودولية' },
            { id: 'شاملة', name: 'شاملة', icon: '🎯', description: 'خليط من جميع الفئات' }
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
                <div class="category-desc">${category.description}</div>
            `;

            if (category.id === this.state.game.category) {
                btn.classList.add('selected');
            }

            this.elements.categories.appendChild(btn);
        });
    }

    // اختيار الفئة
    selectCategory(category) {
        this.state.game.category = category;
        
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.category === category) {
                btn.classList.add('selected');
            }
        });

        this.elements.gameInfo.currentCategory.textContent = category;
        this.playSound('click');
    }

    // اختيار مستوى الصعوبة
    selectDifficulty(level) {
        this.state.game.difficultyLevel = level;
        
        this.elements.difficultyOptions.forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.level === level) {
                option.classList.add('selected');
            }
        });

        this.playSound('click');
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

        // تحديث شجرة الجوائز
        this.updatePrizeTrack();

        // بدء المؤقت
        this.startTimer();

        // عرض السؤال الأول
        this.displayQuestion();

        // تحديث معلومات اللعبة
        this.updateGameInfo();

        // تسجيل وقت البدء
        this.state.game.startTime = Date.now();

        this.showNotification('بدأت اللعبة! حظاً موفقاً 🚀', 'success');
    }

    // إعادة تعيين حالة اللعبة
    resetGameState() {
        const currentQuestion = this.state.game.currentQuestion;
        let difficulty = 'easy';
        
        if (currentQuestion >= 10) difficulty = 'hard';
        else if (currentQuestion >= 5) difficulty = 'medium';
        
        this.state.game = {
            currentQuestion: 0,
            selectedAnswer: null,
            isAnswered: false,
            timeLeft: this.config.timePerQuestion[difficulty],
            timer: null,
            lifelinesUsed: [],
            questions: [],
            startTime: null,
            correctAnswers: 0,
            totalTime: 0,
            difficultyLevel: difficulty,
            category: this.state.game.category || 'ثقافة'
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

    // تحميل الأسئلة (تستبدل هذه الدالة بقاعدة بياناتك)
    loadQuestions() {
        // هذا مثال لأسئلة تجريبية
        // ستقوم أنت بإضافة أسئلتك هنا أو ربطها بقاعدة بيانات
        
        const sampleQuestions = this.getSampleQuestions();
        const categoryQuestions = sampleQuestions.filter(q => 
            q.category === this.state.game.category || this.state.game.category === 'شاملة'
        );
        
        if (categoryQuestions.length === 0) {
            // إذا لم توجد أسئلة في الفئة، استخدم جميع الأسئلة
            this.state.game.questions = sampleQuestions.slice(0, this.config.maxQuestions);
        } else {
            // استخدم أسئلة الفئة مع توزيع الصعوبة
            const easy = categoryQuestions.filter(q => q.difficulty === 'easy');
            const medium = categoryQuestions.filter(q => q.difficulty === 'medium');
            const hard = categoryQuestions.filter(q => q.difficulty === 'hard');
            
            // 5 أسئلة سهلة، 5 متوسطة، 5 صعبة
            const selectedQuestions = [
                ...this.getRandomQuestions(easy, 5),
                ...this.getRandomQuestions(medium, 5),
                ...this.getRandomQuestions(hard, 5)
            ];
            
            this.state.game.questions = selectedQuestions.slice(0, this.config.maxQuestions);
        }
        
        // إذا لم تكن هناك أسئلة كافية
        if (this.state.game.questions.length < this.config.maxQuestions) {
            const needed = this.config.maxQuestions - this.state.game.questions.length;
            const extraQuestions = this.getSampleQuestions().filter(q => 
                !this.state.game.questions.includes(q)
            );
            this.state.game.questions.push(...this.getRandomQuestions(extraQuestions, needed));
        }
    }

    // الحصول على أسئلة عشوائية
    getRandomQuestions(questions, count) {
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    // أسئلة تجريبية (تستبدلها بأسئلتك)
    getSampleQuestions() {
        return [
            // أسئلة سهلة (1-5)
            {
                id: 1,
                question: "ما هي عاصمة فرنسا؟",
                answers: ["لندن", "برلين", "باريس", "روما"],
                correct: 2,
                hint: "تسمى مدينة الأنوار",
                category: "جغرافيا",
                difficulty: "easy",
                explanation: "باريس هي عاصمة فرنسا وتسمى مدينة الأنوار"
            },
            {
                id: 2,
                question: "كم عدد أيام الأسبوع؟",
                answers: ["5", "6", "7", "8"],
                correct: 2,
                hint: "من السبت إلى الجمعة",
                category: "أطفال",
                difficulty: "easy",
                explanation: "الأسبوع يتكون من 7 أيام"
            },
            {
                id: 3,
                question: "ما هو لون التفاحة الناضجة؟",
                answers: ["أخضر", "أحمر", "أصفر", "برتقالي"],
                correct: 1,
                hint: "عادة ما تكون حمراء",
                category: "أطفال",
                difficulty: "easy",
                explanation: "التفاحة الناضجة عادة ما تكون حمراء"
            },
            {
                id: 4,
                question: "من هو أول خليفة في الإسلام؟",
                answers: ["عمر بن الخطاب", "عثمان بن عفان", "أبو بكر الصديق", "علي بن أبي طالب"],
                correct: 2,
                hint: "الصديق رفيق النبي",
                category: "تاريخ",
                difficulty: "easy",
                explanation: "أبو بكر الصديق هو أول الخلفاء الراشدين"
            },
            {
                id: 5,
                question: "ما هو أكبر كوكب في المجموعة الشمسية؟",
                answers: ["الأرض", "المشتري", "زحل", "نبتون"],
                correct: 1,
                hint: "الكوكب العملاق",
                category: "علوم",
                difficulty: "easy",
                explanation: "المشتري هو أكبر كوكب في المجموعة الشمسية"
            },
            
            // أسئلة متوسطة (6-10)
            {
                id: 6,
                question: "من هو مؤلف كتاب 'الأمير'؟",
                answers: ["أفلاطون", "ميكافيلي", "أرسطو", "هوبز"],
                correct: 1,
                hint: "كاتب إيطالي من عصر النهضة",
                category: "ثقافة",
                difficulty: "medium",
                explanation: "نيكولو ميكافيلي هو مؤلف كتاب الأمير"
            },
            {
                id: 7,
                question: "في أي عام هجري حدثت معركة بدر؟",
                answers: ["1 هـ", "2 هـ", "3 هـ", "4 هـ"],
                correct: 1,
                hint: "السنة الثانية للهجرة",
                category: "تاريخ",
                difficulty: "medium",
                explanation: "معركة بدر الكبرى حدثت في السنة الثانية للهجرة"
            },
            {
                id: 8,
                question: "ما هو أطول نهر في العالم؟",
                answers: ["الأمازون", "النيل", "يانغتسي", "الميسيسيبي"],
                correct: 0,
                hint: "يوجد في أمريكا الجنوبية",
                category: "جغرافيا",
                difficulty: "medium",
                explanation: "نهر الأمازون هو أطول نهر في العالم"
            },
            {
                id: 9,
                question: "من هو مخترع المصباح الكهربائي؟",
                answers: ["نيوتن", "أينشتاين", "إديسون", "تسلا"],
                correct: 2,
                hint: "مخترع أمريكي شهير",
                category: "علوم",
                difficulty: "medium",
                explanation: "توماس إديسون هو مخترع المصباح الكهربائي المتوهج"
            },
            {
                id: 10,
                question: "ما هي عاصمة الولايات المتحدة الأمريكية؟",
                answers: ["نيويورك", "لوس أنجلوس", "واشنطن", "شيكاغو"],
                correct: 2,
                hint: "سميت على اسم رئيس",
                category: "سياسة",
                difficulty: "medium",
                explanation: "واشنطن العاصمة هي عاصمة الولايات المتحدة"
            },
            
            // أسئلة صعبة (11-15)
            {
                id: 11,
                question: "من هو الفنان الذي رسم لوحة 'الموناليزا'؟",
                answers: ["فان جوخ", "رامبرانت", "ليوناردو دا فنشي", "بيكاسو"],
                correct: 2,
                hint: "فنان إيطالي من عصر النهضة",
                category: "ثقافة",
                difficulty: "hard",
                explanation: "ليوناردو دا فنشي هو الفنان الإيطالي الذي رسم الموناليزا"
            },
            {
                id: 12,
                question: "ما هي النظرية التي وضعها أينشتاين لربط الزمان والمكان؟",
                answers: ["النظرية النسبية", "النظرية الكمية", "نظرية الأوتار", "نظرية الفوضى"],
                correct: 0,
                hint: "نظرية فيزيائية شهيرة",
                category: "علوم",
                difficulty: "hard",
                explanation: "النظرية النسبية لأينشتاين تربط بين الزمان والمكان"
            },
            {
                id: 13,
                question: "من هو السلطان العثماني الذي فتح القسطنطينية؟",
                answers: ["سليم الأول", "سليمان القانوني", "محمد الفاتح", "بايزيد الثاني"],
                correct: 2,
                hint: "لقب بالفاتح",
                category: "تاريخ",
                difficulty: "hard",
                explanation: "السلطان محمد الفاتح هو من فتح القسطنطينية عام 1453"
            },
            {
                id: 14,
                question: "ما هو أعمق نقطة في المحيطات؟",
                answers: ["خندق ماريانا", "خندق بورتوريكو", "خندق اليابان", "خندق تونغا"],
                correct: 0,
                hint: "في المحيط الهادئ",
                category: "جغرافيا",
                difficulty: "hard",
                explanation: "خندق ماريانا هو أعمق نقطة في المحيطات"
            },
            {
                id: 15,
                question: "من هو اللاعب الوحيد الذي فاز بكأس العالم 3 مرات؟",
                answers: ["بيليه", "مارادونا", "زيدان", "ميسي"],
                correct: 0,
                hint: "لاعب برازيلي",
                category: "رياضة",
                difficulty: "hard",
                explanation: "البرازيلي بيليه هو اللاعب الوحيد الذي فاز بكأس العالم 3 مرات"
            }
        ];
    }

    // تحديث شجرة الجوائز
    updatePrizeTrack() {
        const track = document.querySelector('.prize-track-inner');
        if (!track) return;

        track.innerHTML = '';
        
        this.config.prizes.forEach((prize, index) => {
            const item = document.createElement('div');
            item.className = 'prize-item';
            
            if (index === this.state.game.currentQuestion) {
                item.classList.add('current');
            } else if (index < this.state.game.currentQuestion) {
                item.classList.add('passed');
            }
            
            // وضع علامة على الأسئلة المضمونة
            if (this.config.safeHavens.includes(index + 1)) {
                item.style.borderStyle = 'dashed';
            }
            
            item.innerHTML = `
                <div class="prize-level">${index + 1}</div>
                <div class="prize-amount">${prize.toLocaleString()}</div>
            `;
            
            track.appendChild(item);
        });
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

        // تحديث مستوى الصعوبة بناءً على رقم السؤال
        let difficultyText = 'سهل';
        if (this.state.game.currentQuestion >= 10) difficultyText = 'صعب';
        else if (this.state.game.currentQuestion >= 5) difficultyText = 'متوسط';
        
        this.elements.gameInfo.currentDifficulty.textContent = difficultyText;

        // إخفاء التلميح
        this.elements.gameInfo.questionHint.style.display = 'none';

        // عرض الإجابات
        this.renderAnswers(question.answers);
        
        // تحديث شجرة الجوائز
        this.updatePrizeTrack();
        
        // تحديث وقت السؤال بناءً على صعوبته
        this.updateQuestionTime();
    }

    // تحديث وقت السؤال
    updateQuestionTime() {
        let difficulty = 'easy';
        if (this.state.game.currentQuestion >= 10) difficulty = 'hard';
        else if (this.state.game.currentQuestion >= 5) difficulty = 'medium';
        
        this.state.game.timeLeft = this.config.timePerQuestion[difficulty];
        this.elements.gameInfo.timeLeft.textContent = this.state.game.timeLeft;
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
        const timeUsed = this.state.game.timeLeft;
        this.state.game.totalTime += timeUsed;

        // تطبيق تأثير الوميض
        this.applyFlashEffect(isCorrect);

        if (isCorrect) {
            this.handleCorrectAnswer(index);
        } else {
            this.handleWrongAnswer(index, question.correct);
        }

        // إيقاف المؤقت
        clearInterval(this.state.game.timer);
    }

    // تطبيق تأثير الوميض
    applyFlashEffect(isCorrect) {
        const flashOverlay = this.elements.flashOverlay;
        flashOverlay.className = 'flash-overlay ' + (isCorrect ? 'flash-green' : 'flash-red');
        
        // إعادة تعيين للسماح بتطبيق الأنيميشن مرة أخرى
        void flashOverlay.offsetWidth;
        
        // إخفاء التأثير بعد الانتهاء
        setTimeout(() => {
            flashOverlay.className = 'flash-overlay';
        }, 1000);
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

        // تحديث أعلى تتابع
        if (this.state.player.streak > this.state.player.stats.highestStreak) {
            this.state.player.stats.highestStreak = this.state.player.streak;
        }

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

        this.showNotification('إجابة صحيحة! مبروك 🎉', 'success');
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

        this.showNotification('إجابة خاطئة! حاول مرة أخرى 💪', 'error');
        
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
        this.updateQuestionTime();

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
            this.elements.gameInfo.timeLeft.style.color = 'var(--success)';
            return;
        }

        this.elements.gameInfo.timeLeft.style.color = 'white';
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
        this.showNotification("انتهى الوقت! ⏰", 'error');

        // تطبيق تأثير الوميض الأحمر
        this.applyFlashEffect(false);

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

        // تمكين زر التالي
        this.elements.controls.next.disabled = false;

        // تشغيل الصوت
        if (this.state.settings.sound) {
            this.playSound('wrong');
        }

        // الانتقال لشاشة النتائج بعد تأخير
        setTimeout(() => {
            this.endGame(false);
        }, 3000);
    }

    // استخدام أداة المساعدة
    async useLifeline(type) {
        if (this.state.game.lifelinesUsed.includes(type)) {
            return;
        }

        const question = this.state.game.questions[this.state.game.currentQuestion];
        const lifeline = this.elements.lifelines[type];

        // التحقق من تخطي السؤال (يتطلب إعلان)
        if (type === 'skip') {
            if (!this.state.isPremium) {
                const adWatched = await this.adsManager.showAd('skip');
                if (!adWatched) return;
            }
            this.skipQuestion();
            return;
        }

        switch(type) {
            case '5050':
                this.useFiftyFifty(question);
                break;
            case 'call':
                this.useCallFriend(question);
                break;
            case 'audience':
                this.useAudiencePoll(question);
                break;
        }

        // تحديث حالة الأداة
        this.state.game.lifelinesUsed.push(type);
        lifeline.disabled = true;
        lifeline.style.opacity = '0.6';
        
        this.playSound('click');
    }

    // 50:50
    useFiftyFifty(question) {
        const wrongAnswers = [0, 1, 2, 3].filter(index => index !== question.correct);
        const toRemove = wrongAnswers.sort(() => Math.random() - 0.5).slice(0, 2);

        document.querySelectorAll('.answer-btn').forEach((btn, index) => {
            if (toRemove.includes(index)) {
                btn.style.opacity = '0.3';
                btn.style.pointerEvents = 'none';
            }
        });

        this.showNotification('تم حذف إجابتين خاطئتين 🎯', 'info');
    }

    // اتصال بصديق
    useCallFriend(question) {
        // محاكاة نصيحة الصديق
        const isConfident = Math.random() < 0.7;
        let suggestedAnswer;
        
        if (isConfident) {
            suggestedAnswer = question.correct;
        } else {
            const wrongAnswers = [0, 1, 2, 3].filter(i => i !== question.correct);
            suggestedAnswer = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
        }
        
        const answerLetters = ['أ', 'ب', 'ج', 'د'];
        const friendMessages = [
            `أعتقد أن الإجابة هي ${answerLetters[suggestedAnswer]}`,
            `أنا متأكد بنسبة 80% أنها ${answerLetters[suggestedAnswer]}`,
            `رأيي الشخصي أنها ${answerLetters[suggestedAnswer]}`,
            `بناءً على معرفتي، أختار ${answerLetters[suggestedAnswer]}`
        ];
        
        const message = friendMessages[Math.floor(Math.random() * friendMessages.length)];
        const confidence = isConfident ? 'واثق' : 'غير متأكد';

        this.showModal('اتصال بصديق 📞', `
            <div class="lifeline-modal">
                <div class="friend-call">
                    <div class="friend-avatar">
                        <i class="fas fa-user-tie"></i>
                    </div>
                    <div class="friend-message">
                        <p class="message">"${message}"</p>
                        <p class="confidence">الحالة: ${confidence}</p>
                    </div>
                </div>
                <p class="hint">نصيحة: هذا مجرد رأي، القرار النهائي لك 🤔</p>
            </div>
        `);
    }

    // رأي الجمهور
    useAudiencePoll(question) {
        // محاكاة تصويت الجمهور
        let percentages = [0, 0, 0, 0];
        
        // الإجابة الصحيحة تحصل على أعلى نسبة
        percentages[question.correct] = 60 + Math.random() * 25;
        
        // توزيع النسبة المتبقية
        let remaining = 100 - percentages[question.correct];
        const wrongAnswers = [0, 1, 2, 3].filter(i => i !== question.correct);
        
        wrongAnswers.forEach((answer, index) => {
            if (index === wrongAnswers.length - 1) {
                percentages[answer] = remaining;
            } else {
                const share = Math.random() * remaining * 0.7;
                percentages[answer] = share;
                remaining -= share;
            }
        });
        
        // عرض النتائج
        let html = '<div class="audience-poll">';
        html += '<h4><i class="fas fa-users"></i> تصويت الجمهور</h4>';
        
        percentages.forEach((percent, index) => {
            const answerLetters = ['أ', 'ب', 'ج', 'د'];
            html += `
                <div class="poll-row">
                    <span class="poll-letter">${answerLetters[index]}</span>
                    <div class="poll-bar">
                        <div class="poll-fill" style="width: ${percent}%"></div>
                    </div>
                    <span class="poll-percent">${Math.round(percent)}%</span>
                </div>
            `;
        });
        
        html += '<p class="poll-note">هذه نتائج افتراضية بناءً على إحصائيات سابقة 📊</p>';
        html += '</div>';
        
        this.showModal('تصويت الجمهور 👥', html);
    }

    // تخطي السؤال
    skipQuestion() {
        this.state.game.currentQuestion++;
        
        if (this.state.game.currentQuestion >= this.config.maxQuestions) {
            this.endGame(true);
            return;
        }
        
        // تحديث الواجهة
        this.updateQuestionTime();
        this.elements.gameInfo.timeLeft.textContent = this.state.game.timeLeft;
        
        // عرض السؤال الجديد
        this.displayQuestion();
        
        // إعادة تشغيل المؤقت
        this.startTimer();
        
        this.showNotification('تم تخطي السؤال بنجاح! ⏭️', 'success');
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
            'إنجاز رائع يستحق الاحتفال 🎊' : 'حاول مرة أخرى لتحقيق نتيجة أفضل 💪';

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
        this.state.player.stats.avgTime = Math.floor((this.state.player.stats.avgTime + avgTime) / 2);

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

        // تحديث لوحة المتصدرين
        this.updateLeaderboard();

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

        // تطبيق تأثير الوميض
        if (isWin) {
            this.applyFlashEffect(true);
        }

        this.showNotification(
            isWin ? 'إنجاز رائع! شاهد نتائجك 🎉' : 'حاول مرة أخرى، أنت تستطيع! 💪',
            isWin ? 'success' : 'info'
        );
    }

    // حساب نقاط الخبرة
    calculateXP(isWin, score, accuracy) {
        let xp = Math.floor(score / 100);
        xp += isWin ? 500 : 100;
        xp += Math.floor(accuracy);
        xp += this.state.player.streak * 10;
        return xp;
    }

    // التحقق من الترقية
    checkLevelUp() {
        while (this.state.player.xp >= this.state.player.xpToNext) {
            this.state.player.xp -= this.state.player.xpToNext;
            this.state.player.level++;
            this.state.player.xpToNext = Math.floor(this.state.player.xpToNext * 1.5);

            this.showNotification(`مبروك! لقد وصلت للمستوى ${this.state.player.level} ⭐`, 'success');
        }

        this.updatePlayerInfo();
    }

    // تحديث معلومات اللاعب
    updatePlayerInfo() {
        this.elements.player.currentName.textContent = this.state.player.name;
        this.elements.player.currentAvatar.textContent = this.state.player.avatar;
        this.elements.player.level.textContent = `المستوى ${this.state.player.level}`;
    }

    // تحديث معلومات اللعبة
    updateGameInfo() {
        this.elements.gameInfo.currentScore.textContent = this.state.player.score.toLocaleString();
        this.elements.gameInfo.streakCount.textContent = this.state.player.streak;
        this.elements.gameInfo.currentCategory.textContent = this.state.game.category;
    }

    // تحديث لوحة المتصدرين
    updateLeaderboard() {
        if (!this.elements.results.leaderboard) return;

        const leaderboardData = JSON.parse(localStorage.getItem('millionaire_leaderboard') || '[]');
        
        // إضافة النتيجة الحالية
        const currentScore = {
            name: this.state.player.name,
            score: this.state.player.score,
            date: new Date().toLocaleDateString('ar-SA'),
            level: this.state.player.level,
            avatar: this.state.player.avatar
        };

        leaderboardData.push(currentScore);

        // ترتيب من الأعلى للأدنى
        leaderboardData.sort((a, b) => b.score - a.score);

        // الاحتفاظ بأفضل 10 نتائج فقط
        const top10 = leaderboardData.slice(0, 10);
        localStorage.setItem('millionaire_leaderboard', JSON.stringify(top10));

        this.elements.results.leaderboard.innerHTML = '';

        top10.forEach((player, index) => {
            const isCurrent = player.name === this.state.player.name && 
                             player.score === this.state.player.score;

            const item = document.createElement('div');
            item.className = `leaderboard-item ${isCurrent ? 'current' : ''}`;
            item.innerHTML = `
                <div class="leaderboard-rank">${index + 1}</div>
                <div class="leaderboard-avatar">${player.avatar || '👤'}</div>
                <div class="leaderboard-name">${player.name}</div>
                <div class="leaderboard-score">${player.score.toLocaleString()}</div>
            `;

            this.elements.results.leaderboard.appendChild(item);
        });
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
        this.showNotification(this.state.settings.sound ? 'تم تشغيل الصوت 🔊' : 'تم إيقاف الصوت 🔇', 'info');
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
                    <p><i class="fas fa-trophy"></i> معدل الفوز: ${winRate}%</p>
                    <p><i class="fas fa-clock"></i> متوسط وقت الإجابة: ${stats.avgTime || 0} ثانية</p>
                    <p><i class="fas fa-fire"></i> أعلى تتابع: ${stats.highestStreak}</p>
                    <p><i class="fas fa-chart-pie"></i> الدقة العامة: ${stats.totalQuestions > 0 ? Math.floor((stats.totalCorrect / stats.totalQuestions) * 100) : 0}%</p>
                </div>
            </div>
        `;

        this.showModal('إحصائيات اللاعب 📊', content);
    }

    // عرض التعليمات
    showHelp() {
        const content = `
            <div class="help-content">
                <h3><i class="fas fa-graduation-cap"></i> كيفية اللعب</h3>
                <ol>
                    <li><strong>اختر اسمك</strong> وصورتك الرمزية</li>
                    <li><strong>اختر فئة الأسئلة</strong> المفضلة لديك</li>
                    <li><strong>ابدأ اللعبة</strong> واجب على 15 سؤالاً</li>
                    <li><strong>احصل على المليون دينار</strong> باجتياز جميع الأسئلة</li>
                </ol>
                
                <h4><i class="fas fa-life-ring"></i> أدوات المساعدة</h4>
                <ul>
                    <li><strong>50:50</strong> - يحذف إجابتين خاطئتين</li>
                    <li><strong>اتصال بصديق</strong> - استشارة خبير</li>
                    <li><strong>رأي الجمهور</strong> - تصويت المشاهدين</li>
                    <li><strong>تخطي السؤال</strong> - شاهد إعلان لتخطي</li>
                </ul>
                
                <h4><i class="fas fa-money-bill-wave"></i> نظام الجوائز</h4>
                <p>15 سؤالاً مع جوائز متزايدة تصل إلى 1,000,000 دينار</p>
                <p>الأسئلة 5 و10 مضمونة (Safe Haven)</p>
                
                <h4><i class="fas fa-crown"></i> النسخة المميزة</h4>
                <p>اشترك لإزالة الإعلانات والحصول على ميزات حصرية</p>
            </div>
        `;

        this.showModal('تعليمات اللعبة ❓', content);
    }

    // عرض نافذة الاشتراك
    showSubscriptionModal() {
        if (this.subscriptionManager) {
            this.subscriptionManager.showSubscriptionModal();
        }
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
            this.playSound('click');
        };

        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
                setTimeout(() => overlay.remove(), 300);
                this.playSound('click');
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
        this.showNotification('استعد للجولة القادمة! 🚀', 'info');
    }

    // العودة للقائمة الرئيسية
    goToMainMenu() {
        this.switchScreen('start');
        this.showNotification('العودة للقائمة الرئيسية 🏠', 'info');
    }

    // مشاركة النتائج
    shareResults() {
        const shareText = `💰 ربحت ${this.state.player.score.toLocaleString()} دينار في لعبة من سيربح المليون! 
لعبت ${this.state.game.correctAnswers} من ${this.state.game.currentQuestion + 1} إجابة صحيحة.
جربها الآن: ${window.location.href}`;

        if (navigator.share) {
            navigator.share({
                title: "نتيجتي في لعبة من سيربح المليون",
                text: shareText,
                url: window.location.href
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification('تم نسخ النتيجة إلى الحافظة 📋', 'success');
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
                
                // تحديث إعدادات المؤقت
                if (this.state.settings.timerEnabled !== undefined) {
                    const timerOption = document.querySelector(`.timer-option[data-timer="${this.state.settings.timerEnabled}"]`);
                    if (timerOption) {
                        document.querySelectorAll('.timer-option').forEach(opt => opt.classList.remove('active'));
                        timerOption.classList.add('active');
                    }
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
    console.log('🚀 من سيربح المليون - النسخة الاحترافية 3.0.0');
    console.log('🎮 نظام 15 سؤالاً كاملاً مع تأثيرات الوميض');
    console.log('🛠️ 4 أدوات مساعدة + نظام إعلانات واشتراك');
    console.log('📱 تصميم متكامل للهواتف');
});
