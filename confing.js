/**
 * Game Configuration File
 * Contains all game settings and constants for Millionaire Game
 */

const GameConfig = {
    // ==================== GAME INFO ====================
    VERSION: '3.0.0',
    GAME_NAME: 'من سريع المليون',
    
    // ==================== GAME STRUCTURE ====================
    MAX_QUESTIONS: 15,
    TOTAL_PRIZE: 1000000, // 1 Million
    
    // Prize structure (15 questions)
    PRIZES: [
        100,        // Q1
        200,        // Q2
        300,        // Q3
        500,        // Q4
        1000,       // Q5 - Safe Haven
        2000,       // Q6
        5000,       // Q7
        10000,      // Q8
        16000,      // Q9
        32000,      // Q10 - Safe Haven
        64000,      // Q11
        125000,     // Q12
        250000,     // Q13
        500000,     // Q14
        1000000     // Q15 - المليون
    ],
    
    // Safe haven questions (guaranteed money)
    SAFE_HAVENS: [5, 10], // Question numbers (1-based)
    
    // ==================== DIFFICULTY SETTINGS ====================
    TIME_PER_QUESTION: {
        EASY: 45,     // Questions 1-5
        MEDIUM: 30,   // Questions 6-10
        HARD: 20      // Questions 11-15
    },
    
    LIFELINES_PER_DIFFICULTY: {
        EASY: 4,
        MEDIUM: 3,
        HARD: 2
    },
    
    // ==================== CATEGORIES ====================
    CATEGORIES: {
        GENERAL: {
            id: 'general',
            name: 'عام',
            icon: '🌍',
            color: '#0984e3',
            description: 'أسئلة متنوعة من جميع المجالات'
        },
        LITERATURE: {
            id: 'literature',
            name: 'أدب',
            icon: '📚',
            color: '#00b894',
            description: 'أسئلة في الأدب العربي والعالمي'
        },
        HISTORY: {
            id: 'history',
            name: 'تاريخ',
            icon: '🏛️',
            color: '#e17055',
            description: 'أسئلة في التاريخ العربي والعالمي'
        },
        GEOGRAPHY: {
            id: 'geography',
            name: 'جغرافيا',
            icon: '🗺️',
            color: '#6c5ce7',
            description: 'دول، عواصم، طبيعة'
        },
        SCIENCE: {
            id: 'science',
            name: 'علوم',
            icon: '🔬',
            color: '#fd79a8',
            description: 'فيزياء، كيمياء، أحياء، فضاء'
        },
        SPORTS: {
            id: 'sports',
            name: 'رياضة',
            icon: '⚽',
            color: '#fdcb6e',
            description: 'كرة قدم، أولمبياد، ألعاب'
        },
        ART: {
            id: 'art',
            name: 'فن',
            icon: '🎨',
            color: '#a29bfe',
            description: 'فنون، سينما، موسيقى'
        },
        CULTURE: {
            id: 'culture',
            name: 'ثقافة',
            icon: '🧠',
            color: '#00cec9',
            description: 'ثقافة عامة ومعرفة'
        }
    },
    
    // ==================== GAMEPLAY SETTINGS ====================
    LIFELINES: {
        FIFTY_FIFTY: '5050',
        PHONE_A_FRIEND: 'phone',
        ASK_THE_AUDIENCE: 'audience',
        SKIP_QUESTION: 'skip'
    },
    
    // ==================== XP & LEVELING SYSTEM ====================
    XP_SYSTEM: {
        BASE_XP: 100,
        WIN_BONUS: 500,
        CORRECT_ANSWER_XP: 50,
        STREAK_BONUS: 10,
        PERFECT_GAME_BONUS: 1000,
        LEVEL_MULTIPLIER: 1.5,
        INITIAL_XP_REQUIRED: 1000
    },
    
    // ==================== SECURITY SETTINGS ====================
    SECURITY: {
        ENCRYPTION_KEY: 'millionaire_v3_secure_key_2024',
        SALT_ROUNDS: 10,
        SESSION_TIMEOUT: 3600000, // 1 hour in milliseconds
        MAX_ATTEMPTS: 5,
        COOLDOWN_TIME: 300000 // 5 minutes
    },
    
    // ==================== ADS SETTINGS ====================
    ADS: {
        MAX_PER_SESSION: 3,
        COOLDOWN_SECONDS: 60,
        TYPES: {
            SKIP: {
                name: 'skip',
                reward: 'تخطي السؤال الحالي',
                duration: 15
            },
            LIFELINE: {
                name: 'lifeline',
                reward: 'أداة مساعدة إضافية',
                duration: 20
            },
            COINS: {
                name: 'coins',
                reward: '1000 دينار إضافي',
                duration: 25
            }
        }
    },
    
    // ==================== SUBSCRIPTION SETTINGS ====================
    SUBSCRIPTION: {
        MONTHLY_PRICE: 9.99,
        ANNUAL_PRICE: 99.99,
        TRIAL_DAYS: 7,
        FEATURES: [
            'إزالة جميع الإعلانات',
            'أدوات مساعدة إضافية',
            'أسئلة حصرية',
            'دعم مباشر',
            'إحصائيات متقدمة'
        ]
    },
    
    // ==================== UI/UX SETTINGS ====================
    UI: {
        ANIMATION_DURATION: 300,
        NOTIFICATION_TIMEOUT: 5000,
        HINT_DELAY: 10000, // Show hint after 10 seconds
        TRANSITION_EFFECT: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    
    // ==================== SOUND SETTINGS ====================
    SOUNDS: {
        CORRECT: 'https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3',
        WRONG: 'https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3',
        CLICK: 'https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3',
        WIN: 'https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3',
        TIMER: 'https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3'
    },
    
    // ==================== LOCAL STORAGE KEYS ====================
    STORAGE_KEYS: {
        PLAYER_DATA: 'millionaire_player_data',
        SETTINGS: 'millionaire_settings',
        HIGH_SCORES: 'millionaire_high_scores',
        SUBSCRIPTION: 'millionaire_subscription',
        GAME_STATS: 'millionaire_game_stats',
        USED_QUESTIONS: 'millionaire_used_questions'
    },
    
    // ==================== ERROR MESSAGES ====================
    ERRORS: {
        NETWORK: 'حدث خطأ في الاتصال. يرجى التحقق من اتصال الإنترنت.',
        LOADING: 'فشل في تحميل البيانات. يرجى المحاولة مرة أخرى.',
        SECURITY: 'تم اكتشاف مشكلة أمنية. يرجى إعادة تحميل الصفحة.',
        SUBSCRIPTION: 'حدث خطأ في معالجة الاشتراك.',
        QUESTION_LOAD: 'لا يمكن تحميل الأسئلة في الوقت الحالي.'
    },
    
    // ==================== SUCCESS MESSAGES ====================
    SUCCESS: {
        GAME_START: 'بدأت اللعبة! حظاً موفقاً 🚀',
        CORRECT_ANSWER: 'إجابة صحيحة! مبروك 🎉',
        LEVEL_UP: 'مبروك! لقد ارتفع مستواك ⭐',
        SUBSCRIPTION: 'تم تفعيل الاشتراك بنجاح 👑'
    },
    
    // ==================== VALIDATION RULES ====================
    VALIDATION: {
        PLAYER_NAME: {
            MIN_LENGTH: 2,
            MAX_LENGTH: 20,
            PATTERN: /^[\u0600-\u06FF\s\d]+$/u // Arabic letters, numbers, spaces
        },
        AVATAR: {
            VALID_VALUES: ['👤', '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓', '👨‍🔬', '👩‍🔬']
        }
    },
    
    // ==================== API ENDPOINTS (For Future Use) ====================
    API: {
        BASE_URL: 'https://api.millionaire-game.com/v1',
        ENDPOINTS: {
            QUESTIONS: '/questions',
            LEADERBOARD: '/leaderboard',
            SUBSCRIPTION: '/subscription',
            STATS: '/stats'
        }
    },
    
    // ==================== FEATURE FLAGS ====================
    FEATURES: {
        MULTIPLAYER: false,
        DAILY_CHALLENGES: true,
        ACHIEVEMENTS: true,
        SOCIAL_SHARING: true,
        OFFLINE_MODE: true,
        PWA_SUPPORT: true
    }
};

// Export for both browser and module environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameConfig;
} else {
    window.GameConfig = GameConfig;
}
