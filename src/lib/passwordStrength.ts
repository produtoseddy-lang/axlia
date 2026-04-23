export type PasswordStrength = {
  score: 0 | 1 | 2 | 3;
  label: "Vazia" | "Fraca" | "Média" | "Forte";
  color: string; // tailwind bg class
  hasMin: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  isValid: boolean;
};

export const evaluatePassword = (pw: string): PasswordStrength => {
  const hasMin = pw.length >= 8;
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const checks = [hasMin, hasUpper, hasNumber].filter(Boolean).length;

  if (pw.length === 0) {
    return { score: 0, label: "Vazia", color: "bg-muted", hasMin, hasUpper, hasNumber, isValid: false };
  }

  let score: 0 | 1 | 2 | 3 = 1;
  let label: PasswordStrength["label"] = "Fraca";
  let color = "bg-destructive";

  if (checks === 3 && pw.length >= 10) {
    score = 3;
    label = "Forte";
    color = "bg-emerald-500";
  } else if (checks >= 2) {
    score = 2;
    label = "Média";
    color = "bg-warning";
  }

  const isValid = hasMin && hasUpper && hasNumber;
  return { score, label, color, hasMin, hasUpper, hasNumber, isValid };
};
