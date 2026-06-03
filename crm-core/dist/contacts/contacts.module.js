"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsInlineModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const contacts_controller_1 = require("./contacts.controller");
const leads_controller_1 = require("./leads.controller");
const opportunities_controller_1 = require("./opportunities.controller");
const activities_controller_1 = require("./activities.controller");
const crm_dashboard_controller_1 = require("./crm-dashboard.controller");
const visits_controller_1 = require("./visits.controller");
const contacts_entity_1 = require("./contacts.entity");
let ContactsInlineModule = class ContactsInlineModule {
};
exports.ContactsInlineModule = ContactsInlineModule;
exports.ContactsInlineModule = ContactsInlineModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([
                contacts_entity_1.AccountEntity, contacts_entity_1.ContactEntity, contacts_entity_1.LeadEntity, contacts_entity_1.OpportunityEntity,
                contacts_entity_1.ActivityEntity, contacts_entity_1.OpportunityItemEntity, contacts_entity_1.CustomerVisitEntity
            ])],
        controllers: [
            contacts_controller_1.ContactsController, leads_controller_1.LeadsController, opportunities_controller_1.OpportunitiesController,
            activities_controller_1.ActivitiesController, crm_dashboard_controller_1.CrmDashboardController, visits_controller_1.VisitsController
        ],
    })
], ContactsInlineModule);
//# sourceMappingURL=contacts.module.js.map