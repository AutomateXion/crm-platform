import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { OpportunityEntity, OpportunityItemEntity } from "./contacts.entity";

@UseGuards(JwtAuthGuard)
@Controller("opportunities")
export class OpportunitiesController {
  constructor(
    @InjectRepository(OpportunityEntity) private repo: Repository<OpportunityEntity>,
    @InjectRepository(OpportunityItemEntity) private itemRepo: Repository<OpportunityItemEntity>,
  ) {}

  @Get()
  async getAll(@CurrentUser() user: any, @Query() q: any) {
    const page = parseInt(q.page) || 1;
    const limit = parseInt(q.limit) || 50;
    const qb = this.repo.createQueryBuilder("o")
      .where("o.tenantId = :tid AND o.isActive = true", { tid: user.tenantId });
    if (q.search) qb.andWhere("o.opportunityName ILIKE :s", { s: `%${q.search}%` });
    if (q.accountId) qb.andWhere("o.accountId = :aid", { aid: q.accountId });
    if (q.stageCode) qb.andWhere("o.stageCode = :stage", { stage: q.stageCode });
    const total = await qb.getCount();
    const data = await qb.skip((page-1)*limit).take(limit).orderBy("o.createdAt","DESC").getMany();
    return { data, total, page, limit, totalPages: Math.ceil(total/limit) };
  }

  @Post()
  async create(@CurrentUser() user: any, @Body() body: any) {
    const count = await this.repo.count({ where: { tenantId: user.tenantId } });
    const num = `OPP-${new Date().getFullYear()}-${String(count+1).padStart(5,"0")}`;

    // Build initial stage history entry
    const stageHistory = [{
      stage: body.stageCode || "PROSPECTING",
      enteredAt: new Date().toISOString(),
      stageDate: body.expectedClose || null,
      notes: "Initial stage",
    }];

    return this.repo.save(this.repo.create({
      ...body,
      tenantId: user.tenantId,
      opportunityNumber: num,
      createdBy: user.userId,
      originalCloseDate: body.expectedClose || null,
      stageEnteredAt: new Date(),
      stageHistory,
    }));
  }

  @Get(":id")
  async getOne(@CurrentUser() user: any, @Param("id") id: string) {
    return this.repo.findOne({ where: { opportunityId: id, tenantId: user.tenantId } });
  }

  @Put(":id")
  async update(@CurrentUser() user: any, @Param("id") id: string, @Body() body: any) {
    const existing = await this.repo.findOne({ where: { opportunityId: id, tenantId: user.tenantId } });
    if (!existing) return null;

    // Preserve original close date — never overwrite unless explicitly set as originalCloseDate
    const originalCloseDate = existing.originalCloseDate || body.expectedClose || null;

    // Track stage change
    let stageHistory = Array.isArray(existing.stageHistory) ? [...existing.stageHistory] : [];
    if (body.stageCode && body.stageCode !== existing.stageCode) {
      stageHistory.push({
        stage: body.stageCode,
        enteredAt: new Date().toISOString(),
        stageDate: body.stageDate || body.expectedClose || null,
        notes: body.stageNotes || "",
      });
    }

    await this.repo.update(id, {
      ...body,
      originalCloseDate,
      stageHistory,
      stageEnteredAt: body.stageCode !== existing.stageCode ? new Date() : existing.stageEnteredAt,
    });
    return this.repo.findOne({ where: { opportunityId: id } });
  }

  @Patch(":id")
  async patch(@CurrentUser() user: any, @Param("id") id: string, @Body() body: any) {
    await this.repo.update(id, body);
    return this.repo.findOne({ where: { opportunityId: id } });
  }

  @Delete(":id")
  async remove(@CurrentUser() user: any, @Param("id") id: string) {
    await this.repo.update(id, { isActive: false });
    return { message: "Opportunity deleted" };
  }

  @Get(':id/items')
  async getItems(@Param('id') id: string) {
    return this.itemRepo.find({ where: { opportunityId: id }, order: { lineNumber: 'ASC' } });
  }

  @Post(':id/items')
  async saveItems(@Param('id') id: string, @Body() body: any) {
    await this.itemRepo.delete({ opportunityId: id });
    const items = (body.items || []).map((item: any, idx: number) =>
      this.itemRepo.create({ ...item, opportunityId: id, lineNumber: idx + 1 })
    );
    if (items.length) await this.itemRepo.save(items);
    return this.itemRepo.find({ where: { opportunityId: id }, order: { lineNumber: 'ASC' } });
  }
}
