/**
 * Enhanced Security Manager for Millionaire Game
 * Handles encryption, validation, and anti-cheat measures
 */

class SecurityManager {
    constructor() {
        this.encryptionKey = GameConfig.SECURITY.ENCRYPTION_KEY;
        this.sessionId = this.generateSessionId();
        this.attempts = new Map();
        this.lastAttemptTime = Date.now();
        
        // Initialize security measures
        this.initSecurity();
    }
    
    /**
     * Initialize security system
     */
    initSecurity() {
        // Detect development environment
        this.isDevelopment = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
        
        // Setup tamper detection
        this.setupTamperDetection();
        
        // Setup timeout monitoring
        this.setupTimeoutMonitoring();
        
        console.log('🔒 Security Manager initialized');
    }
    
    /**
     * Generate unique session ID
     * @returns {string} - Unique session identifier
     */
    generateSessionId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        const userAgent = navigator.userAgent.substring(0, 5);
        
        return `sess_${timestamp}_${random}_${userAgent}`;
    }
    
    /**
     * Setup tamper detection
     */
    setupTamperDetection() {
        // Store initial values for comparison
        this.originalValues = {
            score: 0,
            level: 1,
            xp: 0
        };
        
        // Monitor localStorage changes
        const originalSetItem = localStorage.setItem;
        const originalGetItem = localStorage.getItem;
        
        // Override localStorage methods for monitoring
        localStorage.setItem = (key, value) => {
            // Check for game-related keys
            if (key.includes('millionaire')) {
                this.validateData(key, value);
            }
            return originalSetItem.call(localStorage, key, value);
        };
        
        // Periodic tamper checks
        setInterval(() => {
            this.performSecurityCheck();
        }, 30000); // Check every 30 seconds
    }
    
    /**
     * Setup timeout monitoring
     */
    setupTimeoutMonitoring() {
        let lastActive = Date.now();
        
        // Track user activity
        const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
        
        activityEvents.forEach(event => {
            document.addEventListener(event, () => {
                lastActive = Date.now();
            }, { passive: true });
        });
        
        // Check for inactivity
        setInterval(() => {
            const inactiveTime = Date.now() - lastActive;
            
            if (inactiveTime > GameConfig.SECURITY.SESSION_TIMEOUT) {
                this.handleInactivity();
            }
        }, 60000); // Check every minute
    }
    
    /**
     * Encrypt sensitive data
     * @param {Object} data - Data to encrypt
     * @returns {string} - Encrypted string
     */
    encrypt(data) {
        try {
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid data for encryption');
            }
            
            // Add timestamp and checksum
            const securedData = {
                ...data,
                _timestamp: Date.now(),
                _checksum: this.calculateChecksum(data),
                _session: this.sessionId
            };
            
            const jsonString = JSON.stringify(securedData);
            
            // Simple XOR encryption for demo (use crypto.subtle in production)
            let encrypted = '';
            for (let i = 0; i < jsonString.length; i++) {
                const charCode = jsonString.charCodeAt(i) ^ 
                               this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
                encrypted += String.fromCharCode(charCode);
            }
            
            return btoa(encrypted);
            
        } catch (error) {
            console.error('Encryption error:', error);
            return null;
        }
    }
    
    /**
     * Decrypt data
     * @param {string} encryptedString - Encrypted data
     * @returns {Object|null} - Decrypted data or null
     */
    decrypt(encryptedString) {
        try {
            if (!encryptedString || typeof encryptedString !== 'string') {
                throw new Error('Invalid encrypted string');
            }
            
            // Decode from base64
            const decoded = atob(encryptedString);
            
            // XOR decryption
            let decrypted = '';
            for (let i = 0; i < decoded.length; i++) {
                const charCode = decoded.charCodeAt(i) ^ 
                               this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
                decrypted += String.fromCharCode(charCode);
            }
            
            const data = JSON.parse(decrypted);
            
            // Validate checksum
            if (!this.validateChecksum(data)) {
                throw new Error('Checksum validation failed');
            }
            
            // Validate session
            if (data._session !== this.sessionId) {
                throw new Error('Session validation failed');
            }
            
            // Remove security fields
            delete data._timestamp;
            delete data._checksum;
            delete data._session;
            
            return data;
            
        } catch (error) {
            console.error('Decryption error:', error);
            return null;
        }
    }
    
    /**
     * Calculate checksum for data validation
     * @param {Object} data - Data to checksum
     * @returns {string} - Checksum hash
     */
    calculateChecksum(data) {
        const str = JSON.stringify(data) + this.encryptionKey;
        let hash = 0;
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return Math.abs(hash).toString(16);
    }
    
    /**
     * Validate checksum
     * @param {Object} data - Data with checksum
     * @returns {boolean} - True if valid
     */
    validateChecksum(data) {
        const { _checksum, ...dataWithoutChecksum } = data;
        const expectedChecksum = this.calculateChecksum(dataWithoutChecksum);
        
        return _checksum === expectedChecksum;
    }
    
    /**
     * Validate subscription data
     * @param {Object} subscriptionData - Subscription data
     * @returns {boolean} - True if valid
     */
    validateSubscription(subscriptionData) {
        if (!subscriptionData) return false;
        
        // Check required fields
        const requiredFields = ['userId', 'plan', 'expiry', 'activated'];
        for (const field of requiredFields) {
            if (!subscriptionData[field]) {
                console.warn(`Missing subscription field: ${field}`);
                return false;
            }
        }
        
        // Check expiry date
        const now = new Date();
        const expiry = new Date(subscriptionData.expiry);
        
        if (expiry <= now) {
            this.removeExpiredSubscription();
            return false;
        }
        
        // Validate checksum
        if (subscriptionData.checksum) {
            return this.validateChecksum(subscriptionData);
        }
        
        return true;
    }
    
    /**
     * Remove expired subscription
     */
    removeExpiredSubscription() {
        localStorage.removeItem(GameConfig.STORAGE_KEYS.SUBSCRIPTION);
        console.log('Expired subscription removed');
    }
    
    /**
     * Validate user input
     * @param {string} input - User input
     * @param {string} type - Input type (name, etc.)
     * @returns {Object} - Validation result
     */
    validateInput(input, type = 'name') {
        const result = {
            isValid: true,
            errors: [],
            sanitized: input
        };
        
        if (typeof input !== 'string') {
            result.isValid = false;
            result.errors.push('Input must be a string');
            return result;
        }
        
        switch (type) {
            case 'name':
                // Check length
                if (input.length < GameConfig.VALIDATION.PLAYER_NAME.MIN_LENGTH) {
                    result.isValid = false;
                    result.errors.push(`الاسم قصير جداً (${GameConfig.VALIDATION.PLAYER_NAME.MIN_LENGTH} أحرف على الأقل)`);
                }
                
                if (input.length > GameConfig.VALIDATION.PLAYER_NAME.MAX_LENGTH) {
                    result.isValid = false;
                    result.errors.push(`الاسم طويل جداً (${GameConfig.VALIDATION.PLAYER_NAME.MAX_LENGTH} أحرف كحد أقصى)`);
                }
                
                // Check pattern
                if (!GameConfig.VALIDATION.PLAYER_NAME.PATTERN.test(input)) {
                    result.isValid = false;
                    result.errors.push('الاسم يحتوي على أحرف غير مسموحة');
                }
                
                // Sanitize
                result.sanitized = input
                    .replace(/[<>]/g, '') // Remove HTML tags
                    .trim()
                    .substring(0, GameConfig.VALIDATION.PLAYER_NAME.MAX_LENGTH);
                break;
                
            case 'avatar':
                if (!GameConfig.VALIDATION.AVATAR.VALID_VALUES.includes(input)) {
                    result.isValid = false;
                    result.errors.push('رمز غير صالح');
                }
                break;
                
            case 'questionId':
                const pattern = /^Q\d{4}_[A-Z]{3}_[EMH]\d{2}$/;
                result.isValid = pattern.test(input);
                if (!result.isValid) {
                    result.errors.push('معرف سؤال غير صالح');
                }
                break;
        }
        
        return result;
    }
    
    /**
     * Validate score data
     * @param {number} score - Score to validate
     * @returns {boolean} - True if valid
     */
    validateScore(score) {
        if (typeof score !== 'number' || isNaN(score)) {
            return false;
        }
        
        // Score should be positive and not exceed max possible
        if (score < 0 || score > GameConfig.TOTAL_PRIZE * 1.1) {
            return false;
        }
        
        // Check for integer value
        if (!Number.isInteger(score)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Detect and prevent cheating
     * @param {Object} gameState - Current game state
     * @returns {Object} - Detection result
     */
    detectCheating(gameState) {
        const detections = {
            isCheating: false,
            reasons: [],
            severity: 'low'
        };
        
        // 1. Check score anomalies
        if (gameState.score) {
            const maxPossible = this.calculateMaxPossibleScore(gameState);
            if (gameState.score > maxPossible) {
                detections.isCheating = true;
                detections.reasons.push(`Score exceeds maximum possible (${gameState.score} > ${maxPossible})`);
                detections.severity = 'high';
            }
        }
        
        // 2. Check time anomalies
        if (gameState.totalTime) {
            const minPossibleTime = this.calculateMinPossibleTime(gameState);
            if (gameState.totalTime < minPossibleTime) {
                detections.isCheating = true;
                detections.reasons.push(`Time is too short (${gameState.totalTime}s < ${minPossibleTime}s minimum)`);
                detections.severity = 'medium';
            }
        }
        
        // 3. Check answer speed
        if (gameState.answers && gameState.answers.length > 0) {
            const impossiblyFast = gameState.answers.some(answer => 
                answer.timeSpent && answer.timeSpent < 1
            );
            
            if (impossiblyFast) {
                detections.isCheating = true;
                detections.reasons.push('Impossibly fast answers detected');
                detections.severity = 'medium';
            }
        }
        
        // 4. Check localStorage tampering
        if (this.detectLocalStorageTampering()) {
            detections.isCheating = true;
            detections.reasons.push('LocalStorage tampering detected');
            detections.severity = 'high';
        }
        
        // 5. Check time manipulation
        if (this.detectTimeManipulation()) {
            detections.isCheating = true;
            detections.reasons.push('System time manipulation detected');
            detections.severity = 'high';
        }
        
        return detections;
    }
    
    /**
     * Calculate maximum possible score
     * @param {Object} gameState - Game state
     * @returns {number} - Max possible score
     */
    calculateMaxPossibleScore(gameState) {
        let maxScore = 0;
        
        if (gameState.correctAnswers && gameState.totalQuestions) {
            // Calculate based on answered questions
            const questions = Math.min(gameState.totalQuestions, GameConfig.MAX_QUESTIONS);
            
            for (let i = 0; i < questions; i++) {
                maxScore += GameConfig.PRIZES[i];
            }
        }
        
        return maxScore;
    }
    
    /**
     * Calculate minimum possible time
     * @param {Object} gameState - Game state
     * @returns {number} - Minimum time in seconds
     */
    calculateMinPossibleTime(gameState) {
        // Minimum time per question (educated guess)
        const MIN_TIME_PER_QUESTION = 3; // seconds
        
        if (gameState.totalQuestions) {
            return gameState.totalQuestions * MIN_TIME_PER_QUESTION;
        }
        
        return GameConfig.MAX_QUESTIONS * MIN_TIME_PER_QUESTION;
    }
    
    /**
     * Detect localStorage tampering
     * @returns {boolean} - True if tampering detected
     */
    detectLocalStorageTampering() {
        try {
            // Test write/read
            const testKey = '__security_test__';
            const testValue = Math.random().toString(36);
            
            localStorage.setItem(testKey, testValue);
            const retrieved = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            
            return retrieved !== testValue;
            
        } catch (error) {
            return true; // Error indicates tampering
        }
    }
    
    /**
     * Detect time manipulation
     * @returns {boolean} - True if time manipulation detected
     */
    detectTimeManipulation() {
        try {
            // Store initial time
            if (!this.initialTime) {
                this.initialTime = Date.now();
                this.initialPerformance = performance.now();
                return false;
            }
            
            const currentTime = Date.now();
            const currentPerformance = performance.now();
            
            // Calculate expected performance time
            const elapsedRealTime = currentTime - this.initialTime;
            const elapsedPerformance = currentPerformance - this.initialPerformance;
            
            // Allow 10% difference for system variations
            const maxDifference = elapsedRealTime * 0.1;
            
            return Math.abs(elapsedPerformance - elapsedRealTime) > maxDifference;
            
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Validate data before storage
     * @param {string} key - Storage key
     * @param {string} value - Value to store
     */
    validateData(key, value) {
        // Check for game-related keys
        if (!key.includes('millionaire')) return;
        
        try {
            const data = JSON.parse(value);
            
            // Validate based on key type
            switch (true) {
                case key.includes('player'):
                    this.validatePlayerData(data);
                    break;
                    
                case key.includes('score'):
                    this.validateScoreData(data);
                    break;
                    
                case key.includes('subscription'):
                    this.validateSubscriptionData(data);
                    break;
            }
            
        } catch (error) {
            console.warn(`Invalid data for key ${key}:`, error);
            throw new Error('Data validation failed');
        }
    }
    
    /**
     * Validate player data
     * @param {Object} playerData - Player data
     */
    validatePlayerData(playerData) {
        const requiredFields = ['name', 'level', 'xp'];
        
        for (const field of requiredFields) {
            if (!(field in playerData)) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        
        // Validate specific fields
        const nameValidation = this.validateInput(playerData.name, 'name');
        if (!nameValidation.isValid) {
            throw new Error(`Invalid player name: ${nameValidation.errors.join(', ')}`);
        }
        
        if (playerData.score !== undefined && !this.validateScore(playerData.score)) {
            throw new Error('Invalid score value');
        }
    }
    
    /**
     * Validate score data
     * @param {Object} scoreData - Score data
     */
    validateScoreData(scoreData) {
        if (!Array.isArray(scoreData)) {
            throw new Error('Score data must be an array');
        }
        
        // Limit number of scores
        if (scoreData.length > 1000) {
            throw new Error('Too many scores stored');
        }
        
        // Validate each score
        scoreData.forEach((score, index) => {
            if (!score || typeof score !== 'object') {
                throw new Error(`Invalid score at index ${index}`);
            }
            
            const requiredFields = ['name', 'score', 'date'];
            for (const field of requiredFields) {
                if (!(field in score)) {
                    throw new Error(`Score at index ${index} missing field: ${field}`);
                }
            }
            
            if (!this.validateScore(score.score)) {
                throw new Error(`Invalid score value at index ${index}`);
            }
        });
    }
    
    /**
     * Validate subscription data
     * @param {Object} subscriptionData - Subscription data
     */
    validateSubscriptionData(subscriptionData) {
        if (!this.validateSubscription(subscriptionData)) {
            throw new Error('Invalid subscription data');
        }
    }
    
    /**
     * Perform security check
     */
    performSecurityCheck() {
        const checks = [
            this.detectLocalStorageTampering(),
            this.detectTimeManipulation(),
            this.checkSuspiciousActivity()
        ];
        
        if (checks.some(check => check)) {
            this.handleSecurityBreach();
        }
    }
    
    /**
     * Check for suspicious activity
     * @returns {boolean} - True if suspicious activity detected
     */
    checkSuspiciousActivity() {
        const now = Date.now();
        
        // Check rate limiting
        if (this.attempts.size > GameConfig.SECURITY.MAX_ATTEMPTS) {
            const firstAttempt = Math.min(...this.attempts.values());
            if (now - firstAttempt < GameConfig.SECURITY.COOLDOWN_TIME) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Handle security breach
     */
    handleSecurityBreach() {
        if (this.isDevelopment) {
            console.warn('Security breach detected (development mode)');
            return;
        }
        
        // Clear sensitive data
        this.clearSensitiveData();
        
        // Log incident (in production, send to server)
        console.error('Security breach detected');
        
        // Show user message
        this.showSecurityAlert();
    }
    
    /**
     * Clear sensitive data
     */
    clearSensitiveData() {
        const sensitiveKeys = [
            GameConfig.STORAGE_KEYS.SUBSCRIPTION,
            GameConfig.STORAGE_KEYS.PLAYER_DATA,
            GameConfig.STORAGE_KEYS.HIGH_SCORES
        ];
        
        sensitiveKeys.forEach(key => {
            localStorage.removeItem(key);
        });
    }
    
    /**
     * Show security alert
     */
    showSecurityAlert() {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'security-alert';
        alertDiv.innerHTML = `
            <div class="alert-content">
                <i class="fas fa-shield-alt"></i>
                <h3>تنبيه أمان</h3>
                <p>تم اكتشاف نشاط غير معتاد. تم مسح البيانات الحساسة لحماية حسابك.</p>
                <button onclick="this.parentElement.parentElement.remove(); location.reload();">
                    إعادة تحميل
                </button>
            </div>
        `;
        
        document.body.appendChild(alertDiv);
    }
    
    /**
     * Handle inactivity
     */
    handleInactivity() {
        // Clear session data
        this.sessionId = this.generateSessionId();
        
        // Show inactivity warning
        this.showInactivityWarning();
    }
    
    /**
     * Show inactivity warning
     */
    showInactivityWarning() {
        if (document.querySelector('.inactivity-warning')) return;
        
        const warningDiv = document.createElement('div');
        warningDiv.className = 'inactivity-warning';
        warningDiv.innerHTML = `
            <div class="warning-content">
                <i class="fas fa-clock"></i>
                <p>لقد كنت خاملاً لفترة طويلة. الجلسة ستنتهي قريباً.</p>
            </div>
        `;
        
        document.body.appendChild(warningDiv);
        
        // Remove after 5 seconds
        setTimeout(() => {
            warningDiv.remove();
        }, 5000);
    }
    
    /**
     * Log security event (for analytics)
     * @param {string} event - Event type
     * @param {Object} data - Event data
     */
    logSecurityEvent(event, data = {}) {
        const logEntry = {
            event,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            userAgent: navigator.userAgent,
            url: window.location.href,
            ...data
        };
        
        // Store locally (in production, send to server)
        const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
        logs.push(logEntry);
        
        // Keep only last 100 logs
        if (logs.length > 100) {
            logs.shift();
        }
        
        localStorage.setItem('security_logs', JSON.stringify(logs));
    }
    
    /**
     * Get security status
     * @returns {Object} - Security status
     */
    getSecurityStatus() {
        return {
            sessionId: this.sessionId,
            isSecure: !this.detectLocalStorageTampering() && !this.detectTimeManipulation(),
            lastCheck: Date.now(),
            attempts: this.attempts.size,
            isDevelopment: this.isDevelopment
        };
    }
}

// Export for both browser and module environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityManager;
} else {
    window.SecurityManager = SecurityManager;
}
