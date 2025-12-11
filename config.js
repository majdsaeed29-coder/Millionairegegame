/**
 * ⚙️ إعدادات اللعبة - المليونير الذهبية
 * الإصدار 5.0 - مصحح بالكامل
 */

const GameConfig = {
    // معلومات التطبيق
    VERSION: '5.0.0',
    APP_NAME: 'المليونير الذهبية',
    APP_DESCRIPTION: 'لعبة مسابقة الذكاء للفوز بمليون دولار',
    
    // العملة
    CURRENCY: 'دولار',
    CURRENCY_SYMBOL: '$',
    INITIAL_BALANCE: 1000,
    
    // جوائز الأسئلة
    MAX_QUESTIONS: 15,
    TOTAL_PRIZE: 1000000,
    PRIZES: [
        100,     // السؤال 1
        200,     // السؤال 2
        300,     // السؤال 3
        500,     // السؤال 4
        1000,    // السؤال 5 - ضمان
        2000,    // السؤال 6
        5000,    // السؤال 7
        10000,   // السؤال 8
        16000,   // السؤال 9
        32000,   // السؤال 10 - ضمان
        64000,   // السؤال 11
        128000,  // السؤال 12
        256000,  // السؤال 13
        500000,  // السؤال 14
        1000000  // السؤال 15
    ],
    
    // نقاط الضمان
    SAFE_HAVENS: [5, 10],
    
    // مستويات الصعوبة
    DIFFICULTY_LEVELS: [
        {
            id: 'easy',
            name: 'سهل',
            time: 60,
            lifelines: 3,
            color: '#27ae60',
            description: 'مناسب للمبتدئين'
        },
        {
            id: 'medium',
            name: 'متوسط',
            time: 45,
            lifelines: 2,
            color: '#f39c12',
            description: 'تحدي معقول'
        },
        {
            id: 'hard',
            name: 'صعب',
            time: 30,
            lifelines: 1,
            color: '#e74c3c',
            description: 'للمحترفين فقط'
        }
    ],
    
    // الوقت لكل سؤال
    TIME_PER_QUESTION: {
        EASY: 60,
        MEDIUM: 45,
        HARD: 30
    },
    
    // أدوات المساعدة
    INITIAL_LIFELINES: 3,
    LIFELINES: [
        {
            id: '50_50',
            name: '50:50',
            icon: '½',
            description: 'إزالة إجابتين خاطئتين'
        },
        {
            id: 'phone_friend',
            name: 'اتصال بصديق',
            icon: '📞',
            description: 'استشارة خبير'
        },
        {
            id: 'audience',
            name: 'تصويت الجمهور',
            icon: '👥',
            description: 'رأي المشاهدين'
        },
        {
            id: 'skip',
            name: 'تخطي السؤال',
            icon: '⏭️',
            description: 'التخطي بمشاهدة إعلان'
        }
    ],
    
    // التصنيفات
    CATEGORIES: [
        {
            id: 'general',
            name: 'ثقافة عامة',
            icon: '🌍',
            color: '#3498db',
            description: 'أسئلة متنوعة من جميع المجالات'
        },
        {
            id: 'history',
            name: 'التاريخ',
            icon: '📜',
            color: '#e74c3c',
            description: 'التاريخ العربي والعالمي عبر العصور'
        },
        {
            id: 'geography',
            name: 'الجغرافيا',
            icon: '🗺️',
            color: '#2ecc71',
            description: 'دول، عواصم، معالم جغرافية'
        },
        {
            id: 'science',
            name: 'العلوم',
            icon: '🔬',
            color: '#9b59b6',
            description: 'فيزياء، كيمياء، أحياء، فضاء'
        },
        {
            id: 'sports',
            name: 'الرياضة',
            icon: '⚽',
            color: '#e67e22',
            description: 'أرقام قياسية، بطولات، ألعاب رياضية'
        },
        {
            id: 'technology',
            name: 'التكنولوجيا',
            icon: '💻',
            color: '#34495e',
            description: 'برمجيات، أجهزة، شركات تقنية'
        }
    ],
    
    // نظام النقاط والتجربة
    XP_SYSTEM: {
        BASE_XP: 100,
        WIN_BONUS: 500,
        CORRECT_ANSWER_XP: 50,
        LEVEL_MULTIPLIER: 1.5
    },
    
    // الأمان
    SECURITY: {
        SESSION_TIMEOUT: 7 * 24 * 60 * 60 * 1000, // أسبوع
        PASSWORD_MIN_LENGTH: 6,
        USERNAME_MIN_LENGTH: 3,
        USERNAME_MAX_LENGTH: 20
    },
    
    // الإعدادات
    SETTINGS: {
        SOUND_ENABLED: true,
        MUSIC_ENABLED: true,
        VIBRATION_ENABLED: true,
        NOTIFICATIONS_ENABLED: true
    },
    
    // الرسائل
    MESSAGES: {
        WELCOME: 'مرحباً بك في المليونير الذهبية!',
        LOGIN_SUCCESS: 'تم تسجيل الدخول بنجاح',
        REGISTER_SUCCESS: 'تم إنشاء الحساب بنجاح',
        GAME_STARTED: 'بدأت اللعبة! حظاً موفقاً',
        CORRECT_ANSWER: 'إجابة صحيحة! 🎉',
        WRONG_ANSWER: 'إجابة خاطئة ❌',
        TIME_UP: 'انتهى الوقت!',
        GAME_OVER: 'انتهت اللعبة',
        WIN: 'مبروك! فزت بمليون دولار! 🏆'
    },
    
    // مفاتيح التخزين
    STORAGE_KEYS: {
        USERS: 'millionaire_users_v5',
        SESSION: 'millionaire_session_v5',
        SETTINGS: 'millionaire_settings_v5',
        HIGH_SCORES: 'millionaire_highscores_v5',
        QUESTIONS: 'millionaire_questions_v5'
    }
};

// التصدير للنماذج
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameConfig;
}

if (typeof window !== 'undefined') {
    window.GameConfig = GameConfig;
}
