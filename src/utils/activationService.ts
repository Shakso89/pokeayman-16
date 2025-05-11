
// Simple activation service to replace the deleted one
export function isTeacherActivated(): boolean {
  // Default to activated for all teachers
  return true;
}

export function setActivationStatus(status: boolean): void {
  // No-op function since we're not using activation anymore
  console.log("Activation status set to:", status);
}
