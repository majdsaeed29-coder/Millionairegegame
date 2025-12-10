/**
 * نظام بنك الأسئلة المتكامل
 * دمج question.js و question_bank.js
 */

class QuestionBank {
    constructor() {
        this.questions = {};
        this.usedQuestions = new Set();
        this.categories = {};
        this.stats = {};
        
        this.initializeCategories();
        this.loadQuestions();
    }
    
    /**
     * تهيئة التصنيفات
     */
    initializeCategories() {
        this.categories = {
            'general': {
                name: 'عام',
                icon: '🌍',
                description: 'أسئلة متنوعة من جميع المجالات',
                levels: { easy: [], medium: [], hard: [] }
            },
            'literature': {
                name: 'أدب',
                icon: '📚',
                description: 'الأدب العربي والعالمي',
                levels: { easy: [], medium: [], hard: [] }
            },
            'history': {
                name: 'تاريخ',
                icon: '🏛️',
                description: 'التاريخ العربي والعالمي',
                levels: { easy: [], medium: [], hard: [] }
            },
            'geography': {
                name: 'جغرافيا',
                icon: '🗺️',
                description: 'دول، عواصم، طبيعة',
                levels: { easy: [], medium: [], hard: [] }
            },
            'science': {
                name: 'علوم',
                icon: '🔬',
                description: 'فيزياء، كيمياء، أحياء، فضاء',
                levels: { easy: [], medium: [], hard: [] }
            },
            'sports': {
                name: 'رياضة',
                icon: '⚽',
                description: 'كرة قدم، أولمبياد، ألعاب',
                levels: { easy: [], medium: [], hard: [] }
            }
        };
    }
    
    /**
     * تحميل الأسئلة
     */
    loadQuestions() {
        // الأسئلة العامة
        this.addQuestions('general', 'easy', [
            {
                question: 'ما هي عاصمة فرنسا؟',
                answers: ['روما', 'برلين', 'باريس', 'لندن'],
                correct: 2,
                hint: 'تقع في أوروبا الغربية',
                explanation: 'باريس هي عاصمة فرنسا وتشتهر ببرج إيفل'
            },
            {
                question: 'كم عدد أيام الأسبوع؟',
                answers: ['5', '6', '7', '8'],
                correct: 2,
                hint: 'عددها ثابت في جميع الثقافات',
                explanation: 'الأسبوع يتكون من 7 أيام'
            },
            {
                question: 'ما هو لون التفاحة الناضجة؟',
                answers: ['أزرق', 'أخضر', 'أحمر', 'أسود'],
                correct: 2,
                hint: 'لون شائع للفواكه',
                explanation: 'معظم التفاح الناضج يكون أحمر'
            },
            {
                question: 'من هو أول خليفة في الإسلام؟',
                answers: ['عمر بن الخطاب', 'عثمان بن عفان', 'أبو بكر الصديق', 'علي بن أبي طالب'],
                correct: 2,
                hint: 'رفيق النبي محمد ﷺ',
                explanation: 'أبو بكر الصديق هو أول الخلفاء الراشدين'
            },
            {
                question: 'ما هو أكبر كوكب في المجموعة الشمسية؟',
                answers: ['المريخ', 'الزهرة', 'المشتري', 'زحل'],
                correct: 2,
                hint: 'له حلقات كبيرة',
                explanation: 'المشتري هو أكبر كوكب في مجموعتنا الشمسية'
            }
        ]);
        
        // أسئلة الأدب
        this.addQuestions('literature', 'easy', [
            {
                question: 'من هو مؤلف كتاب "الأمير"؟',
                answers: ['أرسطو', 'ميكافيلي', 'أفلاطون', 'شكسبير'],
                correct: 1,
                hint: 'كاتب إيطالي من عصر النهضة',
                explanation: 'نيكولو ميكافيلي، فيلسوف وكاتب إيطالي'
            },
            {
                question: 'ما هي الجائزة الأدبية الأرفع في العالم العربي؟',
                answers: ['جائزة الملك فيصل', 'جائزة الشيخ زايد', 'جائزة البوكر العربية', 'جائزة نوبل'],
                correct: 2,
                hint: 'تركز على الرواية العربية',
                explanation: 'جائزة البوكر العربية هي أرفع جائزة للرواية العربية'
            }
        ]);
        
        // أسئلة التاريخ
        this.addQuestions('history', 'easy', [
            {
                question: 'في أي سنة هجرية حدثت معركة بدر؟',
                answers: ['سنة 1 هـ', 'سنة 2 هـ', 'سنة 3 هـ', 'سنة 4 هـ'],
                correct: 1,
                hint: 'في العام الثاني للهجرة',
                explanation: 'معركة بدر الكبرى حدثت في السنة الثانية للهجرة'
            },
            {
                question: 'من هو مؤسس الدولة الأموية؟',
                answers: ['عبد الملك بن مروان', 'مروان بن الحكم', 'معاوية بن أبي سفيان', 'يزيد بن معاوية'],
                correct: 2,
                hint: 'كان والياً على الشام',
                explanation: 'معاوية بن أبي سفيان هو مؤسس الدولة الأموية'
            }
        ]);
        
        // إضافة المزيد من الأسئلة حسب الحاجة
        this.addSampleQuestions();
    }
    
    /**
     * إضافة أسئلة عينة
     */
    addSampleQuestions() {
        // يمكن إضافة المزيد من الأسئلة هنا
        // أو جلبها من API خارجي
    }
    
    /**
     * إضافة أسئلة لتصنيف معين
     */
    addQuestions(category, difficulty, questions) {
        if (!this.categories[category]) return;
        
        questions.forEach((q, index) => {
            const questionId = `${category}_${difficulty}_${Date.now()}_${index}`;
            const question = {
                id: questionId,
                ...q,
                category: category,
                difficulty: difficulty,
                used: false,
                value: this.calculateQuestionValue(difficulty)
            };
            
            this.categories[category].levels[difficulty].push(question);
        });
    }
    
    /**
     * حساب قيمة السؤال حسب الصعوبة
     */
    calculateQuestionValue(difficulty) {
        const values = {
            easy: 100,
            medium: 500,
            hard: 1000
        };
        return values[difficulty] || 100;
    }
    
    /**
     * الحصول على سؤال عشوائي
     */
    getRandomQuestion(category, difficulty) {
        if (!this.categories[category] || !this.categories[category].levels[difficulty]) {
            return this.getFallbackQuestion();
        }
        
        const questions = this.categories[category].levels[difficulty];
        const availableQuestions = questions.filter(q => !this.usedQuestions.has(q.id));
        
        if (availableQuestions.length === 0) {
            // إعادة تعيين الأسئلة المستخدمة إذا نفذت
            questions.forEach(q => this.usedQuestions.delete(q.id));
            return this.getRandomQuestion(category, difficulty);
        }
        
        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        const question = availableQuestions[randomIndex];
        
        this.usedQuestions.add(question.id);
        this.updateQuestionStats(question);
        
        return question;
    }
    
    /**
     * الحصول على أسئلة للجلسة
     */
    getGameQuestions(category, count = 15) {
        const questions = [];
        const difficulties = ['easy', 'medium', 'hard'];
        
        for (let i = 0; i < count; i++) {
            let difficulty;
            if (i < 5) difficulty = 'easy';
            else if (i < 10) difficulty = 'medium';
            else difficulty = 'hard';
            
            const question = this.getRandomQuestion(category, difficulty);
            questions.push(question);
        }
        
        return questions;
    }
    
    /**
     * تحديث إحصائيات السؤال
     */
    updateQuestionStats(question) {
        if (!this.stats[question.id]) {
            this.stats[question.id] = {
                timesUsed: 0,
                correctAnswers: 0,
                totalAnswers: 0
            };
        }
        
        this.stats[question.id].timesUsed++;
    }
    
    /**
     * الحصول على سؤال بديل
     */
    getFallbackQuestion() {
        return {
            id: 'fallback_' + Date.now(),
            question: 'ما هي عاصمة فرنسا؟',
            answers: ['روما', 'برلين', 'باريس', 'لندن'],
            correct: 2,
            hint: 'تقع في أوروبا الغربية',
            explanation: 'باريس هي عاصمة فرنسا',
            category: 'general',
            difficulty: 'easy',
            value: 100
        };
    }
    
    /**
     * الحصول على جميع التصنيفات
     */
    getAllCategories() {
        return Object.keys(this.categories).map(key => ({
            id: key,
            name: this.categories[key].name,
            icon: this.categories[key].icon,
            description: this.categories[key].description,
            questionCount: this.getCategoryQuestionCount(key)
        }));
    }
    
    /**
     * حساب عدد الأسئلة في التصنيف
     */
    getCategoryQuestionCount(categoryId) {
        if (!this.categories[categoryId]) return 0;
        
        const levels = this.categories[categoryId].levels;
        let count = 0;
        
        for (const level in levels) {
            count += levels[level].length;
        }
        
        return count;
    }
    
    /**
     * إعادة تعيين الأسئلة المستخدمة
     */
    resetUsedQuestions() {
        this.usedQuestions.clear();
    }
    
    /**
     * البحث عن أسئلة
     */
    searchQuestions(keyword) {
        const results = [];
        
        for (const category in this.categories) {
            for (const difficulty in this.categories[category].levels) {
                this.categories[category].levels[difficulty].forEach(question => {
                    if (question.question.includes(keyword)) {
                        results.push({
                            ...question,
                            categoryName: this.categories[category].name
                        });
                    }
                });
            }
        }
        
        return results;
    }
    
    /**
     * الحصول على إحصائيات عامة
     */
    getStatistics() {
        let totalQuestions = 0;
        let totalUsed = this.usedQuestions.size;
        
        for (const category in this.categories) {
            for (const difficulty in this.categories[category].levels) {
                totalQuestions += this.categories[category].levels[difficulty].length;
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

// التصديع للاستخدام العالمي
if (typeof window !== 'undefined') {
    window.QuestionBank = QuestionBank;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuestionBank;
}
