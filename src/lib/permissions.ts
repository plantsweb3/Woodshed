import type { Role } from "./constants";

export const isAdmin = (role: Role) => role === "drum_major" || role === "director";
export const isDirector = (role: Role) => role === "director";
export const canApproveMembers = (role: Role) => role === "drum_major" || role === "director";
export const canRotateInviteCode = (role: Role) => role === "drum_major" || role === "director";
export const canFeatureMembers = (role: Role) =>
  role === "section_leader" || role === "drum_major" || role === "director";
export const canPostOpportunity = (role: Role) =>
  role === "section_leader" || role === "drum_major" || role === "director";
export const canPromoteSectionLeader = (role: Role) => role === "drum_major" || role === "director";
export const canPromoteDrumMajor = (role: Role) => role === "director";
