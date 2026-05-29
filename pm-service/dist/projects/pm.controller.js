"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PmDashboardController = exports.DashboardController = exports.MeetingsController = exports.RisksController = exports.ChangeRequestsController = exports.BudgetController = exports.MilestonesController = exports.ResourcesController = exports.TaskCommentsController = exports.TaskDocumentsController = exports.TasksController = exports.StagesController = exports.ProjectsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const auth_guard_1 = require("../auth.guard");
const pm_entities_1 = require("../pm.entities");
const path = require("path");
const fs = require("fs");
let ProjectsController = class ProjectsController {
    constructor(repo) {
        this.repo = repo;
    }
    async getAll(u, q) {
        const page = parseInt(q.page) || 1;
        const limit = parseInt(q.limit) || 20;
        const qb = this.repo.createQueryBuilder('p')
            .where('p.tenantId = :tid AND p.isActive = true', { tid: u.tenantId });
        if (q.search)
            qb.andWhere('(p.projectName ILIKE :s OR p.clientName ILIKE :s OR p.awardedByName ILIKE :s)', { s: `%${q.search}%` });
        if (q.status)
            qb.andWhere('p.status = :status', { status: q.status });
        const total = await qb.getCount();
        const data = await qb.skip((page - 1) * limit).take(limit).orderBy('p.createdAt', 'DESC').getMany();
        return { data, total, page, limit };
    }
    async getOne(u, id) {
        return this.repo.findOne({ where: { projectId: id, tenantId: u.tenantId } });
    }
    async create(u, body) {
        const count = await this.repo.count({ where: { tenantId: u.tenantId } });
        const projectNumber = `PROJ-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
        return this.repo.save(this.repo.create({ ...body, tenantId: u.tenantId, projectNumber, createdBy: u.userId }));
    }
    async update(u, id, body) {
        await this.repo.update({ projectId: id, tenantId: u.tenantId }, body);
        return this.repo.findOne({ where: { projectId: id } });
    }
    async remove(u, id) {
        await this.repo.update({ projectId: id, tenantId: u.tenantId }, { isActive: false });
        return { message: 'Project deleted' };
    }
};
exports.ProjectsController = ProjectsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "remove", null);
exports.ProjectsController = ProjectsController = __decorate([
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('pm/projects'),
    __param(0, (0, typeorm_1.InjectRepository)(pm_entities_1.ProjectEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProjectsController);
let StagesController = class StagesController {
    constructor(repo, taskRepo, projectRepo) {
        this.repo = repo;
        this.taskRepo = taskRepo;
        this.projectRepo = projectRepo;
    }
    async getAll(u, q) {
        const qb = this.repo.createQueryBuilder('s')
            .where('s.tenantId = :tid AND s.isActive = true', { tid: u.tenantId });
        if (q.projectId)
            qb.andWhere('s.projectId = :pid', { pid: q.projectId });
        return qb.orderBy('s.orderIndex', 'ASC').getMany();
    }
    async create(u, body) {
        const count = await this.repo.count({ where: { projectId: body.projectId, tenantId: u.tenantId } });
        return this.repo.save(this.repo.create({ ...body, tenantId: u.tenantId, orderIndex: body.orderIndex ?? count, createdBy: u.userId }));
    }
    async update(u, id, body) {
        await this.repo.update({ stageId: id, tenantId: u.tenantId }, body);
        await this.recalcProjectProgress(u.tenantId, body.projectId);
        return this.repo.findOne({ where: { stageId: id } });
    }
    async remove(u, id) {
        const stage = await this.repo.findOne({ where: { stageId: id } });
        await this.repo.update({ stageId: id, tenantId: u.tenantId }, { isActive: false });
        if (stage)
            await this.recalcProjectProgress(u.tenantId, stage.projectId);
        return { message: 'Stage deleted' };
    }
    async reorder(u, body) {
        for (const s of body.stages) {
            await this.repo.update({ stageId: s.stageId, tenantId: u.tenantId }, { orderIndex: s.orderIndex });
        }
        return { message: 'Reordered' };
    }
    async recalcProjectProgress(tenantId, projectId) {
        if (!projectId)
            return;
        const stages = await this.repo.find({ where: { projectId, tenantId, isActive: true } });
        if (!stages.length)
            return;
        const avg = stages.reduce((sum, s) => sum + Number(s.progress), 0) / stages.length;
        await this.projectRepo.update({ projectId }, { progress: Math.round(avg * 100) / 100 });
    }
};
exports.StagesController = StagesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StagesController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StagesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], StagesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StagesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('reorder'),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StagesController.prototype, "reorder", null);
exports.StagesController = StagesController = __decorate([
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('pm/stages'),
    __param(0, (0, typeorm_1.InjectRepository)(pm_entities_1.StageEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(pm_entities_1.TaskEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(pm_entities_1.ProjectEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StagesController);
let TasksController = class TasksController {
    constructor(repo, stageRepo, projectRepo) {
        this.repo = repo;
        this.stageRepo = stageRepo;
        this.projectRepo = projectRepo;
    }
    async getAll(u, q) {
        const qb = this.repo.createQueryBuilder('t')
            .where('t.tenantId = :tid AND t.isActive = true', { tid: u.tenantId });
        if (q.projectId)
            qb.andWhere('t.projectId = :pid', { pid: q.projectId });
        if (q.stageId)
            qb.andWhere('t.stageId = :sid', { sid: q.stageId });
        if (q.assignedTo)
            qb.andWhere('t.assignedTo = :uid', { uid: q.assignedTo });
        if (q.parentTaskId === 'null')
            qb.andWhere('t.parentTaskId IS NULL');
        else if (q.parentTaskId)
            qb.andWhere('t.parentTaskId = :ptid', { ptid: q.parentTaskId });
        if (q.status)
            qb.andWhere('t.status = :status', { status: q.status });
        return qb.orderBy('t.orderIndex', 'ASC').addOrderBy('t.createdAt', 'ASC').getMany();
    }
    async getOne(u, id) {
        return this.repo.findOne({ where: { taskId: id, tenantId: u.tenantId } });
    }
    async create(u, body) {
        const count = await this.repo.count({ where: { projectId: body.projectId, tenantId: u.tenantId } });
        const taskNumber = `TASK-${String(count + 1).padStart(4, '0')}`;
        return this.repo.save(this.repo.create({ ...body, tenantId: u.tenantId, taskNumber, createdBy: u.userId }));
    }
    async update(u, id, body) {
        const task = await this.repo.findOne({ where: { taskId: id } });
        if (task && body.assignedTo && body.assignedTo !== task.assignedTo) {
            const log = task.reassignLog || [];
            log.push({ from: task.assignedTo, fromName: task.assignedToName, to: body.assignedTo, toName: body.assignedToName, reason: body.reassignReason || '', at: new Date() });
            body.reassignLog = log;
        }
        if (body.status === 'DONE' && !task?.completedDate)
            body.completedDate = new Date();
        await this.repo.update({ taskId: id, tenantId: u.tenantId }, body);
        if (task?.stageId)
            await this.recalcStageProgress(u.tenantId, task.stageId, task.projectId);
        return this.repo.findOne({ where: { taskId: id } });
    }
    async remove(u, id) {
        const task = await this.repo.findOne({ where: { taskId: id } });
        await this.repo.update({ taskId: id, tenantId: u.tenantId }, { isActive: false });
        if (task?.stageId)
            await this.recalcStageProgress(u.tenantId, task.stageId, task.projectId);
        return { message: 'Task deleted' };
    }
    async recalcStageProgress(tenantId, stageId, projectId) {
        const tasks = await this.repo.find({ where: { stageId, tenantId, isActive: true, parentTaskId: (0, typeorm_2.IsNull)() } });
        if (!tasks.length)
            return;
        const done = tasks.filter(t => t.status === 'DONE').length;
        const progress = Math.round((done / tasks.length) * 100);
        await this.stageRepo.update({ stageId }, { progress });
        const stages = await this.stageRepo.find({ where: { projectId, tenantId, isActive: true } });
        if (stages.length) {
            const avg = stages.reduce((s, st) => s + Number(st.progress), 0) / stages.length;
            await this.projectRepo.update({ projectId }, { progress: Math.round(avg * 100) / 100 });
        }
    }
};
exports.TasksController = TasksController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "remove", null);
exports.TasksController = TasksController = __decorate([
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('pm/tasks'),
    __param(0, (0, typeorm_1.InjectRepository)(pm_entities_1.TaskEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(pm_entities_1.StageEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(pm_entities_1.ProjectEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TasksController);
let TaskDocumentsController = class TaskDocumentsController {
    constructor(repo) {
        this.repo = repo;
    }
    async getAll(u, q) {
        const qb = this.repo.createQueryBuilder('d').where('d.tenantId = :tid', { tid: u.tenantId });
        if (q.taskId)
            qb.andWhere('d.taskId = :taskId', { taskId: q.taskId });
        return qb.orderBy('d.createdAt', 'DESC').getMany();
    }
    async upload(u, file, body) {
        if (!file)
            throw new Error('No file uploaded');
        return this.repo.save(this.repo.create({
            tenantId: u.tenantId, taskId: body.taskId, projectId: body.projectId,
            fileName: file.originalname, filePath: file.path,
            fileSize: file.size, mimeType: file.mimetype,
            uploadedBy: u.userId, uploadedByName: u.fullName || u.email,
        }));
    }
    async remove(u, id) {
        const doc = await this.repo.findOne({ where: { docId: id, tenantId: u.tenantId } });
        if (doc) {
            try {
                fs.unlinkSync(doc.filePath);
            }
            catch { }
            await this.repo.delete(id);
        }
        return { message: 'Deleted' };
    }
};
exports.TaskDocumentsController = TaskDocumentsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TaskDocumentsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const dir = `/app/uploads/tasks/${req.body.taskId || 'general'}`;
                fs.mkdirSync(dir, { recursive: true });
                cb(null, dir);
            },
            filename: (req, file, cb) => {
                const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
                cb(null, unique + path.extname(file.originalname));
            },
        }),
        limits: { fileSize: 20 * 1024 * 1024 },
    })),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], TaskDocumentsController.prototype, "upload", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TaskDocumentsController.prototype, "remove", null);
exports.TaskDocumentsController = TaskDocumentsController = __decorate([
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('pm/task-documents'),
    __param(0, (0, typeorm_1.InjectRepository)(pm_entities_1.TaskDocumentEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TaskDocumentsController);
let TaskCommentsController = class TaskCommentsController {
    constructor(repo) {
        this.repo = repo;
    }
    async getAll(u, q) {
        const qb = this.repo.createQueryBuilder('c').where('c.tenantId = :tid', { tid: u.tenantId });
        if (q.taskId)
            qb.andWhere('c.taskId = :taskId', { taskId: q.taskId });
        return qb.orderBy('c.createdAt', 'ASC').getMany();
    }
    async create(u, body) {
        return this.repo.save(this.repo.create({ ...body, tenantId: u.tenantId, createdBy: u.userId, createdByName: u.fullName || u.email }));
    }
    async remove(u, id) {
        await this.repo.delete({ commentId: id, tenantId: u.tenantId });
        return { message: 'Deleted' };
    }
};
exports.TaskCommentsController = TaskCommentsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TaskCommentsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TaskCommentsController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TaskCommentsController.prototype, "remove", null);
exports.TaskCommentsController = TaskCommentsController = __decorate([
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('pm/task-comments'),
    __param(0, (0, typeorm_1.InjectRepository)(pm_entities_1.TaskCommentEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TaskCommentsController);
let ResourcesController = class ResourcesController {
    constructor(repo) {
        this.repo = repo;
    }
    async getAll(u, q) {
        const qb = this.repo.createQueryBuilder('r').where('r.tenantId = :tid AND r.isActive = true', { tid: u.tenantId });
        if (q.projectId)
            qb.andWhere('r.projectId = :pid', { pid: q.projectId });
        return qb.orderBy('r.createdAt', 'ASC').getMany();
    }
    async create(u, body) {
        return this.repo.save(this.repo.create({ ...body, tenantId: u.tenantId, createdBy: u.userId }));
    }
    async update(u, id, body) {
        await this.repo.update({ resourceId: id, tenantId: u.tenantId }, body);
        return this.repo.findOne({ where: { resourceId: id } });
    }
    async remove(u, id) {
        await this.repo.update({ resourceId: id, tenantId: u.tenantId }, { isActive: false });
        return { message: 'Deleted' };
    }
};
exports.ResourcesController = ResourcesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ResourcesController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ResourcesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ResourcesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ResourcesController.prototype, "remove", null);
exports.ResourcesController = ResourcesController = __decorate([
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('pm/resources'),
    __param(0, (0, typeorm_1.InjectRepository)(pm_entities_1.ResourceEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ResourcesController);
let MilestonesController = class MilestonesController {
    constructor(repo) {
        this.repo = repo;
    }
    async getAll(u, q) {
        const qb = this.repo.createQueryBuilder('m').where('m.tenantId = :tid AND m.isActive = true', { tid: u.tenantId });
        if (q.projectId)
            qb.andWhere('m.projectId = :pid', { pid: q.projectId });
        return qb.orderBy('m.orderIndex', 'ASC').getMany();
    }
    async create(u, body) {
        const count = await this.repo.count({ where: { projectId: body.projectId, tenantId: u.tenantId } });
        return this.repo.save(this.repo.create({ ...body, tenantId: u.tenantId, orderIndex: count, createdBy: u.userId }));
    }
    async update(u, id, body) {
        await this.repo.update({ milestoneId: id, tenantId: u.tenantId }, body);
        return this.repo.findOne({ where: { milestoneId: id } });
    }
    async remove(u, id) {
        await this.repo.update({ milestoneId: id, tenantId: u.tenantId }, { isActive: false });
        return { message: 'Deleted' };
    }
};
exports.MilestonesController = MilestonesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MilestonesController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MilestonesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], MilestonesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MilestonesController.prototype, "remove", null);
exports.MilestonesController = MilestonesController = __decorate([
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('pm/milestones'),
    __param(0, (0, typeorm_1.InjectRepository)(pm_entities_1.MilestoneEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MilestonesController);
let BudgetController = class BudgetController {
    constructor(repo, projectRepo) {
        this.repo = repo;
        this.projectRepo = projectRepo;
    }
    async getAll(u, q) {
        const qb = this.repo.createQueryBuilder('b').where('b.tenantId = :tid', { tid: u.tenantId });
        if (q.projectId)
            qb.andWhere('b.projectId = :pid', { pid: q.projectId });
        if (q.entryType)
            qb.andWhere('b.entryType = :type', { type: q.entryType });
        return qb.orderBy('b.createdAt', 'DESC').getMany();
    }
    async getSummary(u, projectId) {
        const project = await this.projectRepo.findOne({ where: { projectId, tenantId: u.tenantId } });
        const entries = await this.repo.find({ where: { projectId, tenantId: u.tenantId } });
        const planned = entries.filter(e => e.entryType === 'PLANNED').reduce((s, e) => s + Number(e.amount), 0);
        const actual = entries.filter(e => e.entryType === 'ACTUAL').reduce((s, e) => s + Number(e.amount), 0);
        const budget = Number(project?.plannedBudget || 0);
        return {
            plannedBudget: budget, plannedCost: planned, actualCost: actual,
            variance: budget - actual,
            variancePercent: budget ? Math.round(((budget - actual) / budget) * 100) : 0,
            isOverBudget: actual > budget,
        };
    }
    async create(u, body) {
        const entry = await this.repo.save(this.repo.create({ ...body, tenantId: u.tenantId, createdBy: u.userId }));
        const entries = await this.repo.find({ where: { projectId: body.projectId, tenantId: u.tenantId, entryType: 'ACTUAL' } });
        const total = entries.reduce((s, e) => s + Number(e.amount), 0);
        await this.projectRepo.update({ projectId: body.projectId }, { actualCost: total });
        return entry;
    }
    async remove(u, id) {
        const entry = await this.repo.findOne({ where: { entryId: id, tenantId: u.tenantId } });
        await this.repo.delete({ entryId: id, tenantId: u.tenantId });
        if (entry) {
            const entries = await this.repo.find({ where: { projectId: entry.projectId, tenantId: u.tenantId, entryType: 'ACTUAL' } });
            const total = entries.reduce((s, e) => s + Number(e.amount), 0);
            await this.projectRepo.update({ projectId: entry.projectId }, { actualCost: total });
        }
        return { message: 'Deleted' };
    }
};
exports.BudgetController = BudgetController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BudgetController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('summary/:projectId'),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BudgetController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BudgetController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BudgetController.prototype, "remove", null);
exports.BudgetController = BudgetController = __decorate([
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('pm/budget'),
    __param(0, (0, typeorm_1.InjectRepository)(pm_entities_1.BudgetEntryEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(pm_entities_1.ProjectEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], BudgetController);
let ChangeRequestsController = class ChangeRequestsController {
    constructor(repo) {
        this.repo = repo;
    }
    async getAll(u, q) {
        const qb = this.repo.createQueryBuilder('cr').where('cr.tenantId = :tid AND cr.isActive = true', { tid: u.tenantId });
        if (q.projectId)
            qb.andWhere('cr.projectId = :pid', { pid: q.projectId });
        if (q.status)
            qb.andWhere('cr.status = :status', { status: q.status });
        return qb.orderBy('cr.createdAt', 'DESC').getMany();
    }
    async create(u, body) {
        const count = await this.repo.count({ where: { projectId: body.projectId, tenantId: u.tenantId } });
        const crNumber = `CR-${String(count + 1).padStart(3, '0')}`;
        return this.repo.save(this.repo.create({ ...body, tenantId: u.tenantId, crNumber, requestedBy: u.userId, requestedByName: u.fullName || u.email, createdBy: u.userId }));
    }
    async update(u, id, body) {
        if (body.status && body.status !== 'PENDING') {
            body.reviewedBy = u.userId;
            body.reviewedByName = u.fullName || u.email;
            body.reviewDate = new Date();
        }
        await this.repo.update({ crId: id, tenantId: u.tenantId }, body);
        return this.repo.findOne({ where: { crId: id } });
    }
    async remove(u, id) {
        await this.repo.update({ crId: id, tenantId: u.tenantId }, { isActive: false });
        return { message: 'Deleted' };
    }
};
exports.ChangeRequestsController = ChangeRequestsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChangeRequestsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChangeRequestsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ChangeRequestsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChangeRequestsController.prototype, "remove", null);
exports.ChangeRequestsController = ChangeRequestsController = __decorate([
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('pm/change-requests'),
    __param(0, (0, typeorm_1.InjectRepository)(pm_entities_1.ChangeRequestEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ChangeRequestsController);
let RisksController = class RisksController {
    constructor(repo) {
        this.repo = repo;
    }
    async getAll(u, q) {
        const qb = this.repo.createQueryBuilder('r').where('r.tenantId = :tid AND r.isActive = true', { tid: u.tenantId });
        if (q.projectId)
            qb.andWhere('r.projectId = :pid', { pid: q.projectId });
        return qb.orderBy('r.riskScore', 'DESC').getMany();
    }
    async create(u, body) {
        const scores = { LOW: 1, MEDIUM: 2, HIGH: 3 };
        body.riskScore = (scores[body.likelihood] || 1) * (scores[body.impact] || 1);
        return this.repo.save(this.repo.create({ ...body, tenantId: u.tenantId, createdBy: u.userId }));
    }
    async update(u, id, body) {
        const scores = { LOW: 1, MEDIUM: 2, HIGH: 3 };
        if (body.likelihood || body.impact) {
            const existing = await this.repo.findOne({ where: { riskId: id } });
            const l = body.likelihood || existing?.likelihood || 'MEDIUM';
            const i = body.impact || existing?.impact || 'MEDIUM';
            body.riskScore = scores[l] * scores[i];
        }
        await this.repo.update({ riskId: id, tenantId: u.tenantId }, body);
        return this.repo.findOne({ where: { riskId: id } });
    }
    async remove(u, id) {
        await this.repo.update({ riskId: id, tenantId: u.tenantId }, { isActive: false });
        return { message: 'Deleted' };
    }
};
exports.RisksController = RisksController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RisksController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RisksController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], RisksController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RisksController.prototype, "remove", null);
exports.RisksController = RisksController = __decorate([
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('pm/risks'),
    __param(0, (0, typeorm_1.InjectRepository)(pm_entities_1.RiskEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RisksController);
let MeetingsController = class MeetingsController {
    constructor(repo) {
        this.repo = repo;
    }
    async getAll(u, q) {
        const qb = this.repo.createQueryBuilder('m').where('m.tenantId = :tid', { tid: u.tenantId });
        if (q.projectId)
            qb.andWhere('m.projectId = :pid', { pid: q.projectId });
        return qb.orderBy('m.meetingDate', 'DESC').getMany();
    }
    async create(u, body) {
        return this.repo.save(this.repo.create({ ...body, tenantId: u.tenantId, createdBy: u.userId, createdByName: u.fullName || u.email }));
    }
    async update(u, id, body) {
        await this.repo.update({ meetingId: id, tenantId: u.tenantId }, body);
        return this.repo.findOne({ where: { meetingId: id } });
    }
    async remove(u, id) {
        await this.repo.delete({ meetingId: id, tenantId: u.tenantId });
        return { message: 'Deleted' };
    }
};
exports.MeetingsController = MeetingsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MeetingsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MeetingsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], MeetingsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MeetingsController.prototype, "remove", null);
exports.MeetingsController = MeetingsController = __decorate([
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('pm/meetings'),
    __param(0, (0, typeorm_1.InjectRepository)(pm_entities_1.MeetingEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MeetingsController);
let DashboardController = class DashboardController {
    constructor(projectRepo, taskRepo, milestoneRepo, crRepo, riskRepo) {
        this.projectRepo = projectRepo;
        this.taskRepo = taskRepo;
        this.milestoneRepo = milestoneRepo;
        this.crRepo = crRepo;
        this.riskRepo = riskRepo;
    }
    async getDashboard(u) {
        const tid = u.tenantId;
        const now = new Date();
        const [projects, tasks, milestones, changeRequests, risks] = await Promise.all([
            this.projectRepo.find({ where: { tenantId: tid, isActive: true } }),
            this.taskRepo.find({ where: { tenantId: tid, isActive: true } }),
            this.milestoneRepo.find({ where: { tenantId: tid, isActive: true } }),
            this.crRepo.find({ where: { tenantId: tid, isActive: true } }),
            this.riskRepo.find({ where: { tenantId: tid, isActive: true } }),
        ]);
        const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE');
        const upcomingMilestones = milestones.filter(m => m.dueDate && new Date(m.dueDate) >= now && m.status === 'PENDING').slice(0, 5);
        return {
            summary: {
                totalProjects: projects.length,
                activeProjects: projects.filter(p => p.status === 'ACTIVE').length,
                completedProjects: projects.filter(p => p.status === 'COMPLETED').length,
                totalTasks: tasks.length,
                doneTasks: tasks.filter(t => t.status === 'DONE').length,
                overdueTasks: overdueTasks.length,
                pendingMilestones: milestones.filter(m => m.status === 'PENDING').length,
                pendingCRs: changeRequests.filter(cr => cr.status === 'PENDING').length,
                highRisks: risks.filter(r => r.riskScore >= 6 && r.status === 'OPEN').length,
            },
            recentProjects: projects.slice(0, 5),
            overdueTasks: overdueTasks.slice(0, 10),
            upcomingMilestones,
            pendingCRs: changeRequests.filter(cr => cr.status === 'PENDING').slice(0, 5),
            highRisks: risks.filter(r => r.riskScore >= 6 && r.status === 'OPEN').slice(0, 5),
        };
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getDashboard", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('pm/dashboard'),
    __param(0, (0, typeorm_1.InjectRepository)(pm_entities_1.ProjectEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(pm_entities_1.TaskEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(pm_entities_1.MilestoneEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(pm_entities_1.ChangeRequestEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(pm_entities_1.RiskEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DashboardController);
let PmDashboardController = class PmDashboardController {
    constructor(projectRepo, taskRepo, milestoneRepo, riskRepo, budgetRepo, resourceRepo) {
        this.projectRepo = projectRepo;
        this.taskRepo = taskRepo;
        this.milestoneRepo = milestoneRepo;
        this.riskRepo = riskRepo;
        this.budgetRepo = budgetRepo;
        this.resourceRepo = resourceRepo;
    }
    async getDashboard(u) {
        const tid = u.tenantId;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const totalProjects = await this.projectRepo.count({ where: { tenantId: tid, isActive: true } });
        const activeProjects = await this.projectRepo.createQueryBuilder('p')
            .where('p.tenantId = :tid AND p.isActive = true AND p.status IN (:...s)', { tid, s: ['ACTIVE', 'IN_PROGRESS', 'ON_HOLD', 'PLANNING'] })
            .getCount();
        const completedProjects = await this.projectRepo.createQueryBuilder('p')
            .where('p.tenantId = :tid AND p.status = :s', { tid, s: 'COMPLETED' })
            .getCount();
        const atRiskProjects = await this.projectRepo.createQueryBuilder('p')
            .where('p.tenantId = :tid AND p.isActive = true AND p.health IN (:...h)', { tid, h: ['YELLOW', 'RED', 'AT_RISK'] })
            .getCount();
        const projectsByStatus = await this.projectRepo.createQueryBuilder('p')
            .select('p.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .where('p.tenantId = :tid AND p.isActive = true', { tid })
            .groupBy('p.status')
            .getRawMany();
        const projectsByHealth = await this.projectRepo.createQueryBuilder('p')
            .select('p.health', 'health')
            .addSelect('COUNT(*)', 'count')
            .where('p.tenantId = :tid AND p.isActive = true', { tid })
            .groupBy('p.health')
            .getRawMany();
        const budgetResult = await this.projectRepo.createQueryBuilder('p')
            .select('SUM(p.budget)', 'totalBudget')
            .addSelect('SUM(p.actualCost)', 'totalActual')
            .where('p.tenantId = :tid AND p.isActive = true', { tid })
            .getRawOne();
        const recentProjects = await this.projectRepo.createQueryBuilder('p')
            .where('p.tenantId = :tid AND p.isActive = true', { tid })
            .orderBy('p.createdAt', 'DESC')
            .limit(5)
            .getMany();
        const totalTasks = await this.taskRepo.count({ where: { tenantId: tid } });
        const completedTasks = await this.taskRepo.createQueryBuilder('t')
            .where('t.tenantId = :tid AND t.status = :s', { tid, s: 'DONE' })
            .getCount();
        const overdueTasks = await this.taskRepo.createQueryBuilder('t')
            .where('t.tenantId = :tid AND t.dueDate < :now AND t.status NOT IN (:...s)', { tid, now, s: ['DONE', 'CANCELLED'] })
            .getCount();
        const tasksDueToday = await this.taskRepo.createQueryBuilder('t')
            .where('t.tenantId = :tid AND DATE(t.dueDate) = CURRENT_DATE AND t.status NOT IN (:...s)', { tid, s: ['DONE', 'CANCELLED'] })
            .getCount();
        const tasksByStatus = await this.taskRepo.createQueryBuilder('t')
            .select('t.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .where('t.tenantId = :tid', { tid })
            .groupBy('t.status')
            .getRawMany();
        const totalMilestones = await this.milestoneRepo.count({ where: { tenantId: tid } });
        const completedMilestones = await this.milestoneRepo.createQueryBuilder('m')
            .where('m.tenantId = :tid AND m.status = :s', { tid, s: 'COMPLETED' })
            .getCount();
        const overdueMilestones = await this.milestoneRepo.createQueryBuilder('m')
            .where('m.tenantId = :tid AND m.dueDate < :now AND m.status != :s', { tid, now, s: 'COMPLETED' })
            .getCount();
        const totalRisks = await this.riskRepo.count({ where: { tenantId: tid } });
        const highRisks = await this.riskRepo.createQueryBuilder('r')
            .where('r.tenantId = :tid AND r.impact IN (:...s)', { tid, s: ['HIGH', 'CRITICAL', 'VERY_HIGH'] })
            .getCount();
        const risksBySeverity = await this.riskRepo.createQueryBuilder('r')
            .select('r.impact', 'severity')
            .addSelect('COUNT(*)', 'count')
            .where('r.tenantId = :tid', { tid })
            .groupBy('r.impact')
            .getRawMany();
        const totalResources = await this.resourceRepo.count({ where: { tenantId: tid } });
        return {
            projects: {
                total: totalProjects,
                active: activeProjects,
                completed: completedProjects,
                atRisk: atRiskProjects,
                byStatus: projectsByStatus,
                byHealth: projectsByHealth,
                budget: {
                    total: Number(budgetResult?.totalBudget || 0),
                    actual: Number(budgetResult?.totalActual || 0),
                },
                recent: recentProjects,
            },
            tasks: {
                total: totalTasks,
                completed: completedTasks,
                overdue: overdueTasks,
                dueToday: tasksDueToday,
                completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
                byStatus: tasksByStatus,
            },
            milestones: {
                total: totalMilestones,
                completed: completedMilestones,
                overdue: overdueMilestones,
            },
            risks: {
                total: totalRisks,
                high: highRisks,
                bySeverity: risksBySeverity,
            },
            resources: {
                total: totalResources,
            },
        };
    }
};
exports.PmDashboardController = PmDashboardController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, auth_guard_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PmDashboardController.prototype, "getDashboard", null);
exports.PmDashboardController = PmDashboardController = __decorate([
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('pm/dashboard'),
    __param(0, (0, typeorm_1.InjectRepository)(pm_entities_1.ProjectEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(pm_entities_1.TaskEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(pm_entities_1.MilestoneEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(pm_entities_1.RiskEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(pm_entities_1.BudgetEntryEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(pm_entities_1.ResourceEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PmDashboardController);
//# sourceMappingURL=pm.controller.js.map