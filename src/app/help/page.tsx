import { HelpScreen } from "@/features/help/components/help-screen";

// Dedicated "I need help" crisis directory screen (Spec 7.7, CR-1 to CR-5,
// OPEN-25). Pre-fills country from browser locale only (never IP) with zero
// hardcoded hotline numbers and zero fixture imports.
export default function HelpPage() {
  return <HelpScreen />;
}
