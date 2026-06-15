import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, UseGuards, UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { JwtAuthGuard, CurrentUser } from '../auth.guard';
import {
  ProjectEntity, StageEntity, TaskEntity, TaskDocumentEntity,
  TaskCommentEntity, ResourceEntity, MilestoneEntity, BudgetEntryEntity,
  ChangeRequestEntity, RiskEntity, MeetingEntity, FeasibilityEntity,
} from '../pm.entities';
import * as path from 'path';
import * as fs from 'fs';

@UseGuards(JwtAuthGuard)
@Controller('pm/projects')
export class ProjectsController {
  constructor(@InjectRepository(ProjectEntity) private repo: Repository<ProjectEntity>) {}

  @Get()
  async getAll(@CurrentUser() u: any, @Query() q: any) {
    const page = parseInt(q.page) || 1;
    const limit = parseInt(q.limit) || 20;
    const qb = this.repo.createQueryBuilder('p')
      .where('p.tenantId = :tid AND p.isActive = true', { tid: u.tenantId });
    if (q.search) qb.andWhere('(p.projectName ILIKE :s OR p.clientName ILIKE :s OR p.awardedByName ILIKE :s)', { s: `%${q.search}%` });
    if (q.status) qb.andWhere('p.status = :status', { status: q.status });
    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).orderBy('p.createdAt', 'DESC').getMany();
    return { data, total, page, limit };
  }

  @Get(':id')
  async getOne(@CurrentUser() u: any, @Param('id') id: string) {
    return this.repo.findOne({ where: { projectId: id, tenantId: u.tenantId } });
  }

  @Post()
  async create(@CurrentUser() u: any, @Body() body: any) {
    const count = await this.repo.count({ where: { tenantId: u.tenantId } });
    const projectNumber = `PROJ-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    return this.repo.save(this.repo.create({ ...body, tenantId: u.tenantId, projectNumber, createdBy: u.userId }));
  }

  @Put(':id')
  async update(@CurrentUser() u: any, @Param('id') id: string, @Body() body: any) {
    await this.repo.update({ projectId: id, tenantId: u.tenantId }, body);
    return this.repo.findOne({ where: { projectId: id } });
  }

  @Delete(':id')
  async remove(@CurrentUser() u: any, @Param('id') id: string) {
    await this.repo.update({ projectId: id, tenantId: u.tenantId }, { isActive: false });
    return { message: 'Project deleted' };
  }
}

@UseGuards(JwtAuthGuard)
@Controller('pm/stages')
export class StagesController {
  constructor(
    @InjectRepository(StageEntity) private repo: Repository<StageEntity>,
    @InjectRepository(TaskEntity) private taskRepo: Repository<TaskEntity>,
    @InjectRepository(ProjectEntity) private projectRepo: Repository<ProjectEntity>,
  ) {}

  @Get()
  async getAll(@CurrentUser() u: any, @Query() q: any) {
    const qb = this.repo.createQueryBuilder('s')
      .where('s.tenantId = :tid AND s.isActive = true', { tid: u.tenantId });
    if (q.projectId) qb.andWhere('s.projectId = :pid', { pid: q.projectId });
    return qb.orderBy('s.orderIndex', 'ASC').getMany();
  }

  @Post()
  async create(@CurrentUser() u: any, @Body() body: any) {
    const count = await this.repo.count({ where: { projectId: body.projectId, tenantId: u.tenantId } });
    return this.repo.save(this.repo.create({ ...body, tenantId: u.tenantId, orderIndex: body.orderIndex ?? count, createdBy: u.userId }));
  }

  @Put(':id')
  async update(@CurrentUser() u: any, @Param('id') id: string, @Body() body: any) {
    await this.repo.update({ stageId: id, tenantId: u.tenantId }, body);
    await this.recalcProjectProgress(u.tenantId, body.projectId);
    return this.repo.findOne({ where: { stageId: id } });
  }

  @Delete(':id')
  async remove(@CurrentUser() u: any, @Param('id') id: string) {
    const stage = await this.repo.findOne({ where: { stageId: id } });
    await this.repo.update({ stageId: id, tenantId: u.tenantId }, { isActive: false });
    if (stage) await this.recalcProjectProgress(u.tenantId, stage.projectId);
    return { message: 'Stage deleted' };
  }

  @Post('reorder')
  async reorder(@CurrentUser() u: any, @Body() body: { stages: { stageId: string; orderIndex: number }[] }) {
    for (const s of body.stages) {
      await this.repo.update({ stageId: s.stageId, tenantId: u.tenantId }, { orderIndex: s.orderIndex });
    }
    return { message: 'Reordered' };
  }

  private async recalcProjectProgress(tenantId: string, projectId: string) {
    if (!projectId) return;
    const stages = await this.repo.find({ where: { projectId, tenantId, isActive: true } });
    if (!stages.length) return;
    const avg = stages.reduce((sum, s) => sum + Number(s.progress), 0) / stages.length;
    await this.projectRepo.update({ projectId }, { progress: Math.round(avg * 100) / 100 });
  }
}

@UseGuards(JwtAuthGuard)
@Controller('pm/tasks')
export class TasksController {
  constructor(
    @InjectRepository(TaskEntity) private repo: Repository<TaskEntity>,
    @InjectRepository(StageEntity) private stageRepo: Repository<StageEntity>,
    @InjectRepository(ProjectEntity) private projectRepo: Repository<ProjectEntity>,
  ) {}

  @Get()
  async getAll(@CurrentUser() u: any, @Query() q: any) {
    const qb = this.repo.createQueryBuilder('t')
      .where('t.tenantId = :tid AND t.isActive = true', { tid: u.tenantId });
    if (q.projectId) qb.andWhere('t.projectId = :pid', { pid: q.projectId });
    if (q.stageId) qb.andWhere('t.stageId = :sid', { sid: q.stageId });
    if (q.assignedTo) qb.andWhere('t.assignedTo = :uid', { uid: q.assignedTo });
    if (q.parentTaskId === 'null') qb.andWhere('t.parentTaskId IS NULL');
    else if (q.parentTaskId) qb.andWhere('t.parentTaskId = :ptid', { ptid: q.parentTaskId });
    if (q.status) qb.andWhere('t.status = :status', { status: q.status });
    return qb.orderBy('t.orderIndex', 'ASC').addOrderBy('t.createdAt', 'ASC').getMany();
  }

  @Get(':id')
  async getOne(@CurrentUser() u: any, @Param('id') id: string) {
    return this.repo.findOne({ where: { taskId: id, tenantId: u.tenantId } });
  }

  @Post()
  async create(@CurrentUser() u: any, @Body() body: any) {
    const count = await this.repo.count({ where: { projectId: body.projectId, tenantId: u.tenantId } });
    const taskNumber = `TASK-${String(count + 1).padStart(4, '0')}`;
    return this.repo.save(this.repo.create({ ...body, tenantId: u.tenantId, taskNumber, createdBy: u.userId }));
  }

  @Put(':id')
  async update(@CurrentUser() u: any, @Param('id') id: string, @Body() body: any) {
    const task = await this.repo.findOne({ where: { taskId: id } });
    if (task && body.assignedTo && body.assignedTo !== task.assignedTo) {
      const log = task.reassignLog || [];
      log.push({ from: task.assignedTo, fromName: task.assignedToName, to: body.assignedTo, toName: body.assignedToName, reason: body.reassignReason || '', at: new Date() });
      body.reassignLog = log;
    }
    if (body.status === 'DONE' && !task?.completedDate) body.completedDate = new Date();
    await this.repo.update({ taskId: id, tenantId: u.tenantId }, body);
    if (task?.stageId) await this.recalcStageProgress(u.tenantId, task.stageId, task.projectId);
    return this.repo.findOne({ where: { taskId: id } });
  }

  @Delete(':id')
  async remove(@CurrentUser() u: any, @Param('id') id: string) {
    const task = await this.repo.findOne({ where: { taskId: id } });
    await this.repo.update({ taskId: id, tenantId: u.tenantId }, { isActive: false });
    if (task?.stageId) await this.recalcStageProgress(u.tenantId, task.stageId, task.projectId);
    return { message: 'Task deleted' };
  }

  private async recalcStageProgress(tenantId: string, stageId: string, projectId: string) {
    const tasks = await this.repo.find({ where: { stageId, tenantId, isActive: true, parentTaskId: IsNull() } });
    if (!tasks.length) return;
    const done = tasks.filter(t => t.status === 'DONE').length;
    const progress = Math.round((done / tasks.length) * 100);
    await this.stageRepo.update({ stageId }, { progress });
    const stages = await this.stageRepo.find({ where: { projectId, tenantId, isActive: true } });
    if (stages.length) {
      const avg = stages.reduce((s, st) => s + Number(st.progress), 0) / stages.length;
      await this.projectRepo.update({ projectId }, { progress: Math.round(avg * 100) / 100 });
    }
  }
}

@UseGuards(JwtAuthGuard)
@Controller('pm/task-documents')
export class TaskDocumentsController {
  constructor(@InjectRepository(TaskDocumentEntity) private repo: Repository<TaskDocumentEntity>) {}

  @Get()
  async getAll(@CurrentUser() u: any, @Query() q: any) {
    const qb = this.repo.createQueryBuilder('d').where('d.tenantId = :tid', { tid: u.tenantId });
    if (q.taskId) qb.andWhere('d.taskId = :taskId', { taskId: q.taskId });
    return qb.orderBy('d.createdAt', 'DESC').getMany();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
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
  }))
  async upload(@CurrentUser() u: any, @UploadedFile() file: any, @Body() body: any) {
    if (!file) throw new Error('No file uploaded');
    return this.repo.save(this.repo.create({
      tenantId: u.tenantId, taskId: body.taskId, projectId: body.projectId,
      fileName: file.originalname, filePath: file.path,
      fileSize: file.size, mimeType: file.mimetype,
      uploadedBy: u.userId, uploadedByName: u.fullName || u.email,
    }));
  }

  @Delete(':id')
  async remove(@CurrentUser() u: any, @Param('id') id: string) {
    const doc = await this.repo.findOne({ where: { docId: id, tenantId: u.tenantId } });
    if (doc) { try { fs.unlinkSync(doc.filePath); } catch {} await this.repo.delete(id); }
    return { message: 'Deleted' };
  }
}

@UseGuards(JwtAuthGuard)
@Controller('pm/task-comments')
export class TaskCommentsController {
  constructor(@InjectRepository(TaskCommentEntity) private repo: Repository<TaskCommentEntity>) {}

  @Get()
  async getAll(@CurrentUser() u: any, @Query() q: any) {
    const qb = this.repo.createQueryBuilder('c').where('c.tenantId = :tid', { tid: u.tenantId });
    if (q.taskId) qb.andWhere('c.taskId = :taskId', { taskId: q.taskId });
    return qb.orderBy('c.createdAt', 'ASC').getMany();
  }

  @Post()
  async create(@CurrentUser() u: any, @Body() body: any) {
    return this.repo.save(this.repo.create({ ...body, tenantId: u.tenantId, createdBy: u.userId, createdByName: u.fullName || u.email }));
  }

  @Delete(':id')
  async remove(@CurrentUser() u: any, @Param('id') id: string) {
    await this.repo.delete({ commentId: id, tenantId: u.tenantId });
    return { message: 'Deleted' };
  }
}

@UseGuards(JwtAuthGuard)
@Controller('pm/resources')
export class ResourcesController {
  constructor(@InjectRepository(ResourceEntity) private repo: Repository<ResourceEntity>) {}

  @Get()
  async getAll(@CurrentUser() u: any, @Query() q: any) {
    const qb = this.repo.createQueryBuilder('r').where('r.tenantId = :tid AND r.isActive = true', { tid: u.tenantId });
    if (q.projectId) qb.andWhere('r.projectId = :pid', { pid: q.projectId });
    return qb.orderBy('r.createdAt', 'ASC').getMany();
  }

  @Post()
  async create(@CurrentUser() u: any, @Body() body: any) {
    return this.repo.save(this.repo.create({ ...body, tenantId: u.tenantId, createdBy: u.userId }));
  }

  @Put(':id')
  async update(@CurrentUser() u: any, @Param('id') id: string, @Body() body: any) {
    await this.repo.update({ resourceId: id, tenantId: u.tenantId }, body);
    return this.repo.findOne({ where: { resourceId: id } });
  }

  @Delete(':id')
  async remove(@CurrentUser() u: any, @Param('id') id: string) {
    await this.repo.update({ resourceId: id, tenantId: u.tenantId }, { isActive: false });
    return { message: 'Deleted' };
  }
}

@UseGuards(JwtAuthGuard)
@Controller('pm/milestones')
export class MilestonesController {
  constructor(@InjectRepository(MilestoneEntity) private repo: Repository<MilestoneEntity>) {}

  @Get()
  async getAll(@CurrentUser() u: any, @Query() q: any) {
    const qb = this.repo.createQueryBuilder('m').where('m.tenantId = :tid AND m.isActive = true', { tid: u.tenantId });
    if (q.projectId) qb.andWhere('m.projectId = :pid', { pid: q.projectId });
    return qb.orderBy('m.orderIndex', 'ASC').getMany();
  }

  @Post()
  async create(@CurrentUser() u: any, @Body() body: any) {
    const count = await this.repo.count({ where: { projectId: body.projectId, tenantId: u.tenantId } });
    return this.repo.save(this.repo.create({ ...body, tenantId: u.tenantId, orderIndex: count, createdBy: u.userId }));
  }

  @Put(':id')
  async update(@CurrentUser() u: any, @Param('id') id: string, @Body() body: any) {
    await this.repo.update({ milestoneId: id, tenantId: u.tenantId }, body);
    return this.repo.findOne({ where: { milestoneId: id } });
  }

  @Delete(':id')
  async remove(@CurrentUser() u: any, @Param('id') id: string) {
    await this.repo.update({ milestoneId: id, tenantId: u.tenantId }, { isActive: false });
    return { message: 'Deleted' };
  }
}

@UseGuards(JwtAuthGuard)
@Controller('pm/budget')
export class BudgetController {
  constructor(
    @InjectRepository(BudgetEntryEntity) private repo: Repository<BudgetEntryEntity>,
    @InjectRepository(ProjectEntity) private projectRepo: Repository<ProjectEntity>,
  ) {}

  @Get()
  async getAll(@CurrentUser() u: any, @Query() q: any) {
    const qb = this.repo.createQueryBuilder('b').where('b.tenantId = :tid', { tid: u.tenantId });
    if (q.projectId) qb.andWhere('b.projectId = :pid', { pid: q.projectId });
    if (q.entryType) qb.andWhere('b.entryType = :type', { type: q.entryType });
    return qb.orderBy('b.createdAt', 'DESC').getMany();
  }

  @Get('summary/:projectId')
  async getSummary(@CurrentUser() u: any, @Param('projectId') projectId: string) {
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

  @Post()
  async create(@CurrentUser() u: any, @Body() body: any) {
    const entry = await this.repo.save(this.repo.create({ ...body, tenantId: u.tenantId, createdBy: u.userId }));
    const entries = await this.repo.find({ where: { projectId: body.projectId, tenantId: u.tenantId, entryType: 'ACTUAL' } });
    const total = entries.reduce((s, e) => s + Number(e.amount), 0);
    await this.projectRepo.update({ projectId: body.projectId }, { actualCost: total });
    return entry;
  }

  @Delete(':id')
  async remove(@CurrentUser() u: any, @Param('id') id: string) {
    const entry = await this.repo.findOne({ where: { entryId: id, tenantId: u.tenantId } });
    await this.repo.delete({ entryId: id, tenantId: u.tenantId });
    if (entry) {
      const entries = await this.repo.find({ where: { projectId: entry.projectId, tenantId: u.tenantId, entryType: 'ACTUAL' } });
      const total = entries.reduce((s, e) => s + Number(e.amount), 0);
      await this.projectRepo.update({ projectId: entry.projectId }, { actualCost: total });
    }
    return { message: 'Deleted' };
  }
}

@UseGuards(JwtAuthGuard)
@Controller('pm/change-requests')
export class ChangeRequestsController {
  constructor(@InjectRepository(ChangeRequestEntity) private repo: Repository<ChangeRequestEntity>) {}

  @Get()
  async getAll(@CurrentUser() u: any, @Query() q: any) {
    const qb = this.repo.createQueryBuilder('cr').where('cr.tenantId = :tid AND cr.isActive = true', { tid: u.tenantId });
    if (q.projectId) qb.andWhere('cr.projectId = :pid', { pid: q.projectId });
    if (q.status) qb.andWhere('cr.status = :status', { status: q.status });
    return qb.orderBy('cr.createdAt', 'DESC').getMany();
  }

  @Post()
  async create(@CurrentUser() u: any, @Body() body: any) {
    const count = await this.repo.count({ where: { projectId: body.projectId, tenantId: u.tenantId } });
    const crNumber = `CR-${String(count + 1).padStart(3, '0')}`;
    return this.repo.save(this.repo.create({ ...body, tenantId: u.tenantId, crNumber, requestedBy: u.userId, requestedByName: u.fullName || u.email, createdBy: u.userId }));
  }

  @Put(':id')
  async update(@CurrentUser() u: any, @Param('id') id: string, @Body() body: any) {
    if (body.status && body.status !== 'PENDING') {
      body.reviewedBy = u.userId; body.reviewedByName = u.fullName || u.email; body.reviewDate = new Date();
    }
    await this.repo.update({ crId: id, tenantId: u.tenantId }, body);
    return this.repo.findOne({ where: { crId: id } });
  }

  @Delete(':id')
  async remove(@CurrentUser() u: any, @Param('id') id: string) {
    await this.repo.update({ crId: id, tenantId: u.tenantId }, { isActive: false });
    return { message: 'Deleted' };
  }
}

@UseGuards(JwtAuthGuard)
@Controller('pm/risks')
export class RisksController {
  constructor(@InjectRepository(RiskEntity) private repo: Repository<RiskEntity>) {}

  @Get()
  async getAll(@CurrentUser() u: any, @Query() q: any) {
    const qb = this.repo.createQueryBuilder('r').where('r.tenantId = :tid AND r.isActive = true', { tid: u.tenantId });
    if (q.projectId) qb.andWhere('r.projectId = :pid', { pid: q.projectId });
    return qb.orderBy('r.riskScore', 'DESC').getMany();
  }

  @Post()
  async create(@CurrentUser() u: any, @Body() body: any) {
    const scores: any = { LOW: 1, MEDIUM: 2, HIGH: 3 };
    body.riskScore = (scores[body.likelihood] || 1) * (scores[body.impact] || 1);
    return this.repo.save(this.repo.create({ ...body, tenantId: u.tenantId, createdBy: u.userId }));
  }

  @Put(':id')
  async update(@CurrentUser() u: any, @Param('id') id: string, @Body() body: any) {
    const scores: any = { LOW: 1, MEDIUM: 2, HIGH: 3 };
    if (body.likelihood || body.impact) {
      const existing = await this.repo.findOne({ where: { riskId: id } });
      const l = body.likelihood || existing?.likelihood || 'MEDIUM';
      const i = body.impact || existing?.impact || 'MEDIUM';
      body.riskScore = scores[l] * scores[i];
    }
    await this.repo.update({ riskId: id, tenantId: u.tenantId }, body);
    return this.repo.findOne({ where: { riskId: id } });
  }

  @Delete(':id')
  async remove(@CurrentUser() u: any, @Param('id') id: string) {
    await this.repo.update({ riskId: id, tenantId: u.tenantId }, { isActive: false });
    return { message: 'Deleted' };
  }
}

@UseGuards(JwtAuthGuard)
@Controller('pm/meetings')
export class MeetingsController {
  constructor(@InjectRepository(MeetingEntity) private repo: Repository<MeetingEntity>) {}

  @Get()
  async getAll(@CurrentUser() u: any, @Query() q: any) {
    const qb = this.repo.createQueryBuilder('m').where('m.tenantId = :tid', { tid: u.tenantId });
    if (q.projectId) qb.andWhere('m.projectId = :pid', { pid: q.projectId });
    return qb.orderBy('m.meetingDate', 'DESC').getMany();
  }

  @Post()
  async create(@CurrentUser() u: any, @Body() body: any) {
    return this.repo.save(this.repo.create({ ...body, tenantId: u.tenantId, createdBy: u.userId, createdByName: u.fullName || u.email }));
  }

  @Put(':id')
  async update(@CurrentUser() u: any, @Param('id') id: string, @Body() body: any) {
    await this.repo.update({ meetingId: id, tenantId: u.tenantId }, body);
    return this.repo.findOne({ where: { meetingId: id } });
  }

  @Delete(':id')
  async remove(@CurrentUser() u: any, @Param('id') id: string) {
    await this.repo.delete({ meetingId: id, tenantId: u.tenantId });
    return { message: 'Deleted' };
  }
}

@UseGuards(JwtAuthGuard)
@Controller('pm/dashboard')
export class DashboardController {
  constructor(
    @InjectRepository(ProjectEntity) private projectRepo: Repository<ProjectEntity>,
    @InjectRepository(TaskEntity) private taskRepo: Repository<TaskEntity>,
    @InjectRepository(MilestoneEntity) private milestoneRepo: Repository<MilestoneEntity>,
    @InjectRepository(ChangeRequestEntity) private crRepo: Repository<ChangeRequestEntity>,
    @InjectRepository(RiskEntity) private riskRepo: Repository<RiskEntity>,
  ) {}

  @Get()
  async getDashboard(@CurrentUser() u: any) {
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
}

@UseGuards(JwtAuthGuard)
@Controller('pm/dashboard')
export class PmDashboardController {
  constructor(
    @InjectRepository(ProjectEntity) private projectRepo: Repository<ProjectEntity>,
    @InjectRepository(TaskEntity) private taskRepo: Repository<TaskEntity>,
    @InjectRepository(MilestoneEntity) private milestoneRepo: Repository<MilestoneEntity>,
    @InjectRepository(RiskEntity) private riskRepo: Repository<RiskEntity>,
    @InjectRepository(BudgetEntryEntity) private budgetRepo: Repository<BudgetEntryEntity>,
    @InjectRepository(ResourceEntity) private resourceRepo: Repository<ResourceEntity>,
  ) {}

  @Get()
  async getDashboard(@CurrentUser() u: any) {
    const tid = u.tenantId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // ── Projects ──────────────────────────────────────────────
    const totalProjects = await this.projectRepo.count({ where: { tenantId: tid, isActive: true } });
    const activeProjects = await this.projectRepo.createQueryBuilder('p')
      .where('p.tenantId = :tid AND p.isActive = true AND p.status IN (:...s)', 
        { tid, s: ['ACTIVE', 'IN_PROGRESS', 'ON_HOLD', 'PLANNING'] })
      .getCount();
    const completedProjects = await this.projectRepo.createQueryBuilder('p')
      .where('p.tenantId = :tid AND p.status = :s', { tid, s: 'COMPLETED' })
      .getCount();
    const atRiskProjects = await this.projectRepo.createQueryBuilder('p')
      .where('p.tenantId = :tid AND p.isActive = true AND p.health IN (:...h)', { tid, h: ['YELLOW', 'RED', 'AT_RISK'] })
      .getCount();

    // Projects by status
    const projectsByStatus = await this.projectRepo.createQueryBuilder('p')
      .select('p.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('p.tenantId = :tid AND p.isActive = true', { tid })
      .groupBy('p.status')
      .getRawMany();

    // Projects by health
    const projectsByHealth = await this.projectRepo.createQueryBuilder('p')
      .select('p.health', 'health')
      .addSelect('COUNT(*)', 'count')
      .where('p.tenantId = :tid AND p.isActive = true', { tid })
      .groupBy('p.health')
      .getRawMany();

    // Budget summary
    const budgetResult = await this.projectRepo.createQueryBuilder('p')
      .select('SUM(p.budget)', 'totalBudget')
      .addSelect('SUM(p.actualCost)', 'totalActual')
      .where('p.tenantId = :tid AND p.isActive = true', { tid })
      .getRawOne();

    // Recent projects
    const recentProjects = await this.projectRepo.createQueryBuilder('p')
      .where('p.tenantId = :tid AND p.isActive = true', { tid })
      .orderBy('p.createdAt', 'DESC')
      .limit(5)
      .getMany();

    // ── Tasks ─────────────────────────────────────────────────
    const totalTasks = await this.taskRepo.count({ where: { tenantId: tid } });
    const completedTasks = await this.taskRepo.createQueryBuilder('t')
      .where('t.tenantId = :tid AND t.status = :s', { tid, s: 'DONE' })
      .getCount();
    const overdueTasks = await this.taskRepo.createQueryBuilder('t')
      .where('t.tenantId = :tid AND t.dueDate < :now AND t.status NOT IN (:...s)',
        { tid, now, s: ['DONE', 'CANCELLED'] })
      .getCount();
    const tasksDueToday = await this.taskRepo.createQueryBuilder('t')
      .where('t.tenantId = :tid AND DATE(t.dueDate) = CURRENT_DATE AND t.status NOT IN (:...s)',
        { tid, s: ['DONE', 'CANCELLED'] })
      .getCount();

    // Tasks by status
    const tasksByStatus = await this.taskRepo.createQueryBuilder('t')
      .select('t.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('t.tenantId = :tid', { tid })
      .groupBy('t.status')
      .getRawMany();

    // ── Milestones ────────────────────────────────────────────
    const totalMilestones = await this.milestoneRepo.count({ where: { tenantId: tid } });
    const completedMilestones = await this.milestoneRepo.createQueryBuilder('m')
      .where('m.tenantId = :tid AND m.status = :s', { tid, s: 'COMPLETED' })
      .getCount();
    const overdueMilestones = await this.milestoneRepo.createQueryBuilder('m')
      .where('m.tenantId = :tid AND m.dueDate < :now AND m.status != :s',
        { tid, now, s: 'COMPLETED' })
      .getCount();

    // ── Risks ─────────────────────────────────────────────────
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

    // ── Resources ─────────────────────────────────────────────
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
}


// ─── Feasibility / Investment Appraisal ──────────────────────────
function computeFeasibility(initialInvestment: number, cashFlows: any[], discountRate: number) {
  const r = discountRate / 100;
  // cashFlows: [{ period, inflow, outflow }] — period 1,2,3...
  const netFlows = cashFlows.map(cf => Number(cf.inflow || 0) - Number(cf.outflow || 0));

  // NPV = -initial + Σ net_t / (1+r)^t
  let npv = -initialInvestment;
  let pvInflows = 0;
  netFlows.forEach((net, idx) => {
    const t = idx + 1;
    const pv = net / Math.pow(1 + r, t);
    npv += pv;
    if (net > 0) pvInflows += pv;
  });

  // Total net profit (undiscounted)
  const totalNet = netFlows.reduce((a, b) => a + b, 0);
  const roi = initialInvestment > 0 ? (totalNet - initialInvestment + initialInvestment) / initialInvestment * 100 - 100 : 0;
  // ROI = (total returns - investment) / investment * 100
  const roiCalc = initialInvestment > 0 ? ((totalNet - initialInvestment) / initialInvestment) * 100 : 0;

  // Payback period (undiscounted cumulative)
  let cumulative = -initialInvestment;
  let payback: number | null = null;
  for (let i = 0; i < netFlows.length; i++) {
    const prev = cumulative;
    cumulative += netFlows[i];
    if (cumulative >= 0 && payback === null) {
      // linear interpolation within the period
      const needed = -prev;
      payback = i + (netFlows[i] !== 0 ? needed / netFlows[i] : 0);
    }
  }

  // Profitability Index = PV of inflows / initial investment
  const pi = initialInvestment > 0 ? pvInflows / initialInvestment : 0;

  // IRR via bisection
  const npvAt = (rate: number) => {
    let v = -initialInvestment;
    netFlows.forEach((net, idx) => { v += net / Math.pow(1 + rate, idx + 1); });
    return v;
  };
  let irr: number | null = null;
  let lo = -0.9, hi = 5.0;
  let fLo = npvAt(lo), fHi = npvAt(hi);
  if (fLo * fHi < 0) {
    for (let k = 0; k < 100; k++) {
      const mid = (lo + hi) / 2;
      const fMid = npvAt(mid);
      if (Math.abs(fMid) < 0.01) { irr = mid; break; }
      if (fLo * fMid < 0) { hi = mid; fHi = fMid; } else { lo = mid; fLo = fMid; }
      irr = mid;
    }
  }

  // Verdict
  let verdict = 'NO-GO';
  if (npv > 0 && (irr === null || irr * 100 > discountRate)) verdict = 'GO';
  else if (npv >= 0) verdict = 'CAUTION';
  else verdict = 'NO-GO';

  return {
    npv: Number(npv.toFixed(3)),
    irr: irr !== null ? Number((irr * 100).toFixed(4)) : null,
    roi: Number(roiCalc.toFixed(2)),
    paybackPeriods: payback !== null ? Number(payback.toFixed(2)) : null,
    profitabilityIndex: Number(pi.toFixed(4)),
    verdict,
  };
}

@UseGuards(JwtAuthGuard)
@Controller('pm/feasibility')
export class FeasibilityController {
  constructor(@InjectRepository(FeasibilityEntity) private repo: Repository<FeasibilityEntity>) {}

  @Get()
  async getAll(@CurrentUser() u: any, @Query() q: any) {
    const where: any = { tenantId: u.tenantId };
    if (q.projectId) where.projectId = q.projectId;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  @Post('calculate')
  calculate(@Body() body: any) {
    return computeFeasibility(Number(body.initialInvestment || 0), body.cashFlows || [], Number(body.discountRate || 10));
  }

  @Post()
  async create(@CurrentUser() u: any, @Body() body: any) {
    const calc = computeFeasibility(Number(body.initialInvestment || 0), body.cashFlows || [], Number(body.discountRate || 10));
    const entity = this.repo.create({ ...body, ...calc, tenantId: u.tenantId, createdBy: u.userId });
    return this.repo.save(entity);
  }

  @Put(':id')
  async update(@CurrentUser() u: any, @Param('id') id: string, @Body() body: any) {
    const calc = computeFeasibility(Number(body.initialInvestment || 0), body.cashFlows || [], Number(body.discountRate || 10));
    await this.repo.update({ feasibilityId: id, tenantId: u.tenantId }, { ...body, ...calc });
    return this.repo.findOne({ where: { feasibilityId: id } });
  }

  @Delete(':id')
  async remove(@CurrentUser() u: any, @Param('id') id: string) {
    await this.repo.delete({ feasibilityId: id, tenantId: u.tenantId });
    return { success: true };
  }
}
