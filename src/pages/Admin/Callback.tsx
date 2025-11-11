import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Loader } from "lucide-react";

export function AdminCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          // User is authenticated, redirect to dashboard
          navigate("/admin/dashboard", { replace: true });
        } else {
          // No session, redirect to login with error
          setError("Authentication failed. Please try again.");
          setTimeout(() => navigate("/admin/login", { replace: true }), 3000);
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Authentication error";
        setError(errorMsg);
        console.error("Callback error:", err);
        setTimeout(() => navigate("/admin/login", { replace: true }), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">
              Authentication Failed
            </h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              Redirecting to login in 3 seconds...
            </p>
          </div>
        ) : (
          <div>
            <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-power-600" />
            <p className="text-gray-600">Verifying your email...</p>
          </div>
        )}
      </div>
    </div>
  );
}
