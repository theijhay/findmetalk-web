import { SuspensionScreen } from "@/features/safety/components/suspension-screen";

// Suspended account standing and in-app appeal route (Spec 11.3 Appeals,
// API #44). Renders cleanly without fixture imports until wired to GET /me/standing.
export default function SuspendedPage() {
  return <SuspensionScreen />;
}
