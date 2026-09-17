/**
 * PostgreSQL Schema aligned Type Definitions for Main Flow 1:
 * "AI Movie Production & Publishing" (Maker - Checker Workflow)
 */

export type WorkflowState =
  | 'PLAN_DRAFT'          // Maker is drafting the content brief
  | 'PLAN_PENDING'        // Maker submitted plan, awaiting Checker review & quota
  | 'QUOTA_ALLOCATED'     // Checker approved plan and assigned AI token quota
  | 'IN_PRODUCTION'       // Maker is generating video/audio assets in Studio
  | 'EPISODE_SUBMITTED'   // Maker completed assembly and submitted episode package
  | 'CHANGES_REQUESTED'   // Checker requested plan or content revisions
  | 'COMPLIANCE_PASSED'   // Checker validated Article 44 & Decree 142 AI compliance
  | 'PUBLISHED';          // Published live to OTT streaming catalog

export type Role = 'creator' | 'reviewer';
