// ⚙️ إعدادات لعبة المليونير الذهبية
const GameConfig = {
    // معلومات التطبيق
    VERSION: '1.0.0',
    APP_NAME: 'المليونير الذهبية',
    CURRENCY: 'دولار',
    CURRENCY_SYMBOL: '$',
    
    // الجوائز
    MAX_QUESTIONS: 15,
    PRIZES: [
        100,      // سؤال 1
        200,      // سؤال 2
        300,      // سؤال 3
        500,      // سؤال 4
        1000,     // سؤال 5 - ضمان
        2000,     // سؤال 6
        5000,     // سؤال 7
        10000,    // سؤال 8
        16000,    // سؤال 9
        32000,    // سؤال 10 - ضمان
        64000,    // سؤال 11
        128000,   // سؤال 12
        256000,   // سؤال 13
        500000,   // سؤال 14
        1000000   // سؤال 15
    ],
    
    // نقاط الضمان
    SAFE_HAVENS: [5, 10],
    
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
            description: 'التاريخ العربي والعالمي'
        },
        {
            id: 'geography',
            name: 'الجغرافيا',
            icon: '🗺️',
            color: '#2ecc71',
            description: 'دول، عواصم، معالم'
        },
        {
            id: 'science',
            name: 'العلوم',
            icon: '🔬',
            color: '#9b59b6',
            description: 'فيزياء، كيمياء، أحياء'
        },
        {
            id: 'sports',
            name: 'الرياضة',
            icon: '⚽',
            color: '#e67e22',
            description: 'ألعاب رياضية وبطولات'
        },
        {
            id: 'entertainment',
            name: 'الترفيه',
            icon: '🎬',
            color: '#1abc9c',
            description: 'أفلام، موسيقى، فنانون'
        }
    ],
    
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
    
    // أدوات المساعدة
    LIFELINES: [
        {
            id: '50_50',
            name: '50:50',
            icon: '½',
            description: 'حذف إجابتين خاطئتين'
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
        }
    ],
    
    // مفاتيح التخزين
    STORAGE_KEYS: {
        USERS: 'millionaire_users',
        SESSION: 'millionaire_session',
        QUESTIONS: 'millionaire_questions',
        HIGH_SCORES: 'millionaire_highscores',
        SETTINGS: 'millionaire_settings'
    },
    
    // رسائل النظام
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
    }
};

// جعلها متاحة عالمياً
if (typeof window !== 'undefined') {
    window.GameConfig = GameConfig;
}
