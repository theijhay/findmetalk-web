import type {
  AccountStandingData,
  BlockedUserItem,
  ReportCreatedResponse,
} from "@/lib/safety";

/**
 * Fixtures for `/preview` only, shaped exactly like the schemas in
 * findmetalk-api #27 (Block), #28 (Report) and #44 (In-app appeals).
 *
 * Never import this file into production pages or safety screens.
 */

export const SAFETY_TARGET_USER_FIXTURE: BlockedUserItem = {
  user_id: "f2a9d4c7-1b3e-4a6f-8d0c-5e7b9a1c3d62",
  display_name: "Tolu",
  avatar_id: "avatar_07",
  created_at: "2026-10-19T21:04:05Z",
};

export const REPORT_CREATED_FIXTURE: ReportCreatedResponse = {
  id: "3b5d7f9a-1c3e-4a5b-8d7f-9a1c3e5b7d92",
  created_at: "2026-10-19T21:04:05Z",
};

export const STANDING_SUSPENDED_CAN_APPEAL_FIXTURE: AccountStandingData = {
  status: "suspended",
  action: {
    id: "4c6e8a0b-2d4f-4c6e-8a0b-2d4f6a8c0e13",
    action: "suspend",
    reason: "Repeated harassment in calls",
    ends_at: "2026-10-22T21:04:05Z",
  },
  appeal: null,
  can_appeal: true,
};

export const STANDING_APPEAL_OPEN_FIXTURE: AccountStandingData = {
  ...STANDING_SUSPENDED_CAN_APPEAL_FIXTURE,
  appeal: {
    id: "1f3b5d7f-9a1c-4e3b-8d7f-9a1c3e5b7d01",
    state: "open",
    created_at: "2026-10-19T21:04:05Z",
  },
  can_appeal: false,
};

export const STANDING_APPEAL_REVIEWING_FIXTURE: AccountStandingData = {
  ...STANDING_SUSPENDED_CAN_APPEAL_FIXTURE,
  appeal: {
    id: "1f3b5d7f-9a1c-4e3b-8d7f-9a1c3e5b7d01",
    state: "reviewing",
    created_at: "2026-10-19T21:04:05Z",
  },
  can_appeal: false,
};

export const STANDING_APPEAL_OVERTURNED_FIXTURE: AccountStandingData = {
  status: "active",
  action: STANDING_SUSPENDED_CAN_APPEAL_FIXTURE.action,
  appeal: {
    id: "1f3b5d7f-9a1c-4e3b-8d7f-9a1c3e5b7d01",
    state: "overturned",
    created_at: "2026-10-19T21:04:05Z",
    resolved_at: "2026-10-20T10:15:00Z",
  },
  can_appeal: false,
};

export const STANDING_APPEAL_UPHELD_FIXTURE: AccountStandingData = {
  status: "banned",
  action: {
    id: "7e2a9c4b-1f5d-4a8e-9b3c-6d1f8a2e5c40",
    action: "ban",
    reason: "Severe breach of community safety rules",
    ends_at: null,
  },
  appeal: {
    id: "1f3b5d7f-9a1c-4e3b-8d7f-9a1c3e5b7d01",
    state: "upheld",
    created_at: "2026-10-19T21:04:05Z",
    resolved_at: "2026-10-20T10:15:00Z",
  },
  can_appeal: false,
};
