const AIService = require('../../infrastructure/services/AIService');
const UserRepository = require('../../infrastructure/repositories/UserRepository');
const NutritionPlanRepository = require('../../infrastructure/repositories/NutritionPlanRepository');
const AIExerciseProgramRepository = require('../../infrastructure/repositories/AIExerciseProgramRepository');

class AIController {
  constructor() {
    this.aiService = new AIService();
    this.userRepository = new UserRepository();
    this.nutritionPlanRepository = new NutritionPlanRepository();
    this.exerciseProgramRepository = new AIExerciseProgramRepository();
  }

  /**
   * @swagger
   * /api/ai/nutrition-question:
   *   post:
   *     summary: AI ile beslenme sorusu sor
   *     description: Kullanıcının beslenme sorusuna AI ile cevap verir
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - question
   *             properties:
   *               question:
   *                 type: string
   *                 example: "Günde kaç kalori almalıyım?"
   *     responses:
   *       200:
   *         description: AI cevabı
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  async answerQuestion(req, res, next) {
    try {
      const { question } = req.body;
      const userId = req.user.id;

      if (!question || question.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Soru gereklidir',
        });
      }

      // Kullanıcı bilgilerini al
      const user = await this.userRepository.findById(userId);
      const userDetails = await this.userRepository.getUserDetails(userId);

      const userContext = {
        goal: userDetails?.goal || null,
        height: userDetails?.height || null,
        weight: userDetails?.weight || null,
        injuries: userDetails?.injuries || [],
        gender: userDetails?.gender || null,
        age: userDetails?.age ?? null,
      };

      const answer = await this.aiService.answerNutritionQuestion(question, userContext);

      res.status(200).json({
        success: true,
        data: {
          question,
          answer,
        },
      });
    } catch (error) {
      console.error('AI question error:', error);
      next(error);
    }
  }

  /**
   * @swagger
   * /api/ai/nutrition-plan:
   *   post:
   *     summary: AI ile kişiselleştirilmiş haftalık beslenme planı oluştur
   *     description: "Kullanıcı bilgilerine göre 7 günlük beslenme planı oluşturur. Format summary, week (Pazartesi vb. günler)."
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Haftalık beslenme planı (JSON)
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  async generatePlan(req, res, next) {
    try {
      const userId = req.user.id;

      const userDetails = await this.userRepository.getUserDetails(userId);

      const userContext = {
        goal: userDetails?.goal || 'Kilo Koruma',
        height: userDetails?.height || 175,
        weight: userDetails?.weight || 70,
        injuries: userDetails?.injuries || [],
        gender: userDetails?.gender || null,
        age: userDetails?.age ?? null,
      };

      const plan = await this.aiService.generateNutritionPlan(userContext);

      res.status(200).json({
        success: true,
        data: plan,
      });
    } catch (error) {
      console.error('AI plan generation error:', error);
      next(error);
    }
  }

  /**
   * @swagger
   * /api/ai/nutrition-plans:
   *   post:
   *     summary: Beslenme planını kaydet
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [plan]
   *             properties:
   *               plan: { type: object, description: "Haftalık plan: { summary, week }" }
   *               planName: { type: string }
   *     responses:
   *       201:
   *         description: Plan kaydedildi
   *       400:
   *         description: Geçersiz plan
   */
  async saveNutritionPlan(req, res, next) {
    try {
      const userId = req.user.id;
      const { plan, planName } = req.body;

      if (!plan || !plan.week || !plan.summary) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz plan. plan.summary ve plan.week gönderilmeli (haftalık format).',
        });
      }

      const saved = await this.nutritionPlanRepository.create(userId, plan, planName || 'Haftalık Beslenme Planı');

      res.status(201).json({
        success: true,
        message: 'Beslenme planı kaydedildi',
        data: {
          id: saved.id,
          planName: saved.planName,
          planData: saved.planData,
          createdAt: saved.createdAt,
          updatedAt: saved.updatedAt,
        },
      });
    } catch (error) {
      console.error('Save nutrition plan error:', error);
      next(error);
    }
  }

  /**
   * @swagger
   * /api/ai/nutrition-plans:
   *   get:
   *     summary: Kullanıcının kayıtlı beslenme planlarını listele
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema: { type: integer, default: 10 }
   *       - in: query
   *         name: offset
   *         schema: { type: integer, default: 0 }
   *     responses:
   *       200:
   *         description: Plan listesi
   */
  async getNutritionPlans(req, res, next) {
    try {
      const userId = req.user.id;
      const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
      const offset = parseInt(req.query.offset, 10) || 0;

      const plans = await this.nutritionPlanRepository.findByUserId(userId, limit, offset);

      res.status(200).json({
        success: true,
        data: plans,
      });
    } catch (error) {
      console.error('Get nutrition plans error:', error);
      next(error);
    }
  }

  /**
   * @swagger
   * /api/ai/nutrition-plans/{id}:
   *   get:
   *     summary: ID ile beslenme planı getir
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200:
   *         description: Plan detayı
   *       404:
   *         description: Plan bulunamadı
   */
  async getNutritionPlanById(req, res, next) {
    try {
      const userId = req.user.id;
      const planId = parseInt(req.params.id, 10);

      const plan = await this.nutritionPlanRepository.findById(planId);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Beslenme planı bulunamadı',
        });
      }
      if (plan.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Bu plana erişim yetkiniz yok',
        });
      }

      res.status(200).json({
        success: true,
        data: {
          id: plan.id,
          planName: plan.planName,
          planData: plan.planData,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        },
      });
    } catch (error) {
      console.error('Get nutrition plan by id error:', error);
      next(error);
    }
  }

  /**
   * @swagger
   * /api/ai/nutrition-plans/{id}:
   *   put:
   *     summary: Beslenme planını güncelle (düzenle)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               plan: { type: object }
   *               planName: { type: string }
   *     responses:
   *       200:
   *         description: Plan güncellendi
   *       404:
   *         description: Plan bulunamadı
   */
  async updateNutritionPlan(req, res, next) {
    try {
      const userId = req.user.id;
      const planId = parseInt(req.params.id, 10);
      const { plan, planName } = req.body;

      const existing = await this.nutritionPlanRepository.findById(planId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Beslenme planı bulunamadı',
        });
      }
      if (existing.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Bu planı düzenleme yetkiniz yok',
        });
      }

      if (!plan || !plan.week || !plan.summary) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz plan. plan.summary ve plan.week gönderilmeli.',
        });
      }

      const updated = await this.nutritionPlanRepository.update(planId, plan, planName ?? existing.planName);

      res.status(200).json({
        success: true,
        message: 'Beslenme planı güncellendi',
        data: {
          id: updated.id,
          planName: updated.planName,
          planData: updated.planData,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
        },
      });
    } catch (error) {
      console.error('Update nutrition plan error:', error);
      next(error);
    }
  }

  /**
   * @swagger
   * /api/ai/nutrition-plans/{id}:
   *   delete:
   *     summary: Beslenme planını sil
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200:
   *         description: Plan silindi
   *       404:
   *         description: Plan bulunamadı
   */
  async deleteNutritionPlan(req, res, next) {
    try {
      const userId = req.user.id;
      const planId = parseInt(req.params.id, 10);

      const existing = await this.nutritionPlanRepository.findById(planId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Beslenme planı bulunamadı',
        });
      }
      if (existing.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Bu planı silme yetkiniz yok',
        });
      }

      await this.nutritionPlanRepository.delete(planId);

      res.status(200).json({
        success: true,
        message: 'Beslenme planı silindi',
      });
    } catch (error) {
      console.error('Delete nutrition plan error:', error);
      next(error);
    }
  }

  /**
   * @swagger
   * /api/ai/food-suggestions:
   *   post:
   *     summary: AI ile yemek önerileri al
   *     description: Kriterlere göre yemek önerileri getirir
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - criteria
   *             properties:
   *               criteria:
   *                 type: string
   *                 example: "yüksek protein, düşük kalori"
   *     responses:
   *       200:
   *         description: Yemek önerileri listesi
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  async suggestFoods(req, res, next) {
    try {
      const { criteria } = req.body;
      const userId = req.user.id;

      if (!criteria || criteria.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Kriter gereklidir',
        });
      }

      // Kullanıcı bilgilerini al
      const userDetails = await this.userRepository.getUserDetails(userId);

      const userContext = {
        goal: userDetails?.goal || null,
        injuries: userDetails?.injuries || [],
        gender: userDetails?.gender || null,
        age: userDetails?.age ?? null,
      };

      const foods = await this.aiService.suggestFoods(criteria, userContext);

      res.status(200).json({
        success: true,
        data: {
          criteria,
          foods,
        },
      });
    } catch (error) {
      console.error('AI food suggestions error:', error);
      next(error);
    }
  }

  /**
   * @swagger
   * /api/ai/exercise-program:
   *   post:
   *     summary: AI ile kişiselleştirilmiş egzersiz programı oluştur
   *     description: Kullanıcı bilgilerine göre özel egzersiz programı oluşturur
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               difficulty:
   *                 type: string
   *                 example: "beginner"
   *               daysPerWeek:
   *                 type: number
   *                 example: 3
   *     responses:
   *       200:
   *         description: Egzersiz programı
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  async generateExerciseProgram(req, res, next) {
    try {
      const userId = req.user.id;
      const { difficulty = 'beginner', daysPerWeek = 3, survey = {} } = req.body;

      const userDetails = await this.userRepository.getUserDetails(userId);

      const userContext = {
        height: userDetails?.height || null,
        weight: userDetails?.weight || null,
        age: userDetails?.age ?? (userDetails?.dateOfBirth 
          ? new Date().getFullYear() - new Date(userDetails.dateOfBirth).getFullYear()
          : null),
        goal: userDetails?.goal || 'Genel Fitness',
        injuries: userDetails?.injuries || [],
        gender: userDetails?.gender || null,
      };

      const programConfig = {
        difficulty,
        daysPerWeek,
        survey: {
          place: survey.place || null,           // Ev / Salon / Her ikisi
          equipment: survey.equipment || null,  // Vücut ağırlığı / Dambıl / Makine / Tam ekipman
          focus: survey.focus || null,          // Güç / Kas kütlesi / Dayanıklılık / Genel form
          duration: survey.duration || null,    // 30-45 dk / 45-60 dk / 60-90 dk
        },
      };

      const program = await this.aiService.generateExerciseProgram(userContext, programConfig);

      const savedProgram = await this.exerciseProgramRepository.create(userId, program, `AI Program - ${difficulty}`);

      res.status(200).json({
        success: true,
        data: {
          id: savedProgram.id,
          program: program,
          programName: savedProgram.programName,
        },
      });
    } catch (error) {
      console.error('AI exercise program generation error:', error);
      next(error);
    }
  }

  /**
   * Egzersiz programını kaydet (manuel kaydet / farklı kaydet)
   */
  async saveExerciseProgram(req, res, next) {
    try {
      const userId = req.user.id;
      const { program, programName } = req.body;

      if (!program || !program.weeklySchedule) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz program. program.weeklySchedule gönderilmeli.',
        });
      }

      const saved = await this.exerciseProgramRepository.create(
        userId,
        program,
        programName || 'Egzersiz Programı'
      );

      res.status(201).json({
        success: true,
        message: 'Egzersiz programı kaydedildi',
        data: {
          id: saved.id,
          programName: saved.programName,
          programData: saved.programData,
          createdAt: saved.createdAt,
          updatedAt: saved.updatedAt,
        },
      });
    } catch (error) {
      console.error('Save exercise program error:', error);
      next(error);
    }
  }

  /**
   * Kullanıcının kayıtlı egzersiz programlarını listele
   */
  async getExercisePrograms(req, res, next) {
    try {
      const userId = req.user.id;
      const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
      const offset = parseInt(req.query.offset, 10) || 0;

      const programs = await this.exerciseProgramRepository.findByUserId(userId, limit, offset);

      res.status(200).json({
        success: true,
        data: programs,
      });
    } catch (error) {
      console.error('Get exercise programs error:', error);
      next(error);
    }
  }

  /**
   * ID ile egzersiz programı getir
   */
  async getExerciseProgramById(req, res, next) {
    try {
      const userId = req.user.id;
      const programId = parseInt(req.params.id, 10);

      const plan = await this.exerciseProgramRepository.findById(programId);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Egzersiz programı bulunamadı',
        });
      }
      if (plan.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Bu programa erişim yetkiniz yok',
        });
      }

      res.status(200).json({
        success: true,
        data: {
          id: plan.id,
          programName: plan.programName,
          programData: plan.programData,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        },
      });
    } catch (error) {
      console.error('Get exercise program by id error:', error);
      next(error);
    }
  }

  /**
   * Egzersiz programını güncelle
   */
  async updateExerciseProgram(req, res, next) {
    try {
      const userId = req.user.id;
      const programId = parseInt(req.params.id, 10);
      const { program, programName } = req.body;

      const existing = await this.exerciseProgramRepository.findById(programId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Egzersiz programı bulunamadı',
        });
      }
      if (existing.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Bu programı düzenleme yetkiniz yok',
        });
      }

      if (!program || !program.weeklySchedule) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz program. program.weeklySchedule gönderilmeli.',
        });
      }

      const updated = await this.exerciseProgramRepository.update(
        programId,
        program,
        programName ?? existing.programName
      );

      res.status(200).json({
        success: true,
        message: 'Egzersiz programı güncellendi',
        data: {
          id: updated.id,
          programName: updated.programName,
          programData: updated.programData,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
        },
      });
    } catch (error) {
      console.error('Update exercise program error:', error);
      next(error);
    }
  }

  /**
   * Egzersiz programını sil
   */
  async deleteExerciseProgram(req, res, next) {
    try {
      const userId = req.user.id;
      const programId = parseInt(req.params.id, 10);

      const existing = await this.exerciseProgramRepository.findById(programId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Egzersiz programı bulunamadı',
        });
      }
      if (existing.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Bu programı silme yetkiniz yok',
        });
      }

      await this.exerciseProgramRepository.delete(programId);

      res.status(200).json({
        success: true,
        message: 'Egzersiz programı silindi',
      });
    } catch (error) {
      console.error('Delete exercise program error:', error);
      next(error);
    }
  }
}

module.exports = AIController;

