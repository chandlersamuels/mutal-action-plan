import { SignUp } from "@clerk/nextjs";

const clerkAppearance = {
  variables: {
    colorPrimary: "#22c55e",
    colorBackground: "#ffffff",
    colorText: "#111827",
    colorTextSecondary: "#6b7280",
    colorInputBackground: "#ffffff",
    colorInputText: "#111827",
    colorInputPlaceholder: "#9ca3af",
    borderRadius: "0.5rem",
    fontFamily: "inherit",
    fontSize: "0.875rem",
  },
  elements: {
    rootBox: "w-full",
    card: "shadow-none border border-gray-100 rounded-2xl p-8 w-full",
    headerTitle: "text-xl font-semibold text-gray-900",
    headerSubtitle: "text-gray-500 text-sm",
    socialButtonsBlockButton:
      "border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors",
    formFieldInput:
      "rounded-lg border-gray-200 focus:border-green-500 focus:ring-green-500 text-gray-900",
    formFieldLabel: "text-gray-700 text-sm font-medium",
    formButtonPrimary:
      "bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-medium",
    footerActionLink: "text-green-600 hover:text-green-700 font-medium",
    dividerLine: "bg-gray-200",
    dividerText: "text-gray-400 text-xs",
  },
};

export default function SignUpPage() {
  return (
    <div className="w-full max-w-[400px]">
      <SignUp appearance={clerkAppearance} />
    </div>
  );
}
