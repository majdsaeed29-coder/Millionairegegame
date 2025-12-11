// 👑 لوحة الإدارة
class AdminPanel {
    constructor(appInstance) {
        this.app = appInstance;
        console.log('✅ لوحة الإدارة جاهزة');
    }
    
    // إنشاء مسؤول افتراضي
    createDefaultAdmin() {
        const adminData = {
            username: 'admin',
            password: 'admin123',
            email: 'admin@millionaire.com',
            isAdmin: true
        };
        
        // التحقق من وجود المسؤول
        if (this.app.auth.users[adminData.username]) {
            console.log('المسؤول موجود بالفعل');
            return false;
        }
        
        // إنشاء المسؤول
        const result = this.app.auth.register(
            adminData.username,
            adminData.password,
            adminData.email,
            adminData.isAdmin
        );
        
        if (result.success) {
            console.log('✅ تم إنشاء المسؤول الافتراضي');
            console.log('👤 المستخدم: admin');
            console.log('🔐 كلمة المرور: admin123');
            return true;
        }
        
        return false;
    }
    
    // تحميل لوحة الإدارة
    loadAdminPanel() {
        const adminScreen = document.getElementById('admin-screen');
        if (!adminScreen) return;
        
        adminScreen.innerHTML = `
            <div class="admin-screen">
                <div class="admin-header">
                    <h1><i class="fas fa-cogs"></i> لوحة إدارة المليونير الذهبية</h1>
                    <button class="btn btn-secondary" id="back-to-menu">
                        <i class="fas fa-arrow-right"></i> العودة للقائمة
                    </button>
                </div>
                
                <div class="admin-tabs">
                    <button class="admin-tab active" data-tab="questions">📝 إدارة الأسئلة</button>
                    <button class="admin-tab" data-tab="users">👥 إدارة المستخدمين</button>
                    <button class="admin-tab" data-tab="payments">💰 إدارة المدفوعات</button>
                    <button class="admin-tab" data-tab="stats">📊 إحصائيات</button>
                </div>
                
                <div class="admin-content" id="admin-content">
                    <!-- سيتم تحميل المحتوى هنا -->
                </div>
            </div>
        `;
        
        // تحميل المحتوى الأولي
        this.loadAdminContent('questions');
        
        // أحداث التبويبات
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.loadAdminContent(tabName);
            });
        });
        
        // زر العودة
        document.getElementById('back-to-menu').addEventListener('click', () => {
            this.app.showMainMenu();
        });
    }
    
    // تحميل محتوى التبويب
    loadAdminContent(tabName) {
        const contentDiv = document.getElementById('admin-content');
        if (!contentDiv) return;
        
        // تحديث التبويبات النشطة
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`.admin-tab[data-tab="${tabName}"]`).classList.add('active');
        
        switch(tabName) {
            case 'questions':
                this.loadQuestionsTab(contentDiv);
                break;
            case 'users':
                this.loadUsersTab(contentDiv);
                break;
            case 'payments':
                this.loadPaymentsTab(contentDiv);
                break;
            case 'stats':
                this.loadStatsTab(contentDiv);
                break;
        }
    }
    
    // تبويب الأسئلة
    loadQuestionsTab(container) {
        const questions = this.app.questions.getAllQuestions();
        
        container.innerHTML = `
            <div class="question-management">
                <h2><i class="fas fa-question-circle"></i> إدارة الأسئلة (${questions.length})</h2>
                
                <div class="question-form" style="margin: 30px 0;">
                    <h3>إضافة سؤال جديد</h3>
                    
                    <div class="form-group">
                        <label>نص السؤال</label>
                        <textarea id="new-question-text" class="form-control" rows="3" placeholder="أدخل نص السؤال..." style="resize: vertical;"></textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>الإجابة 1</label>
                            <input type="text" id="answer-1" class="form-control" placeholder="الإجابة الأولى">
                        </div>
                        <div class="form-group">
                            <label>الإجابة 2</label>
                            <input type="text" id="answer-2" class="form-control" placeholder="الإجابة الثانية">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>الإجابة 3</label>
                            <input type="text" id="answer-3" class="form-control" placeholder="الإجابة الثالثة">
                        </div>
                        <div class="form-group">
                            <label>الإجابة 4</label>
                            <input type="text" id="answer-4" class="form-control" placeholder="الإجابة الرابعة">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>الإجابة الصحيحة</label>
                            <select id="correct-answer" class="form-control">
                                <option value="0">الإجابة 1</option>
                                <option value="1">الإجابة 2</option>
                                <option value="2">الإجابة 3</option>
                                <option value="3">الإجابة 4</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>التصنيف</label>
                            <select id="question-category" class="form-control">
                                ${GameConfig.CATEGORIES.map(cat => 
                                    `<option value="${cat.id}">${cat.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>مستوى الصعوبة</label>
                            <select id="question-difficulty" class="form-control">
                                <option value="easy">سهل</option>
                                <option value="medium">متوسط</option>
                                <option value="hard">صعب</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>تلميح (اختياري)</label>
                            <input type="text" id="question-hint" class="form-control" placeholder="تلميح للسؤال">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>شرح الإجابة (اختياري)</label>
                        <textarea id="question-explanation" class="form-control" rows="2" placeholder="شرح للإجابة الصحيحة..."></textarea>
                    </div>
                    
                    <button id="add-question-btn" class="btn btn-primary">
                        <i class="fas fa-plus"></i> إضافة السؤال
                    </button>
                </div>
                
                <div class="questions-list">
                    <h3>الأسئلة الحالية</h3>
                    
                    <div style="margin: 20px 0;">
                        <input type="text" id="search-questions" class="form-control" placeholder="🔍 بحث في الأسئلة..." style="max-width: 300px;">
                    </div>
                    
                    <div id="questions-container" style="max-height: 500px; overflow-y: auto;">
                        ${questions.map(q => `
                            <div class="question-item" data-id="${q.id}">
                                <div>
                                    <strong>${q.question}</strong>
                                    <div style="color: #aaa; font-size: 0.9rem; margin-top: 5px;">
                                        <span style="background: ${this.getCategoryColor(q.category)}; padding: 2px 8px; border-radius: 10px; margin-left: 5px;">
                                            ${q.categoryName}
                                        </span>
                                        <span style="background: ${this.getDifficultyColor(q.difficulty)}; padding: 2px 8px; border-radius: 10px; margin-left: 5px;">
                                            ${q.difficulty}
                                        </span>
                                        <span>${q.points} نقطة</span>
                                    </div>
                                </div>
                                <div>
                                    <button class="btn btn-secondary edit-question-btn" data-id="${q.id}" style="margin-left: 10px;">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-danger delete-question-btn" data-id="${q.id}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        // حدث إضافة سؤال
        document.getElementById('add-question-btn').addEventListener('click', () => {
            this.addNewQuestion();
        });
        
        // حدث البحث
        document.getElementById('search-questions').addEventListener('input', (e) => {
            this.searchQuestions(e.target.value);
        });
        
        // أحداث الحذف والتعديل
        setTimeout(() => {
            document.querySelectorAll('.delete-question-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const questionId = e.target.closest('button').dataset.id;
                    this.deleteQuestion(questionId);
                });
            });
            
            document.querySelectorAll('.edit-question-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const questionId = e.target.closest('button').dataset.id;
                    this.editQuestion(questionId);
                });
            });
        }, 100);
    }
    
    // إضافة سؤال جديد
    addNewQuestion() {
        const questionData = {
            question: document.getElementById('new-question-text').value.trim(),
            answers: [
                document.getElementById('answer-1').value.trim(),
                document.getElementById('answer-2').value.trim(),
                document.getElementById('answer-3').value.trim(),
                document.getElementById('answer-4').value.trim()
            ],
            correct: parseInt(document.getElementById('correct-answer').value),
            category: document.getElementById('question-category').value,
            difficulty: document.getElementById('question-difficulty').value,
            hint: document.getElementById('question-hint').value.trim(),
            explanation: document.getElementById('question-explanation').value.trim()
        };
        
        // التحقق من البيانات
        if (!questionData.question || questionData.answers.some(a => !a)) {
            this.app.ui.showNotification('الرجاء ملء جميع الحقول المطلوبة', 'error');
            return;
        }
        
        // إضافة السؤال
        const success = this.app.questions.addQuestion(questionData);
        
        if (success) {
            this.app.ui.showNotification('تم إضافة السؤال بنجاح', 'success');
            this.loadAdminContent('questions'); // إعادة تحميل
        } else {
            this.app.ui.showNotification('خطأ في إضافة السؤال', 'error');
        }
    }
    
    // بحث الأسئلة
    searchQuestions(query) {
        const questions = this.app.questions.searchQuestions(query);
        const container = document.getElementById('questions-container');
        
        if (!container) return;
        
        container.innerHTML = questions.map(q => `
            <div class="question-item" data-id="${q.id}">
                <div>
                    <strong>${q.question}</strong>
                    <div style="color: #aaa; font-size: 0.9rem; margin-top: 5px;">
                        <span style="background: ${this.getCategoryColor(q.category)}; padding: 2px 8px; border-radius: 10px; margin-left: 5px;">
                            ${q.categoryName}
                        </span>
                        <span style="background: ${this.getDifficultyColor(q.difficulty)}; padding: 2px 8px; border-radius: 10px; margin-left: 5px;">
                            ${q.difficulty}
                        </span>
                        <span>${q.points} نقطة</span>
                    </div>
                </div>
                <div>
                    <button class="btn btn-secondary edit-question-btn" data-id="${q.id}" style="margin-left: 10px;">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger delete-question-btn" data-id="${q.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // حذف سؤال
    deleteQuestion(questionId) {
        if (confirm('هل تريد حذف هذا السؤال؟')) {
            const success = this.app.questions.deleteQuestion(questionId);
            
            if (success) {
                this.app.ui.showNotification('تم حذف السؤال بنجاح', 'success');
                this.loadAdminContent('questions');
            } else {
                this.app.ui.showNotification('خطأ في حذف السؤال', 'error');
            }
        }
    }
    
    // تعديل سؤال
    editQuestion(questionId) {
        // البحث عن السؤال
        let question = null;
        const allQuestions = this.app.questions.getAllQuestions();
        
        for (const q of allQuestions) {
            if (q.id === questionId) {
                question = q;
                break;
            }
        }
        
        if (!question) {
            this.app.ui.showNotification('السؤال غير موجود', 'error');
            return;
        }
        
        // نافذة التعديل
        const modalContent = `
            <h3 style="color: var(--gold-light); margin-bottom: 20px;">تعديل السؤال</h3>
            
            <div class="form-group">
                <label>نص السؤال</label>
                <textarea id="edit-question-text" class="form-control" rows="3">${question.question}</textarea>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>الإجابة 1</label>
                    <input type="text" id="edit-answer-1" class="form-control" value="${question.answers[0]}">
                </div>
                <div class="form-group">
                    <label>الإجابة 2</label>
                    <input type="text" id="edit-answer-2" class="form-control" value="${question.answers[1]}">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>الإجابة 3</label>
                    <input type="text" id="edit-answer-3" class="form-control" value="${question.answers[2]}">
                </div>
                <div class="form-group">
                    <label>الإجابة 4</label>
                    <input type="text" id="edit-answer-4" class="form-control" value="${question.answers[3]}">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>الإجابة الصحيحة</label>
                    <select id="edit-correct-answer" class="form-control">
                        <option value="0" ${question.correct === 0 ? 'selected' : ''}>الإجابة 1</option>
                        <option value="1" ${question.correct === 1 ? 'selected' : ''}>الإجابة 2</option>
                        <option value="2" ${question.correct === 2 ? 'selected' : ''}>الإجابة 3</option>
                        <option value="3" ${question.correct === 3 ? 'selected' : ''}>الإجابة 4</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>التصنيف</label>
                    <select id="edit-question-category" class="form-control">
                        ${GameConfig.CATEGORIES.map(cat => 
                            `<option value="${cat.id}" ${question.category === cat.id ? 'selected' : ''}>${cat.name}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
            
            <div class="form-group">
                <label>تلميح</label>
                <input type="text" id="edit-question-hint" class="form-control" value="${question.hint || ''}">
            </div>
            
            <div class="form-group">
                <label>شرح الإجابة</label>
                <textarea id="edit-question-explanation" class="form-control" rows="2">${question.explanation || ''}</textarea>
            </div>
            
            <button id="save-question-btn" class="btn btn-primary" style="width: 100%;">
                <i class="fas fa-save"></i> حفظ التغييرات
            </button>
        `;
        
        this.showModal('تعديل السؤال', modalContent);
        
        document.getElementById('save-question-btn').addEventListener('click', () => {
            // في تطبيق كامل، سيكون هنا كود لحفظ التعديلات
            this.app.ui.showNotification('سيتم إضافة خاصية التعديل في الإصدار القادم', 'info');
            this.closeModal();
        });
    }
    
    // تبويب المستخدمين
    loadUsersTab(container) {
        const users = this.app.auth.getAllUsers();
        
        container.innerHTML = `
            <h2><i class="fas fa-users"></i> إدارة المستخدمين (${users.length})</h2>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0;">
                <div style="background: rgba(52, 152, 219, 0.1); padding: 20px; border-radius: 10px;">
                    <div style="font-size: 2.5rem; color: #3498db; font-weight: bold;">${users.length}</div>
                    <div style="color: #aaa;">إجمالي المستخدمين</div>
                </div>
                
                <div style="background: rgba(46, 204, 113, 0.1); padding: 20px; border-radius: 10px;">
                    <div style="font-size: 2.5rem; color: #2ecc71; font-weight: bold;">${users.filter(u => u.isAdmin).length}</div>
                    <div style="color: #aaa;">المسؤولين</div>
                </div>
                
                <div style="background: rgba(155, 89, 182, 0.1); padding: 20px; border-radius: 10px;">
                    <div style="font-size: 2.5rem; color: #9b59b6; font-weight: bold;">${users.reduce((sum, u) => sum + (u.balance || 0), 0).toLocaleString()}</div>
                    <div style="color: #aaa;">إجمالي الأرصدة</div>
                </div>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr style="background: rgba(212, 175, 55, 0.2);">
                        <th style="padding: 15px; text-align: right;">المستخدم</th>
                        <th style="padding: 15px; text-align: right;">البريد</th>
                        <th style="padding: 15px; text-align: right;">الرصيد</th>
                        <th style="padding: 15px; text-align: right;">المستوى</th>
                        <th style="padding: 15px; text-align: right;">الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <td style="padding: 15px;">
                                <strong>${user.username}</strong>
                                ${user.isAdmin ? '<span style="color: #e74c3c; margin-right: 5px;">👑</span>' : ''}
                                <div style="color: #aaa; font-size: 0.8rem;">
                                    ${new Date(user.createdAt).toLocaleDateString('ar-EG')}
                                </div>
                            </td>
                            <td style="padding: 15px;">${user.email || '-'}</td>
                            <td style="padding: 15px;">
                                <span style="color: #FFD700;">${user.balance.toLocaleString()} $</span>
                                <button onclick="gameApp.updateUserBalance('${user.username}')" style="background: rgba(255,255,255,0.1); border: none; color: white; padding: 5px 10px; border-radius: 5px; margin-right: 10px; cursor: pointer;">
                                    تعديل
                                </button>
                            </td>
                            <td style="padding: 15px;">
                                <span style="background: #3498db; color: white; padding: 3px 10px; border-radius: 15px;">
                                    ${user.stats?.level || 1}
                                </span>
                            </td>
                            <td style="padding: 15px;">
                                ${!user.isAdmin ? `
                                    <button onclick="gameApp.makeAdmin('${user.username}')" style="background: rgba(241, 196, 15, 0.2); border: none; color: #f1c40f; padding: 5px 10px; border-radius: 5px; margin-left: 5px; cursor: pointer;">
                                        <i class="fas fa-user-shield"></i>
                                    </button>
                                ` : ''}
                                <button onclick="gameApp.deleteUser('${user.username}')" style="background: rgba(231, 76, 60, 0.2); border: none; color: #e74c3c; padding: 5px 10px; border-radius: 5px; cursor: pointer;">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    // تبويب المدفوعات
    loadPaymentsTab(container) {
        container.innerHTML = `
            <h2><i class="fas fa-credit-card"></i> إدارة المدفوعات والاشتراكات</h2>
            
            <div style="margin: 30px 0;">
                <h3>خطط الاشتراك</h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px;">
                    <!-- خطة مجانية -->
                    <div style="background: rgba(52, 152, 219, 0.1); padding: 25px; border-radius: 15px; border: 2px solid #3498db;">
                        <h4 style="color: #3498db;">🆓 مجاني</h4>
                        <div style="font-size: 2rem; color: white; margin: 15px 0;">0 $</div>
                        <ul style="list-style: none; padding: 0;">
                            <li style="margin: 10px 0; color: #ddd;"><i class="fas fa-check" style="color: #2ecc71; margin-left: 5px;"></i> لعب غير محدود</li>
                            <li style="margin: 10px 0; color: #ddd;"><i class="fas fa-check" style="color: #2ecc71; margin-left: 5px;"></i> إعلانات بين الأسئلة</li>
                            <li style="margin: 10px 0; color: #777;"><i class="fas fa-times" style="color: #e74c3c; margin-left: 5px;"></i> لا توجد أدوات مجانية</li>
                        </ul>
                        <button class="btn btn-primary" onclick="gameApp.editSubscription('free')" style="width: 100%;">
                            تعديل الخطة
                        </button>
                    </div>
                    
                    <!-- خطة برو -->
                    <div style="background: rgba(212, 175, 55, 0.1); padding: 25px; border-radius: 15px; border: 2px solid #D4AF37;">
                        <h4 style="color: #FFD700;">⭐ برو</h4>
                        <div style="font-size: 2rem; color: white; margin: 15px 0;">9.99 $<span style="font-size: 1rem; color: #aaa;">/شهرياً</span></div>
                        <ul style="list-style: none; padding: 0;">
                            <li style="margin: 10px 0; color: #ddd;"><i class="fas fa-check" style="color: #2ecc71; margin-left: 5px;"></i> لا إعلانات</li>
                            <li style="margin: 10px 0; color: #ddd;"><i class="fas fa-check" style="color: #2ecc71; margin-left: 5px;"></i> 3 أدوات مساعدة مجانية</li>
                            <li style="margin: 10px 0; color: #ddd;"><i class="fas fa-check" style="color: #2ecc71; margin-left: 5px;"></i> إحصائيات متقدمة</li>
                        </ul>
                        <button class="btn btn-primary" onclick="gameApp.editSubscription('pro')" style="width: 100%;">
                            تعديل الخطة
                        </button>
                    </div>
                    
                    <!-- خطة فخمة -->
                    <div style="background: rgba(155, 89, 182, 0.1); padding: 25px; border-radius: 15px; border: 2px solid #9b59b6;">
                        <h4 style="color: #9b59b6;">👑 فخمة</h4>
                        <div style="font-size: 2rem; color: white; margin: 15px 0;">19.99 $<span style="font-size: 1rem; color: #aaa;">/شهرياً</span></div>
                        <ul style="list-style: none; padding: 0;">
                            <li style="margin: 10px 0; color: #ddd;"><i class="fas fa-check" style="color: #2ecc71; margin-left: 5px;"></i> كل مميزات برو</li>
                            <li style="margin: 10px 0; color: #ddd;"><i class="fas fa-check" style="color: #2ecc71; margin-left: 5px;"></i> أدوات مساعدة غير محدودة</li>
                            <li style="margin: 10px 0; color: #ddd;"><i class="fas fa-check" style="color: #2ecc71; margin-left: 5px;"></i> تصنيفات متميزة</li>
                        </ul>
                        <button class="btn btn-primary" onclick="gameApp.editSubscription('premium')" style="width: 100%;">
                            تعديل الخطة
                        </button>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 50px;">
                <h3>سجل المدفوعات</h3>
                <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 10px; margin-top: 20px;">
                    <p style="color: #aaa; text-align: center;">سيكون هنا سجل المدفوعات عند تفعيل بوابة الدفع</p>
                </div>
            </div>
        `;
    }
    
    // تبويب الإحصائيات
    loadStatsTab(container) {
        const users = this.app.auth.getAllUsers();
        const questions = this.app.questions.getAllQuestions();
        
        const stats = {
            totalUsers: users.length,
            totalAdmins: users.filter(u => u.isAdmin).length,
            totalQuestions: questions.length,
            totalGames: users.reduce((sum, u) => sum + (u.stats?.gamesPlayed || 0), 0),
            totalBalance: users.reduce((sum, u) => sum + (u.balance || 0), 0),
            activeToday: users.filter(u => {
                const lastLogin = new Date(u.lastLogin);
                const today = new Date();
                return lastLogin.toDateString() === today.toDateString();
            }).length
        };
        
        container.innerHTML = `
            <h2><i class="fas fa-chart-bar"></i> إحصائيات النظام</h2>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0;">
                <div style="background: rgba(52, 152, 219, 0.1); padding: 20px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 2.5rem; color: #3498db; font-weight: bold;">${stats.totalUsers}</div>
                    <div style="color: #aaa;">المستخدمين</div>
                </div>
                
                <div style="background: rgba(46, 204, 113, 0.1); padding: 20px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 2.5rem; color: #2ecc71; font-weight: bold;">${stats.activeToday}</div>
                    <div style="color: #aaa;">نشطون اليوم</div>
                </div>
                
                <div style="background: rgba(155, 89, 182, 0.1); padding: 20px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 2.5rem; color: #9b59b6; font-weight: bold;">${stats.totalQuestions}</div>
                    <div style="color: #aaa;">الأسئلة</div>
                </div>
                
                <div style="background: rgba(241, 196, 15, 0.1); padding: 20px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 2.5rem; color: #f1c40f; font-weight: bold;">${stats.totalGames}</div>
                    <div style="color: #aaa;">الألعاب</div>
                </div>
            </div>
            
            <div style="margin-top: 40px;">
                <h3>تصدير واستيراد البيانات</h3>
                
                <div style="display: flex; gap: 15px; margin-top: 20px; flex-wrap: wrap;">
                    <button class="btn btn-primary" id="export-data">
                        <i class="fas fa-download"></i> تصدير جميع البيانات
                    </button>
                    
                    <button class="btn btn-secondary" id="import-data">
                        <i class="fas fa-upload"></i> استيراد البيانات
                    </button>
                    
                    <button class="btn btn-danger" id="reset-system">
                        <i class="fas fa-trash"></i> إعادة تعيين النظام
                    </button>
                </div>
                
                <div style="margin-top: 30px; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                    <h4>إنشاء مسؤول جديد</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                        <input type="text" id="new-admin-username" class="form-control" placeholder="اسم المستخدم">
                        <input type="password" id="new-admin-password" class="form-control" placeholder="كلمة المرور">
                    </div>
                    <button class="btn btn-primary" id="create-admin" style="margin-top: 15px;">
                        <i class="fas fa-user-plus"></i> إنشاء مسؤول
                    </button>
                </div>
            </div>
        `;
        
        // أحداث الأزرار
        document.getElementById('export-data')?.addEventListener('click', () => {
            this.exportData();
        });
        
        document.getElementById('create-admin')?.addEventListener('click', () => {
            this.createNewAdmin();
        });
    }
    
    // تصدير البيانات
    exportData() {
        const data = {
            users: this.app.auth.users,
            questions: this.app.questions.categories,
            settings: {
                version: GameConfig.VERSION,
                exportDate: new Date().toISOString()
            }
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `millionaire_backup_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.app.ui.showNotification('تم تصدير البيانات بنجاح', 'success');
    }
    
    // إنشاء مسؤول جديد
    createNewAdmin() {
        const username = document.getElementById('new-admin-username')?.value;
        const password = document.getElementById('new-admin-password')?.value;
        
        if (!username || !password) {
            this.app.ui.showNotification('الرجاء إدخال جميع البيانات', 'error');
            return;
        }
        
        const result = this.app.auth.register(username, password, '', true);
        
        if (result.success) {
            this.app.ui.showNotification('تم إنشاء المسؤول بنجاح', 'success');
            this.loadAdminContent('stats');
        } else {
            this.app.ui.showNotification(result.message, 'error');
        }
    }
    
    // الحصول على لون التصنيف
    getCategoryColor(categoryId) {
        const category = GameConfig.CATEGORIES.find(c => c.id === categoryId);
        return category ? category.color : '#777';
    }
    
    // الحصول على لون الصعوبة
    getDifficultyColor(difficulty) {
        switch(difficulty) {
            case 'easy': return '#27ae60';
            case 'medium': return '#f39c12';
            case 'hard': return '#e74c3c';
            default: return '#777';
        }
    }
    
    // إظهار نافذة منبثقة
    showModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div style="padding: 20px;">${content}</div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // حدث الإغلاق
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        // إغلاق بالنقر خارج النافذة
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    // إغلاق النافذة
    closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
    }
}

// جعلها متاحة عالمياً
if (typeof window !== 'undefined') {
    window.AdminPanel = AdminPanel;
}
