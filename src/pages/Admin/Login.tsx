import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Card, useToast } from "../../components";
import { Mail, Loader } from "lucide-react";

export function AdminLogin() {
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "otp">("email");

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/callback`,
        },
      });
      if (error) throw error;

      addToast("Check your email for the OTP link", "success", 5000);
      setStep("otp");
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Failed to send OTP",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-6">
      <div className="w-full max-w-md px-4">
        <Card padding="lg">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-gray-600 mt-2">Email verification for staff</p>
          </div>

          {step === "email" ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="flex items-center gap-2 font-medium text-gray-700"
                >
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@ec.gov.ph"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-power-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-power-600 text-white rounded-lg font-medium hover:bg-power-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader className="w-4 h-4 animate-spin" />}
                Send OTP
              </button>

              <p className="text-xs text-gray-600 text-center">
                An OTP link will be sent to your email. Click the link to login.
              </p>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-gray-700">
                OTP sent to <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Check your email and click the link to complete login.
              </p>
              <button
                onClick={() => {
                  setStep("email");
                  setEmail("");
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
