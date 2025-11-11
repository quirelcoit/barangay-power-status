import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Card, BarangayPicker, useToast } from "../../components";
import { ArrowLeft, Loader } from "lucide-react";

export function UpdateEditor() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [barangayId, setBarangayId] = useState("");
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [powerStatus, setPowerStatus] = useState<
    "no_power" | "partial" | "energized"
  >("no_power");
  const [eta, setEta] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        navigate("/admin/login");
      }
      setUser(authData.session?.user);
    }

    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!barangayId || !headline) {
      addToast("Please fill in required fields", "error");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("barangay_updates").insert([
        {
          barangay_id: barangayId,
          headline,
          body: body || null,
          power_status: powerStatus,
          eta: eta || null,
          author_uid: user?.id,
          is_published: true,
        },
      ]);

      if (error) throw error;

      addToast("Update posted successfully!", "success");
      setHeadline("");
      setBody("");
      setEta("");
      setTimeout(() => navigate("/admin/dashboard"), 1500);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Failed to post update",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-2xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="mb-6 flex items-center gap-2 text-power-600 hover:text-power-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <Card padding="lg">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Post Barangay Update
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Barangay Selection */}
            <BarangayPicker
              value={barangayId}
              onChange={setBarangayId}
              label="Select Barangay *"
            />

            {/* Power Status */}
            <div className="space-y-2">
              <label className="font-medium text-gray-700">
                Power Status *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["no_power", "partial", "energized"] as const).map(
                  (status) => {
                    const labels = {
                      no_power: "⚠️ NO POWER",
                      partial: "⚡ PARTIAL",
                      energized: "✓ ENERGIZED",
                    };

                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setPowerStatus(status)}
                        className={`p-3 rounded-lg border-2 transition-colors font-medium ${
                          powerStatus === status
                            ? "border-power-500 bg-power-50 text-power-700"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        {labels[status]}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <label htmlFor="headline" className="font-medium text-gray-700">
                Headline *
              </label>
              <input
                id="headline"
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="E.g., Crew mobilized to restore power on Main Street"
                maxLength={100}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-power-500"
              />
              <p className="text-xs text-gray-500">{headline.length}/100</p>
            </div>

            {/* Body */}
            <div className="space-y-2">
              <label htmlFor="body" className="font-medium text-gray-700">
                Details (optional)
              </label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Provide more context about the situation..."
                maxLength={500}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-power-500"
              />
              <p className="text-xs text-gray-500">{body.length}/500</p>
            </div>

            {/* ETA */}
            <div className="space-y-2">
              <label htmlFor="eta" className="font-medium text-gray-700">
                ETA (optional)
              </label>
              <input
                id="eta"
                type="text"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                placeholder="E.g., Service by 3:00 PM today"
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-power-500"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !barangayId || !headline}
              className="w-full px-4 py-3 bg-power-600 text-white rounded-lg font-medium hover:bg-power-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              Post Update
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
