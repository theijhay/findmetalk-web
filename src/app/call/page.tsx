import { CallScreen } from "@/features/calls/components/call-screen";

// 1:1 call route (Spec 7.4 to 7.6, FR-CALL-4, REC-2, P4, P5).
// Renders the calm idle fallback until wired to live call state; fixtures are
// used on /preview only (no fake people).
export default function CallPage() {
  return <CallScreen />;
}
