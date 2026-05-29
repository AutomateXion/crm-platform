"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const pm_entities_1 = require("./pm.entities");
const auth_guard_1 = require("./auth.guard");
const pm_controller_1 = require("./projects/pm.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST || 'postgres-core',
                port: parseInt(process.env.DB_PORT) || 5432,
                database: process.env.DB_NAME || 'crm_core',
                username: process.env.DB_USER || 'crm_user',
                password: process.env.DB_PASS || 'crm_password_2024',
                entities: [
                    pm_entities_1.ProjectEntity, pm_entities_1.StageEntity, pm_entities_1.TaskEntity, pm_entities_1.TaskDocumentEntity,
                    pm_entities_1.TaskCommentEntity, pm_entities_1.ResourceEntity, pm_entities_1.MilestoneEntity, pm_entities_1.BudgetEntryEntity,
                    pm_entities_1.ChangeRequestEntity, pm_entities_1.RiskEntity, pm_entities_1.MeetingEntity,
                ],
                synchronize: true,
            }),
            typeorm_1.TypeOrmModule.forFeature([
                pm_entities_1.ProjectEntity, pm_entities_1.StageEntity, pm_entities_1.TaskEntity, pm_entities_1.TaskDocumentEntity,
                pm_entities_1.TaskCommentEntity, pm_entities_1.ResourceEntity, pm_entities_1.MilestoneEntity, pm_entities_1.BudgetEntryEntity,
                pm_entities_1.ChangeRequestEntity, pm_entities_1.RiskEntity, pm_entities_1.MeetingEntity,
            ]),
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'crm_jwt_super_secret_2024_change_in_production',
            }),
        ],
        controllers: [
            pm_controller_1.ProjectsController, pm_controller_1.StagesController, pm_controller_1.TasksController,
            pm_controller_1.TaskDocumentsController, pm_controller_1.TaskCommentsController, pm_controller_1.ResourcesController,
            pm_controller_1.MilestonesController, pm_controller_1.BudgetController, pm_controller_1.ChangeRequestsController,
            pm_controller_1.RisksController, pm_controller_1.MeetingsController, pm_controller_1.DashboardController,
        ],
        providers: [auth_guard_1.JwtStrategy],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map