import { CloudScreen } from "@/features/cloud/components/cloud-screen";

// Cloud page (Spec 9.2, 9.3, FR-CLOUD-3, FR-CLOUD-4, FR-CLOUD-7, FR-PROF-6).
// Renders with an empty cloud until wired to GET /api/v1/cloud; fixtures are
// used on /preview only (no fake people).
export default function CloudPage() {
  return <CloudScreen />;
}

