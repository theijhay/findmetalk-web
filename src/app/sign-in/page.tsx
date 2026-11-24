import { SignInFlow } from "@/features/auth/components/sign-in-flow";

// Sign-in and onboarding route (Spec 7.1, FR-AUTH-1, FR-AUTH-2, FR-PROF-1 to
// FR-PROF-5, REC-2). Starts cleanly on email entry with no fixture imports.
export default function SignInPage() {
  return <SignInFlow />;
}
