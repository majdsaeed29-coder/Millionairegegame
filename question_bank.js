/**
 * Smart Question Bank System for Millionaire Game
 * Manages questions with lazy loading and intelligent distribution
 */

class QuestionBank {
    constructor() {
        this.questions = {};
        this.categories = GameConfig.CATEGORIES;
        this.usedQuestions = new Set();
        this.questionStats = {};
        this.loadedChunks = new Set();
        
        // Initialize question bank
        this.init();
    }
    
    /**
     * Initialize question bank
     */
    async init() {
        console.log('📚 Initializing Question Bank...');
        
        try {
            // Initialize categories
            this.initializeCategories();
            
            // Load initial chunk of questions
            await this.loadQuestionChunk('general', 'easy', 0);
            
            // Load user preferences
            this.loadUserPreferences();
            
            console.log('✅ Question Bank initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Question Bank:', error);
            throw error;
        }
    }
    
    /**
     * Initialize categories structure
     */
    initializeCategories() {
        // Initialize empty arrays for each category and difficulty
        Object.keys(this.categories).forEach(categoryKey => {
            const category = this.categories[categoryKey];
            
            if (!this.questions[category.id]) {
                this.questions[category.id] = {
                    easy: [],
                    medium: [],
                    hard: []
                };
            }
            
            // Initialize statistics
            if (!this.questionStats[category.id]) {
                this.questionStats[category.id] = {
                    total: 0,
                    easy: 0,
                    medium: 0,
                    hard: 0,
                    timesUsed: 0,
                    avgDifficulty: 0,
                    successRate: 0
                };
            }
        });
    }
    
    /**
     * Load a chunk of questions
     * @param {string} category - Question category
     * @param {string} difficulty - Question difficulty
     * @param {number} chunkIndex - Chunk index
     * @returns {Promise<boolean>} - Success status
     */
    async loadQuestionChunk(category, difficulty, chunkIndex = 0) {
        const chunkKey = `${category}_${difficulty}_${chunkIndex}`;
        
        // Skip if already loaded
        if (this.loadedChunks.has(chunkKey)) {
            return true;
        }
        
        try {
            console.log(`📥 Loading chunk: ${chunkKey}`);
            
            // In production: Fetch from API
            // const response = await fetch(`${GameConfig.API.BASE_URL}/questions/chunk`, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ category, difficulty, chunkIndex })
            // });
            // 
            // if (!response.ok) throw new Error('Failed to fetch questions');
            // const questions = await response.json();
            
            // For demo: Generate sample questions
            const questions = this.generateSampleQuestions(category, difficulty, chunkIndex);
            
            // Add to question bank
            this.questions[category][difficulty].push(...questions);
            
            // Update statistics
            this.questionStats[category].total += questions.length;
            this.questionStats[category][difficulty] += questions.length;
            
            // Mark chunk as loaded
            this.loadedChunks.add(chunkKey);
            
            console.log(`✅ Loaded ${questions.length} questions for ${category} (${difficulty})`);
            return true;
            
        } catch (error) {
            console.error(`❌ Failed to load chunk ${chunkKey}:`, error);
            
            // Load fallback questions
            this.loadFallbackQuestions(category, difficulty);
            return false;
        }
    }
    
    /**
     * Get random question
     * @param {string} category - Question category
     * @param {string} difficulty - Question difficulty
     * @returns {Object} - Random question
     */
    getRandomQuestion(category, difficulty) {
        // Validate inputs
        if (!this.isValidCategory(category) || !this.isValidDifficulty(difficulty)) {
            console.warn(`Invalid parameters: category=${category}, difficulty=${difficulty}`);
            return this.getFallbackQuestion();
        }
        
        // Check if we need to load more questions
        const availableQuestions = this.questions[category][difficulty];
        
        if (availableQuestions.length === 0) {
            console.log(`No questions available for ${category} - ${difficulty}, loading...`);
            this.loadQuestionChunk(category, difficulty, 0);
            return this.getFallbackQuestion();
        }
        
        // Filter out used questions
        const unusedQuestions = availableQuestions.filter(q => 
            !this.usedQuestions.has(q.id)
        );
        
        // If all questions used, reset or get fallback
        if (unusedQuestions.length === 0) {
            console.log(`All questions used for ${category} - ${difficulty}`);
            
            // Option 1: Reset used questions for this category/difficulty
            this.resetUsedQuestions(category, difficulty);
            
            // Option 2: Get fallback question
            return this.getFallbackQuestion(category, difficulty);
        }
        
        // Get random question
        const randomIndex = Math.floor(Math.random() * unusedQuestions.length);
        const selectedQuestion = unusedQuestions[randomIndex];
        
        // Mark as used
        this.usedQuestions.add(selectedQuestion.id);
        
        // Update statistics
        this.updateQuestionStats(selectedQuestion);
        
        return selectedQuestion;
    }
    
    /**
     * Get questions for a game session
     * @param {string} category - Selected category
     * @param {boolean} isRandom - Whether to include random categories
     * @returns {Array} - Array of 15 questions
     */
    getGameQuestions(category, isRandom = false) {
        const questions = [];
        const targetCategory = isRandom ? this.getRandomCategory() : category;
        
        // Generate 15 questions with proper difficulty distribution
        for (let i = 0; i < GameConfig.MAX_QUESTIONS; i++) {
            let difficulty;
            
            if (i < 5) difficulty = 'easy';
            else if (i < 10) difficulty = 'medium';
            else difficulty = 'hard';
            
            const question = this.getRandomQuestion(targetCategory, difficulty);
            questions.push(question);
        }
        
        return questions;
    }
    
    /**
     * Get random category
     * @returns {string} - Random category ID
     */
    getRandomCategory() {
        const categoryKeys = Object.keys(this.categories);
        const randomIndex = Math.floor(Math.random() * categoryKeys.length);
        return this.categories[categoryKeys[randomIndex]].id;
    }
    
    /**
     * Reset used questions for a category/difficulty
     * @param {string} category - Category ID
     * @param {string} difficulty - Difficulty level
     */
    resetUsedQuestions(category, difficulty) {
        // Get all question IDs for this category/difficulty
        const questionIds = this.questions[category][difficulty].map(q => q.id);
        
        // Remove from used set
        questionIds.forEach(id => this.usedQuestions.delete(id));
        
        console.log(`🔄 Reset used questions for ${category} - ${difficulty}`);
    }
    
    /**
     * Update question statistics
     * @param {Object} question - Question object
     */
    updateQuestionStats(question) {
        const stats = this.questionStats[question.category];
        
        if (!stats) return;
        
        stats.timesUsed++;
        
        // Update average difficulty
        const difficultyValue = this.getDifficultyValue(question.difficulty);
        stats.avgDifficulty = (stats.avgDifficulty * (stats.timesUsed - 1) + difficultyValue) / stats.timesUsed;
    }
    
    /**
     * Get difficulty numerical value
     * @param {string} difficulty - Difficulty string
     * @returns {number} - Difficulty value (1-3)
     */
    getDifficultyValue(difficulty) {
        switch(difficulty) {
            case 'easy': return 1;
            case 'medium': return 2;
            case 'hard': return 3;
            default: return 1;
        }
    }
    
    /**
     * Validate category
     * @param {string} category - Category ID
     * @returns {boolean} - True if valid
     */
    isValidCategory(category) {
        return Object.values(this.categories).some(cat => cat.id === category);
    }
    
    /**
     * Validate difficulty
     * @param {string} difficulty - Difficulty level
     * @returns {boolean} - True if valid
     */
    isValidDifficulty(difficulty) {
        return ['easy', 'medium', 'hard'].includes(difficulty);
    }
    
    /**
     * Get fallback question
     * @param {string} category - Category ID
     * @param {string} difficulty - Difficulty level
     * @returns {Object} - Fallback question
     */
    getFallbackQuestion(category = 'general', difficulty = 'easy') {
        console.warn(`Using fallback question for ${category} - ${difficulty}`);
        
        return {
            id: `FALLBACK_${Date.now()}`,
            question: 'ما هي عاصمة فرنسا؟',
            answers: ['لندن', 'برلين', 'باريس', 'روما'],
            correct: 2,
            explanation: 'باريس هي عاصمة فرنسا وتُعرف بمدينة الأضواء',
            category: category,
            difficulty: difficulty,
            hint: 'تقع في أوروبا الغربية',
            value: 100,
            author: 'System',
            created: new Date().toISOString(),
            timesUsed: 0,
            successRate: 0.5
        };
    }
    
    /**
     * Load fallback questions for a category
     * @param {string} category - Category ID
     * @param {string} difficulty - Difficulty level
     */
    loadFallbackQuestions(category, difficulty) {
        const fallbackQuestions = [
            this.getFallbackQuestion(category, difficulty),
            this.getFallbackQuestion(category, difficulty),
            this.getFallbackQuestion(category, difficulty)
        ];
        
        this.questions[category][difficulty].push(...fallbackQuestions);
    }
    
    /**
     * Generate sample questions (for demo)
     * @param {string} category - Category ID
     * @param {string} difficulty - Difficulty level
     * @param {number} chunkIndex - Chunk index
     * @returns {Array} - Array of sample questions
     */
    generateSampleQuestions(category, difficulty, chunkIndex) {
        const questions = [];
        const baseId = chunkIndex * 10;
        
        // Generate 10 sample questions
        for (let i = 0; i < 10; i++) {
            const questionId = `Q${(baseId + i + 1).toString().padStart(4, '0')}_${category.toUpperCase().substr(0, 3)}_${difficulty.toUpperCase().substr(0, 1)}`;
            
            questions.push({
                id: questionId,
                question: this.getSampleQuestionText(category, difficulty, i),
                answers: this.getSampleAnswers(category, difficulty, i),
                correct: Math.floor(Math.random() * 4),
                explanation: `هذا تفسير للسؤال رقم ${i + 1} في فئة ${category}`,
                category: category,
                difficulty: difficulty,
                hint: `تلميح للسؤال رقم ${i + 1}`,
                value: this.calculateQuestionValue(difficulty, i),
                author: 'System',
                created: new Date().toISOString(),
                timesUsed: 0,
                successRate: Math.random() * 0.5 + 0.3 // 30-80% success rate
            });
        }
        
        return questions;
    }
    
    /**
     * Get sample question text
     * @param {string} category - Category ID
     * @param {string} difficulty - Difficulty level
     * @param {number} index - Question index
     * @returns {string} - Question text
     */
    getSampleQuestionText(category, difficulty, index) {
        const questions = {
            general: {
                easy: [
                    'ما هي عاصمة فرنسا؟',
                    'كم عدد أيام الأسبوع؟',
                    'ما هو لون التفاحة الناضجة؟',
                    'من هو أول خليفة في الإسلام؟',
                    'ما هو أكبر كوكب في المجموعة الشمسية؟'
                ],
                medium: [
                    'من هو مؤلف كتاب "الأمير"؟',
                    'في أي عام هجري حدثت معركة بدر؟',
                    'ما هو أطول نهر في العالم؟',
                    'من هو مخترع المصباح الكهربائي؟',
                    'ما هي عاصمة الولايات المتحدة الأمريكية؟'
                ],
                hard: [
                    'من هو الفنان الذي رسم لوحة "الموناليزا"؟',
                    'ما هي النظرية التي وضعها أينشتاين لربط الزمان والمكان؟',
                    'من هو السلطان العثماني الذي فتح القسطنطينية؟',
                    'ما هو أعمق نقطة في المحيطات؟',
                    'من هو اللاعب الوحيد الذي فاز بكأس العالم 3 مرات؟'
                ]
            },
            // Add more categories as needed
        };
        
        const categoryQuestions = questions[category] || questions.general;
        const difficultyQuestions = categoryQuestions[difficulty] || categoryQuestions.easy;
        
        return difficultyQuestions[index % difficultyQuestions.length] || 
               `سؤال ${index + 1} في فئة ${category} (${difficulty})`;
    }
    
    /**
     * Get sample answers
     * @param {string} category - Category ID
     * @param {string} difficulty - Difficulty level
     * @param {number} index - Question index
     * @returns {Array} - Array of answers
     */
    getSampleAnswers(category, difficulty, index) {
        // Sample answer sets
        const answerSets = [
            ['الإجابة الأولى', 'الإجابة الثانية', 'الإجابة الثالثة', 'الإجابة الرابعة'],
            ['الخيار أ', 'الخيار ب', 'الخيار ج', 'الخيار د'],
            ['نعم', 'لا', 'ربما', 'لا أعرف'],
            ['خيار 1', 'خيار 2', 'خيار 3', 'خيار 4']
        ];
        
        const setIndex = index % answerSets.length;
        return answerSets[setIndex];
    }
    
    /**
     * Calculate question value
     * @param {string} difficulty - Difficulty level
     * @param {number} index - Question index
     * @returns {number} - Question value
     */
    calculateQuestionValue(difficulty, index) {
        const baseValues = {
            easy: 100,
            medium: 500,
            hard: 1000
        };
        
        return baseValues[difficulty] || 100;
    }
    
    /**
     * Get all categories
     * @returns {Array} - Array of category objects
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
     * Get question count for category
     * @param {string} categoryId - Category ID
     * @returns {Object} - Question counts by difficulty
     */
    getCategoryQuestionCount(categoryId) {
        if (!this.questions[categoryId]) {
            return { total: 0, easy: 0, medium: 0, hard: 0 };
        }
        
        const easyCount = this.questions[categoryId].easy.length;
        const mediumCount = this.questions[categoryId].medium.length;
        const hardCount = this.questions[categoryId].hard.length;
        
        return {
            total: easyCount + mediumCount + hardCount,
            easy: easyCount,
            medium: mediumCount,
            hard: hardCount
        };
    }
    
    /**
     * Get question statistics
     * @returns {Object} - Question statistics
     */
    getStatistics() {
        let totalQuestions = 0;
        let totalEasy = 0;
        let totalMedium = 0;
        let totalHard = 0;
        
        Object.values(this.questionStats).forEach(stats => {
            totalQuestions += stats.total;
            totalEasy += stats.easy;
            totalMedium += stats.medium;
            totalHard += stats.hard;
        });
        
        return {
            totalQuestions,
            byDifficulty: {
                easy: totalEasy,
                medium: totalMedium,
                hard: totalHard
            },
            byCategory: this.questionStats,
            usedQuestions: this.usedQuestions.size,
            loadedChunks: this.loadedChunks.size
        };
    }
    
    /**
     * Load user preferences from localStorage
     */
    loadUserPreferences() {
        try {
            const preferences = JSON.parse(
                localStorage.getItem('question_preferences') || '{}'
            );
            
            // Load preferred categories
            if (preferences.preferredCategories) {
                preferences.preferredCategories.forEach(category => {
                    // Pre-load questions for preferred categories
                    ['easy', 'medium', 'hard'].forEach(difficulty => {
                        this.loadQuestionChunk(category, difficulty, 0);
                    });
                });
            }
            
        } catch (error) {
            console.error('Failed to load user preferences:', error);
        }
    }
    
    /**
     * Save user preferences to localStorage
     * @param {Object} preferences - User preferences
     */
    saveUserPreferences(preferences) {
        try {
            localStorage.setItem(
                'question_preferences',
                JSON.stringify(preferences)
            );
        } catch (error) {
            console.error('Failed to save user preferences:', error);
        }
    }
    
    /**
     * Search questions by keyword
     * @param {string} keyword - Search keyword
     * @param {string} category - Filter by category (optional)
     * @returns {Array} - Matching questions
     */
    searchQuestions(keyword, category = null) {
        const results = [];
        
        Object.keys(this.questions).forEach(cat => {
            if (category && cat !== category) return;
            
            ['easy', 'medium', 'hard'].forEach(difficulty => {
                this.questions[cat][difficulty].forEach(question => {
                    if (question.question.toLowerCase().includes(keyword.toLowerCase())) {
                        results.push({
                            ...question,
                            categoryName: this.categories[cat]?.name || cat
                        });
                    }
                });
            });
        });
        
        return results;
    }
    
    /**
     * Validate question object
     * @param {Object} question - Question to validate
     * @returns {Object} - Validation result
     */
    validateQuestion(question) {
        const errors = [];
        
        // Check required fields
        const requiredFields = ['id', 'question', 'answers', 'correct', 'category', 'difficulty'];
        requiredFields.forEach(field => {
            if (!question[field] && question[field] !== 0) {
                errors.push(`Missing required field: ${field}`);
            }
        });
        
        // Check answers array
        if (!Array.isArray(question.answers) || question.answers.length !== 4) {
            errors.push('Answers must be an array of 4 items');
        }
        
        // Check correct answer index
        if (question.correct < 0 || question.correct > 3) {
            errors.push('Correct answer index must be between 0 and 3');
        }
        
        // Check difficulty
        if (!['easy', 'medium', 'hard'].includes(question.difficulty)) {
            errors.push('Difficulty must be easy, medium, or hard');
        }
        
        // Check category
        if (!this.isValidCategory(question.category)) {
            errors.push(`Invalid category: ${question.category}`);
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
    
    /**
     * Add new question
     * @param {Object} question - New question
     * @returns {boolean} - Success status
     */
    addQuestion(question) {
        const validation = this.validateQuestion(question);
        
        if (!validation.isValid) {
            console.error('Invalid question:', validation.errors);
            return false;
        }
        
        // Add question to the bank
        this.questions[question.category][question.difficulty].push(question);
        
        // Update statistics
        this.questionStats[question.category].total++;
        this.questionStats[question.category][question.difficulty]++;
        
        console.log(`✅ Added new question: ${question.id}`);
        return true;
    }
    
    /**
     * Clear all questions (for testing/reset)
     */
    clearAllQuestions() {
        this.questions = {};
        this.usedQuestions.clear();
        this.questionStats = {};
        this.loadedChunks.clear();
        
        this.initializeCategories();
        console.log('🧹 All questions cleared');
    }
}

// Export for both browser and module environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuestionBank;
} else {
    window.QuestionBank = QuestionBank;
}
