/**
 * نظام إدارة الأسئلة - ميليونير الذهبية
 * قاعدة بيانات الأسئلة مع جميع التصنيفات
 */

class QuestionManager {
    constructor() {
        this.categories = {};
        this.usedQuestions = new Set();
        this.questionStats = {};
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
     * تحميل الأسئلة (قاعدة بيانات افتراضية)
     */
    loadQuestions() {
        // --- أسئلة الثقافة العامة ---
        this.addQuestions('general', 'easy', [
            {
                question: 'ما هي عاصمة فرنسا؟',
                answers: ['لندن', 'برلين', 'باريس', 'روما'],
                correct: 2,
                hint: 'تقع في أوروبا وتشتهر ببرج إيفل',
                explanation: 'باريس هي عاصمة فرنسا وأشهر مدنها'
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
                explanation: 'معظم التفاح الناضج يكون أحمراً'
            }
        ]);
        
        this.addQuestions('general', 'medium', [
            {
                question: 'من هو مؤلف كتاب "الأمير"؟',
                answers: ['شكسبير', 'أفلاطون', 'ميكافيلي', 'أرسطو'],
                correct: 2,
                hint: 'كاتب إيطالي من عصر النهضة',
                explanation: 'نيكولو ميكافيلي، فيلسوف وكاتب إيطالي'
            },
            {
                question: 'ما هي أعلى جائزة أدبية في العالم العربي؟',
                answers: ['جائزة نوبل', 'جائزة البوكر العربية', 'جائزة الشيخ زايد', 'جائزة الملك فيصل'],
                correct: 1,
                hint: 'تركز على الرواية العربية',
                explanation: 'جائزة البوكر العربية هي أرفع جائزة للرواية العربية'
            }
        ]);
        
        // --- أسئلة التاريخ ---
        this.addQuestions('history', 'easy', [
            {
                question: 'في أي سنة هجرية حدثت معركة بدر؟',
                answers: ['سنة 4 هـ', 'سنة 3 هـ', 'سنة 2 هـ', 'سنة 1 هـ'],
                correct: 2,
                hint: 'في العام الثاني للهجرة',
                explanation: 'معركة بدر الكبرى حدثت في السنة الثانية للهجرة'
            },
            {
                question: 'من هو مؤسس الدولة الأموية؟',
                answers: ['مروان بن الحكم', 'معاوية بن أبي سفيان', 'يزيد بن معاوية', 'عبد الملك بن مروان'],
                correct: 1,
                hint: 'كان والياً على الشام',
                explanation: 'معاوية بن أبي سفيان هو مؤسس الدولة الأموية'
            }
        ]);
        
        this.addQuestions('history', 'hard', [
            {
                question: 'متى سقطت غرناطة آخر معاقل المسلمين في الأندلس؟',
                answers: ['1492 م', '1453 م', '1517 م', '1400 م'],
                correct: 0,
                hint: 'نفس سنة اكتشاف أمريكا',
                explanation: 'سقطت غرناطة سنة 1492 ميلادية'
            }
        ]);
        
        // --- أسئلة الجغرافيا ---
        this.addQuestions('geography', 'easy', [
            {
                question: 'ما هي أكبر دولة في العالم من حيث المساحة؟',
                answers: ['كندا', 'الصين', 'الولايات المتحدة', 'روسيا'],
                correct: 3,
                hint: 'تمتد بين قارتي أوروبا وآسيا',
                explanation: 'روسيا هي أكبر دولة في العالم بمساحة 17 مليون كم²'
            },
            {
                question: 'ما هي أطول نهر في العالم؟',
                answers: ['الأمازون', 'النيل', 'المسيسيبي', 'الدانوب'],
                correct: 1,
                hint: 'يوجد في إفريقيا',
                explanation: 'نهر النيل هو أطول نهر في العالم بطول 6650 كم'
            }
        ]);
        
        // --- أسئلة العلوم ---
        this.addQuestions('science', 'easy', [
            {
                question: 'ما هو العنصر الأكثر وفرة في الكون؟',
                answers: ['الأكسجين', 'الكربون', 'الهيدروجين', 'الهيليوم'],
                correct: 2,
                hint: 'أخف العناصر',
                explanation: 'الهيدروجين هو العنصر الأكثر وفرة في الكون'
            },
            {
                question: 'ما هي سرعة الضوء في الفراغ؟',
                answers: ['300,000 كم/ث', '150,000 كم/ث', '450,000 كم/ث', '600,000 كم/ث'],
                correct: 0,
                hint: 'أسرع شيء في الكون',
                explanation: 'سرعة الضوء في الفراغ هي 300,000 كم/ثانية'
            }
        ]);
        
        // --- أسئلة الأطفال ---
        this.addQuestions('children', 'easy', [
            {
                question: 'ما هو لون السماء في يوم صافٍ؟',
                answers: ['أحمر', 'أصفر', 'أزرق', 'أخضر'],
                correct: 2,
                hint: 'لون البحر أيضاً',
                explanation: 'السماء تبدو زرقاء بسبب تشتت الضوء'
            },
            {
                question: 'كم عدد أرجل العنكبوت؟',
                answers: ['6', '8', '10', '4'],
                correct: 1,
                hint: 'ضعف أرلاك',
                explanation: 'العنكبوت له 8 أرجل'
            }
        ]);
        
        // --- أسئلة السياسة ---
        this.addQuestions('politics', 'medium', [
            {
                question: 'ما هي عاصمة الولايات المتحدة الأمريكية؟',
                answers: ['نيويورك', 'لوس أنجلوس', 'واشنطن دي سي', 'شيكاغو'],
                correct: 2,
                hint: 'ليست نيويورك',
                explanation: 'واشنطن دي سي هي عاصمة الولايات المتحدة'
            },
            {
                question: 'كم عدد الأعضاء الدائمين في مجلس الأمن؟',
                answers: ['5', '10', '15', '20'],
                correct: 0,
                hint: 'أصابع اليد الواحدة',
                explanation: 'مجلس الأمن له 5 أعضاء دائمين'
            }
        ]);
        
        // --- أسئلة الرياضة ---
        this.addQuestions('sports', 'easy', [
            {
                question: 'كم عدد اللاعبين في فريق كرة القدم؟',
                answers: ['10', '11', '12', '9'],
                correct: 1,
                hint: 'بالإضافة للحارس',
                explanation: 'فريق كرة القدم مكون من 11 لاعباً'
            },
            {
                question: 'في أي رياضة يستخدم مضرب وكرات صفراء؟',
                answers: ['كرة السلة', 'التنس', 'كرة القدم', 'الجولف'],
                correct: 1,
                hint: 'لعبها نادال وفيدرر',
                explanation: 'التنس هي الرياضة التي تستخدم مضرباً وكرات صفراء'
            }
        ]);
        
        // --- أسئلة الترفيه ---
        this.addQuestions('entertainment', 'easy', [
            {
                question: 'ما هي مدينة السينما الأمريكية الشهيرة؟',
                answers: ['نيويورك', 'لاس فيغاس', 'هوليوود', 'مايامي'],
                correct: 2,
                hint: 'في لوس أنجلوس',
                explanation: 'هوليوود في لوس أنجلوس هي عاصمة السينما الأمريكية'
            }
        ]);
        
        // --- أسئلة التكنولوجيا ---
        this.addQuestions('technology', 'medium', [
            {
                question: 'من هو مؤسس شركة مايكروسوفت؟',
                answers: ['ستيف جوبز', 'بيل جيتس', 'مارك زوكربيرغ', 'لاري بيج'],
                correct: 1,
                hint: 'أغنى رجل في العالم لفترة',
                explanation: 'بيل جيتس هو المؤسس المشارك لشركة مايكروسوفت'
            }
        ]);
        
        // يمكن إضافة المزيد من الأسئلة هنا
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
                ...q,
                category: categoryId,
                difficulty: difficulty,
                used: false,
                value: this.calculateQuestionValue(difficulty, categoryId)
            };
            
            this.categories[categoryId].questions[difficulty].push(fullQuestion);
        });
    }
    
    /**
     * حساب قيمة السؤال حسب الصعوبة والتصنيف
     */
    calculateQuestionValue(difficulty, categoryId) {
        const baseValues = {
            easy: 100,
            medium: 300,
            hard: 500
        };
        
        let multiplier = 1;
        const category = this.categories[categoryId];
        if (category) {
            if (category.id === 'hard' || category.id === 'science') {
                multiplier = 1.2;
            }
        }
        
        return Math.floor(baseValues[difficulty] * multiplier);
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
        this.updateQuestionStats(question);
        
        return question;
    }
    
    /**
     * الحصول على مجموعة أسئلة للجلسة
     */
    getGameQuestions(categories, difficulty, count = 15) {
        const questions = [];
        const difficulties = ['easy', 'medium', 'hard'];
        
        // توزيع الأسئلة حسب الصعوبة
        const easyCount = Math.floor(count * 0.5);    // 50% سهلة
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
        
        // خلط الأسئلة
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
     * تحديث إحصائيات السؤال
     */
    updateQuestionStats(question) {
        if (!this.questionStats[question.id]) {
            this.questionStats[question.id] = {
                timesUsed: 0,
                correctAnswers: 0,
                totalAnswers: 0
            };
        }
        
        this.questionStats[question.id].timesUsed++;
    }
    
    /**
     * الحصول على سؤال بديل في حالة عدم وجود أسئلة
     */
    getFallbackQuestion() {
        return {
            id: 'fallback_' + Date.now(),
            question: 'ما هي عاصمة فرنسا؟',
            answers: ['لندن', 'برلين', 'باريس', 'روما'],
            correct: 2,
            hint: 'تقع في أوروبا وتشتهر ببرج إيفل',
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
        return Object.values(this.categories).map(category => ({
            id: category.id,
            name: category.name,
            icon: category.icon,
            color: category.color,
            description: category.description,
            questionCount: this.getCategoryQuestionCount(category.id)
        }));
    }
    
    /**
     * حساب عدد الأسئلة في التصنيف
     */
    getCategoryQuestionCount(categoryId) {
        if (!this.categories[categoryId]) return 0;
        
        const questions = this.categories[categoryId].questions;
        let count = 0;
        
        for (const difficulty in questions) {
            count += questions[difficulty].length;
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
            for (const difficulty in this.categories[category].questions) {
                this.categories[category].questions[difficulty].forEach(question => {
                    if (question.question.toLowerCase().includes(keyword.toLowerCase())) {
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
            for (const difficulty in this.categories[category].questions) {
                totalQuestions += this.categories[category].questions[difficulty].length;
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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuestionManager;
}
