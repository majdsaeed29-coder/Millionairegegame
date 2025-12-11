/**
 * ❓ مدير الأسئلة - المليونير الذهبية
 * نظام إدارة كامل للأسئلة مع دعم متعدد التصنيفات والصعوبات
 */

class QuestionManager {
    constructor() {
        this.categories = {};
        this.usedQuestions = new Set();
        this.initializeCategories();
        this.loadQuestions();
    }
    
    /**
     * تهيئة التصنيفات
     */
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
    
    /**
     * تحميل الأسئلة
     */
    loadQuestions() {
        // محاولة تحميل الأسئلة المحفوظة
        try {
            const savedQuestions = localStorage.getItem(GameConfig.STORAGE_KEYS.QUESTIONS);
            if (savedQuestions) {
                const parsed = JSON.parse(savedQuestions);
                this.categories = parsed.categories || this.categories;
                console.log('✅ تم تحميل الأسئلة المحفوظة');
                return;
            }
        } catch (error) {
            console.error('❌ خطأ في تحميل الأسئلة:', error);
        }
        
        // إذا لم توجد أسئلة محفوظة، أنشئ الأسئلة الافتراضية
        this.createDefaultQuestions();
    }
    
    /**
     * إنشاء الأسئلة الافتراضية
     */
    createDefaultQuestions() {
        // أسئلة الثقافة العامة
        this.addQuestions('general', 'easy', [
            {
                question: 'ما هي عاصمة فرنسا؟',
                answers: ['روما', 'لندن', 'باريس', 'برلين'],
                correct: 2,
                hint: 'تشتهر ببرج إيفل',
                explanation: 'باريس هي عاصمة فرنسا وأشهر مدنها'
            },
            {
                question: 'كم عدد أيام الأسبوع؟',
                answers: ['5 أيام', '6 أيام', '7 أيام', '8 أيام'],
                correct: 2,
                hint: 'رقم ثابت في جميع الثقافات',
                explanation: 'الأسبوع يتكون من 7 أيام'
            },
            {
                question: 'ما هو لون التفاحة الناضجة؟',
                answers: ['أسود', 'أحمر', 'أخضر', 'أزرق'],
                correct: 1,
                hint: 'لون شائع للفواكه',
                explanation: 'معظم التفاح الناضج يكون أحمر'
            }
        ]);
        
        this.addQuestions('general', 'medium', [
            {
                question: 'من هو مؤلف كتاب "الأمير"؟',
                answers: ['أرسطو', 'ميكافيلي', 'أفلاطون', 'شكسبير'],
                correct: 1,
                hint: 'كاتب إيطالي من عصر النهضة',
                explanation: 'نيكولو ميكافيلي فيلسوف وكاتب إيطالي'
            }
        ]);
        
        // أسئلة التاريخ
        this.addQuestions('history', 'easy', [
            {
                question: 'في أي سنة هجرية حدثت معركة بدر؟',
                answers: ['سنة 1 هـ', 'سنة 2 هـ', 'سنة 3 هـ', 'سنة 4 هـ'],
                correct: 1,
                hint: 'في العام الثاني للهجرة',
                explanation: 'حدثت معركة بدر الكبرى في السنة الثانية للهجرة'
            }
        ]);
        
        // أسئلة الجغرافيا
        this.addQuestions('geography', 'easy', [
            {
                question: 'ما هي أكبر دولة في العالم من حيث المساحة؟',
                answers: ['الولايات المتحدة', 'الصين', 'كندا', 'روسيا'],
                correct: 3,
                hint: 'تمتد بين قارتي أوروبا وآسيا',
                explanation: 'روسيا هي أكبر دولة في العالم بمساحة 17 مليون كم²'
            }
        ]);
        
        // حفظ الأسئلة
        this.saveQuestions();
    }
    
    /**
     * إضافة أسئلة لتصنيف معين
     */
    addQuestions(categoryId, difficulty, questions) {
        if (!this.categories[categoryId]) {
            console.error(`التصنيف ${categoryId} غير موجود`);
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
                points: this.calculateQuestionValue(difficulty),
                createdAt: new Date().toISOString(),
                usageCount: 0,
                correctRate: 0
            };
            
            this.categories[categoryId].questions[difficulty].push(fullQuestion);
        });
    }
    
    /**
     * حساب قيمة السؤال حسب الصعوبة
     */
    calculateQuestionValue(difficulty) {
        const values = { easy: 100, medium: 300, hard: 500 };
        return values[difficulty] || 100;
    }
    
    /**
     * الحصول على سؤال عشوائي
     */
    getRandomQuestion(categoryId, difficulty) {
        if (!this.categories[categoryId] || !this.categories[categoryId].questions[difficulty]) {
            return this.getFallbackQuestion();
        }
        
        const questions = this.categories[categoryId].questions[difficulty];
        const availableQuestions = questions.filter(q => !this.usedQuestions.has(q.id));
        
        if (availableQuestions.length === 0) {
            // إعادة تعيين الأسئلة المستخدمة لهذا التصنيف
            questions.forEach(q => this.usedQuestions.delete(q.id));
            return this.getRandomQuestion(categoryId, difficulty);
        }
        
        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        const question = availableQuestions[randomIndex];
        
        this.usedQuestions.add(question.id);
        question.usageCount = (question.usageCount || 0) + 1;
        
        return question;
    }
    
    /**
     * الحصول على مجموعة أسئلة للعبة
     */
    getGameQuestions(categories, difficulty, count = 15) {
        const questions = [];
        const difficulties = ['easy', 'medium', 'hard'];
        
        // توزيع الأسئلة حسب الصعوبة
        const easyCount = Math.floor(count * 0.5);  // 50% سهلة
        const mediumCount = Math.floor(count * 0.3); // 30% متوسطة
        const hardCount = count - easyCount - mediumCount; // 20% صعبة
        
        // الحصول على الأسئلة السهلة
        for (let i = 0; i < easyCount; i++) {
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            const question = this.getRandomQuestion(randomCategory, 'easy');
            questions.push(question);
        }
        
        // الحصول على الأسئلة المتوسطة
        for (let i = 0; i < mediumCount; i++) {
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            const question = this.getRandomQuestion(randomCategory, 'medium');
            questions.push(question);
        }
        
        // الحصول على الأسئلة الصعبة
        for (let i = 0; i < hardCount; i++) {
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            const question = this.getRandomQuestion(randomCategory, 'hard');
            questions.push(question);
        }
        
        // خلط الأسئلة وإرجاع العدد المطلوب
        return this.shuffleArray(questions).slice(0, count);
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
     * الحصول على سؤال افتراضي في حالة عدم وجود أسئلة
     */
    getFallbackQuestion() {
        return {
            id: 'fallback_' + Date.now(),
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
    
    /**
     * الحصول على جميع الأسئلة
     */
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
    
    /**
     * البحث في الأسئلة
     */
    searchQuestions(query) {
        if (!query) return this.getAllQuestions();
        
        const results = [];
        const searchQuery = query.toLowerCase();
        
        for (const categoryId in this.categories) {
            for (const difficulty in this.categories[categoryId].questions) {
                this.categories[categoryId].questions[difficulty].forEach(q => {
                    if (q.question.toLowerCase().includes(searchQuery) ||
                        q.category.toLowerCase().includes(searchQuery) ||
                        q.difficulty.toLowerCase().includes(searchQuery)) {
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
    
    /**
     * إضافة سؤال جديد
     */
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
            points: questionData.points || this.calculateQuestionValue(questionData.difficulty),
            createdAt: new Date().toISOString(),
            usageCount: 0,
            correctRate: 0
        };
        
        if (!this.categories[questionData.category]) {
            console.error('التصنيف غير موجود:', questionData.category);
            return false;
        }
        
        this.categories[questionData.category].questions[questionData.difficulty].push(newQuestion);
        return this.saveQuestions();
    }
    
    /**
     * حذف سؤال
     */
    deleteQuestion(questionId) {
        for (const categoryId in this.categories) {
            for (const difficulty in this.categories[categoryId].questions) {
                const questions = this.categories[categoryId].questions[difficulty];
                const index = questions.findIndex(q => q.id === questionId);
                
                if (index !== -1) {
                    questions.splice(index, 1);
                    this.saveQuestions();
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * تحديث سؤال
     */
    updateQuestion(questionId, updates) {
        for (const categoryId in this.categories) {
            for (const difficulty in this.categories[categoryId].questions) {
                const questions = this.categories[categoryId].questions[difficulty];
                const index = questions.findIndex(q => q.id === questionId);
                
                if (index !== -1) {
                    questions[index] = { ...questions[index], ...updates };
                    this.saveQuestions();
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * حفظ الأسئلة في التخزين المحلي
     */
    saveQuestions() {
        try {
            localStorage.setItem(GameConfig.STORAGE_KEYS.QUESTIONS, JSON.stringify({
                categories: this.categories,
                lastUpdated: new Date().toISOString()
            }));
            return true;
        } catch (error) {
            console.error('❌ خطأ في حفظ الأسئلة:', error);
            return false;
        }
    }
    
    /**
     * إعادة تعيين الأسئلة المستخدمة
     */
    resetUsedQuestions() {
        this.usedQuestions.clear();
    }
    
    /**
     * الحصول على إحصائيات الأسئلة
     */
    getStatistics() {
        let totalQuestions = 0;
        let totalUsed = this.usedQuestions.size;
        
        for (const categoryId in this.categories) {
            for (const difficulty in this.categories[categoryId].questions) {
                totalQuestions += this.categories[categoryId].questions[difficulty].length;
            }
        }
        
        return {
            totalQuestions,
            totalUsed,
            categories: Object.keys(this.categories).length,
            usageRate: totalQuestions > 0 ? (totalUsed / totalQuestions) * 100 : 0
        };
    }
}

// التصدير للاستخدام
if (typeof window !== 'undefined') {
    window.QuestionManager = QuestionManager;
}
