// مدير الأسئلة
class QuestionManager {
    constructor() {
        this.categories = {};
        this.usedQuestions = new Set();
        this.initializeCategories();
        this.loadQuestions();
        console.log('✅ مدير الأسئلة جاهز');
    }

    // تهيئة التصنيفات
    initializeCategories() {
        GameConfig.CATEGORIES.forEach(category => {
            this.categories[category.id] = {
                ...category,
                questions: {
                    easy: [],
                    medium: [],
                    hard: []
                }
            };
        });
    }

    // تحميل الأسئلة
    loadQuestions() {
        try {
            const saved = localStorage.getItem(GameConfig.STORAGE_KEYS.QUESTIONS);
            if (saved) {
                const data = JSON.parse(saved);
                this.categories = data.categories || this.categories;
                console.log('✅ تم تحميل الأسئلة المحفوظة');
                return;
            }
        } catch (error) {
            console.error('❌ خطأ في تحميل الأسئلة:', error);
        }

        // إنشاء أسئلة افتراضية إذا لم توجد
        this.createDefaultQuestions();
    }

    // إنشاء أسئلة افتراضية
    createDefaultQuestions() {
        // أسئلة عامة سهلة
        this.addQuestions('general', 'easy', [
            {
                question: 'ما هي عاصمة فرنسا؟',
                answers: ['روما', 'باريس', 'برلين', 'لندن'],
                correct: 1,
                hint: 'تشتهر ببرج إيفل',
                explanation: 'باريس هي عاصمة فرنسا'
            },
            {
                question: 'كم عدد أيام الأسبوع؟',
                answers: ['5', '6', '7', '8'],
                correct: 2,
                hint: 'رقم ثابت في جميع الثقافات',
                explanation: 'الأسبوع يتكون من 7 أيام'
            },
            {
                question: 'ما هو لون التفاحة الناضجة؟',
                answers: ['برتقالي', 'أصفر', 'أحمر', 'أخضر'],
                correct: 2,
                hint: 'لون شائع للفواكه',
                explanation: 'معظم التفاح الناضج يكون أحمر'
            }
        ]);

        // أسئلة عامة متوسطة
        this.addQuestions('general', 'medium', [
            {
                question: 'من هو مؤلف كتاب "الأمير"؟',
                answers: ['شكسبير', 'أفلاطون', 'ميكافيلي', 'أرسطو'],
                correct: 2,
                hint: 'كاتب إيطالي من عصر النهضة',
                explanation: 'نيكولو ميكافيلي فيلسوف وكاتب إيطالي'
            }
        ]);

        // أسئلة تاريخية
        this.addQuestions('history', 'easy', [
            {
                question: 'في أي سنة هجرية حدثت معركة بدر؟',
                answers: ['سنة 4 هـ', 'سنة 3 هـ', 'سنة 2 هـ', 'سنة 1 هـ'],
                correct: 2,
                hint: 'في العام الثاني للهجرة',
                explanation: 'حدثت معركة بدر الكبرى في السنة الثانية للهجرة'
            }
        ]);

        // أسئلة جغرافية
        this.addQuestions('geography', 'easy', [
            {
                question: 'ما هي أكبر دولة في العالم من حيث المساحة؟',
                answers: ['الولايات المتحدة', 'الصين', 'كندا', 'روسيا'],
                correct: 3,
                hint: 'تمتد بين قارتي أوروبا وآسيا',
                explanation: 'روسيا تبلغ مساحتها حوالي 17 مليون كم²'
            }
        ]);

        // حفظ الأسئلة
        this.saveQuestions();
    }

    // إضافة أسئلة
    addQuestions(categoryId, difficulty, questions) {
        if (!this.categories[categoryId]) {
            console.error(`❌ التصنيف ${categoryId} غير موجود`);
            return;
        }

        questions.forEach((q, index) => {
            const questionId = `${categoryId}_${difficulty}_${Date.now()}_${index}`;
            const fullQuestion = {
                id: questionId,
                question: q.question,
                answers: q.answers,
                correct: q.correct,
                hint: q.hint || '',
                explanation: q.explanation || '',
                category: categoryId,
                difficulty: difficulty,
                points: this.getPointsForDifficulty(difficulty),
                createdAt: new Date().toISOString()
            };
            this.categories[categoryId].questions[difficulty].push(fullQuestion);
        });
    }

    // الحصول على نقاط حسب الصعوبة
    getPointsForDifficulty(difficulty) {
        const points = { easy: 100, medium: 300, hard: 500 };
        return points[difficulty] || 100;
    }

    // حفظ الأسئلة
    saveQuestions() {
        try {
            const data = {
                categories: this.categories,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(GameConfig.STORAGE_KEYS.QUESTIONS, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('❌ خطأ في حفظ الأسئلة:', error);
            return false;
        }
    }

    // الحصول على سؤال عشوائي
    getRandomQuestion(categoryId, difficulty) {
        if (!this.categories[categoryId] || !this.categories[categoryId].questions[difficulty]) {
            return this.getFallbackQuestion();
        }

        const questions = this.categories[categoryId].questions[difficulty];
        const availableQuestions = questions.filter(q => !this.usedQuestions.has(q.id));

        if (availableQuestions.length === 0) {
            // إعادة استخدام إذا نفدت الأسئلة
            this.usedQuestions.clear();
            return this.getRandomQuestion(categoryId, difficulty);
        }

        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        const question = availableQuestions[randomIndex];
        this.usedQuestions.add(question.id);
        return question;
    }

    // الحصول على أسئلة للعبة
    getGameQuestions(categories, difficulty, count = 15) {
        const questions = [];

        // توزيع الأسئلة
        const easyCount = Math.floor(count * 0.5);     // 50% سهلة
        const mediumCount = Math.floor(count * 0.3);   // 30% متوسطة
        const hardCount = count - easyCount - mediumCount; // 20% صعبة

        // جمع الأسئلة السهلة
        for (let i = 0; i < easyCount; i++) {
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            const question = this.getRandomQuestion(randomCategory, 'easy');
            if (question) questions.push(question);
        }

        // جمع الأسئلة المتوسطة
        for (let i = 0; i < mediumCount; i++) {
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            const question = this.getRandomQuestion(randomCategory, 'medium');
            if (question) questions.push(question);
        }

        // جمع الأسئلة الصعبة
        for (let i = 0; i < hardCount; i++) {
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            const question = this.getRandomQuestion(randomCategory, 'hard');
            if (question) questions.push(question);
        }

        // خلط الأسئلة
        return this.shuffleArray(questions).slice(0, count);
    }

    // خلط المصفوفة
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // سؤال افتراضي
    getFallbackQuestion() {
        return {
            id: 'fallback',
            question: 'ما هي عاصمة فرنسا؟',
            answers: ['روما', 'باريس', 'برلين', 'لندن'],
            correct: 1,
            hint: 'تشتهر ببرج إيفل',
            explanation: 'باريس هي عاصمة فرنسا',
            category: 'general',
            difficulty: 'easy',
            points: 100
        };
    }

    // الحصول على جميع الأسئلة
    getAllQuestions() {
        const allQuestions = [];
        for (const categoryId in this.categories) {
            for (const difficulty in this.categories[categoryId].questions) {
                this.categories[categoryId].questions[difficulty].forEach(q => {
                    allQuestions.push({
                        ...q,
                        categoryName: this.categories[categoryId].name
                    });
                });
            }
        }
        return allQuestions;
    }

    // البحث في الأسئلة
    searchQuestions(query) {
        const results = [];
        const searchQuery = query.toLowerCase();
        
        for (const categoryId in this.categories) {
            for (const difficulty in this.categories[categoryId].questions) {
                this.categories[categoryId].questions[difficulty].forEach(q => {
                    if (q.question.toLowerCase().includes(searchQuery) ||
                        q.category.toLowerCase().includes(searchQuery)) {
                        results.push({
                            ...q,
                            categoryName: this.categories[categoryId].name
                        });
                    }
                });
            }
        }
        return results;
    }

    // إضافة سؤال جديد
    addQuestion(questionData) {
        const questionId = `${questionData.category}_${questionData.difficulty}_${Date.now()}`;
        
        const newQuestion = {
            id: questionId,
            question: questionData.question,
            answers: questionData.answers,
            correct: questionData.correct,
            hint: questionData.hint || '',
            explanation: questionData.explanation || '',
            category: questionData.category,
            difficulty: questionData.difficulty,
            points: this.getPointsForDifficulty(questionData.difficulty),
            createdAt: new Date().toISOString()
        };

        if (!this.categories[questionData.category]) {
            console.error('❌ التصنيف غير موجود');
            return false;
        }

        this.categories[questionData.category].questions[questionData.difficulty].push(newQuestion);
        return this.saveQuestions();
    }

    // حذف سؤال
    deleteQuestion(questionId) {
        for (const categoryId in this.categories) {
            for (const difficulty in this.categories[categoryId].questions) {
                const questions = this.categories[categoryId].questions[difficulty];
                const index = questions.findIndex(q => q.id === questionId);
                
                if (index !== -1) {
                    questions.splice(index, 1);
                    return this.saveQuestions();
                }
            }
        }
        return false;
    }

    // إعادة تعيين الأسئلة المستخدمة
    resetUsedQuestions() {
        this.usedQuestions.clear();
    }
}

// تصدير عام عالمياً
if (typeof window !== 'undefined') {
    window.QuestionManager = QuestionManager;
}
