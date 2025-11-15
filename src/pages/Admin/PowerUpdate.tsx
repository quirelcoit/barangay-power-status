import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useToast } from "../../components";
import { ArrowLeft, Check, ChevronDown } from "lucide-react";

interface Municipality {
  value: string;
  label: string;
  totalBarangays: number;
}

interface Barangay {
  id: string;
  name: string;
}

interface UpdateState {
  energized: number;
  remarks: string;
  photo: File | null;
  energizedHouseholds: number;
  energizedBarangayIds: string[];
}

interface BarangayHouseholdData {
  barangay_id: string;
  barangay_name: string;
  total_households: number;
  restoredHouseholds: number;
  manual_total_households: number | null;
  baseline_total_households: number;
}

const MUNICIPALITIES: Municipality[] = [
  { value: "diffun", label: "Diffun", totalBarangays: 33 },
  { value: "cabarroguis", label: "Cabarroguis", totalBarangays: 17 },
  { value: "saguday", label: "Saguday", totalBarangays: 9 },
  { value: "maddela", label: "Maddela", totalBarangays: 32 },
  { value: "aglipay", label: "Aglipay", totalBarangays: 25 },
  { value: "nagtipunan", label: "Nagtipunan", totalBarangays: 16 },
  {
    value: "san_agustin_isabela",
    label: "SAN AGUSTIN, ISABELA",
    totalBarangays: 18,
  },
];

// Fixed household totals per municipality
const HOUSEHOLD_TOTALS: { [key: string]: number } = {
  diffun: 15013,
  cabarroguis: 9204,
  saguday: 4468,
  maddela: 10102,
  aglipay: 7308,
  nagtipunan: 4701,
  san_agustin_isabela: 4194,
};

export function PowerUpdate() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<
    "barangay" | "household" | "barangay_household"
  >("barangay");
  const [expandedMunicipality, setExpandedMunicipality] = useState<
    string | null
  >(null);
  const [barangays, setBarangays] = useState<{ [key: string]: Barangay[] }>({});
  const [loadingBarangays, setLoadingBarangays] = useState<Set<string>>(
    new Set()
  );
  const [expandedBarangayMunicipality, setExpandedBarangayMunicipality] =
    useState<string | null>(null);
  const [barangayHouseholdData, setBarangayHouseholdData] = useState<{
    [key: string]: BarangayHouseholdData[];
  }>({});
  const [barangayHouseholdUpdates, setBarangayHouseholdUpdates] = useState<{
    [key: string]: { [barangayId: string]: number };
  }>(() => {
    // Try to restore from localStorage
    try {
      const saved = localStorage.getItem("barangayHouseholdUpdates");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Could not restore barangay household updates:", e);
    }
    return {};
  });
  const [loadingBarangayHouseholds, setLoadingBarangayHouseholds] = useState<
    Set<string>
  >(new Set());
  const [manualTotalInputs, setManualTotalInputs] = useState<{
    [barangayId: string]: string;
  }>({});
  const [manualTotalSavingIds, setManualTotalSavingIds] = useState<Set<string>>(
    new Set()
  );

  const [updates, setUpdates] = useState<{
    [key: string]: UpdateState;
  }>(() => {
    // Try to restore from localStorage on initial mount
    try {
      const saved = localStorage.getItem("powerUpdateFormData");
      if (saved) {
        const parsed = JSON.parse(saved) as { [key: string]: any };
        const restored: { [key: string]: UpdateState } = {};
        for (const [key, value] of Object.entries(parsed)) {
          restored[key] = {
            ...(value as any),
            photo: null,
            energizedBarangayIds: (value as any).energizedBarangayIds || [],
          };
        }
        console.log("✅ Restored form data from localStorage:", restored);
        return restored;
      }
    } catch (e) {
      console.warn("Could not restore from localStorage:", e);
    }
    return {};
  });
  const [asOfTime, setAsOfTime] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Initialize asOfTime with current local time in datetime-local format
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const date = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    setAsOfTime(`${year}-${month}-${date}T${hours}:${minutes}`);

    checkAdmin();
  }, []);

  const loadBarangaysForMunicipality = async (municipality: string) => {
    try {
      setLoadingBarangays((prev) => new Set(prev).add(municipality));

      // Find the municipality label from MUNICIPALITIES array
      const muniObj = MUNICIPALITIES.find((m) => m.value === municipality);
      if (!muniObj) return;

      const { data: brgyData, error } = await supabase
        .from("barangays")
        .select("id, name")
        .eq("municipality", muniObj.label)
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;

      setBarangays((prev) => ({
        ...prev,
        [municipality]: brgyData || [],
      }));
    } catch (err) {
      console.warn("Could not load barangays:", err);
      addToast("Failed to load barangays", "error");
    } finally {
      setLoadingBarangays((prev) => {
        const newSet = new Set(prev);
        newSet.delete(municipality);
        return newSet;
      });
    }
  };

  const toggleMunicipalityExpand = (municipality: string) => {
    if (expandedMunicipality === municipality) {
      setExpandedMunicipality(null);
    } else {
      setExpandedMunicipality(municipality);
      if (!barangays[municipality]) {
        loadBarangaysForMunicipality(municipality);
      }
    }
  };

  const toggleBarangaySelection = (
    municipality: string,
    barangayId: string
  ) => {
    setUpdates((prev) => {
      const muniUpdate = prev[municipality] || {
        energized: 0,
        remarks: "",
        photo: null,
        energizedHouseholds: 0,
        energizedBarangayIds: [],
      };

      const energizedBarangayIds = muniUpdate.energizedBarangayIds || [];
      const isSelected = energizedBarangayIds.includes(barangayId);

      const newBarangayIds = isSelected
        ? energizedBarangayIds.filter((id) => id !== barangayId)
        : [...energizedBarangayIds, barangayId];

      return {
        ...prev,
        [municipality]: {
          ...muniUpdate,
          energizedBarangayIds: newBarangayIds,
          energized: newBarangayIds.length,
        },
      };
    });
  };

  const loadBarangayHouseholdData = async (municipalityLabel: string) => {
    try {
      setLoadingBarangayHouseholds((prev) =>
        new Set(prev).add(municipalityLabel)
      );

      // Map short code to full municipality name
      const muniObj = MUNICIPALITIES.find((m) => m.value === municipalityLabel);
      const fullMuniName = muniObj?.label || municipalityLabel;

      const { data, error } = await supabase
        .from("barangay_household_status")
        .select(
          "barangay_id, barangay_name, total_households, restored_households, manual_total_households, baseline_total_households"
        )
        .eq("municipality", fullMuniName)
        .order("barangay_name", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const barangayData: BarangayHouseholdData[] = data.map((item: any) => ({
          barangay_id: item.barangay_id,
          barangay_name: item.barangay_name,
          total_households: item.total_households,
          restoredHouseholds: item.restored_households || 0,
          manual_total_households: item.manual_total_households ?? null,
          baseline_total_households:
            item.baseline_total_households ?? item.total_households,
        }));

        setBarangayHouseholdData((prev) => ({
          ...prev,
          [municipalityLabel]: barangayData,
        }));

        setManualTotalInputs((prev) => ({
          ...prev,
          ...barangayData.reduce<Record<string, string>>((map, barangay) => {
            map[barangay.barangay_id] = String(barangay.total_households);
            return map;
          }, {}),
        }));

        // Initialize updates for this municipality if not already done
        setBarangayHouseholdUpdates((prev) => {
          const muniKey = municipalityLabel;
          if (prev[muniKey]) return prev; // Already initialized

          const newUpdates = { ...prev };
          newUpdates[muniKey] = {};
          barangayData.forEach((b) => {
            newUpdates[muniKey][b.barangay_id] = b.restoredHouseholds;
          });
          return newUpdates;
        });

        // Auto-sync: Mark barangays with restored > 0 as energized in Barangay Updates tab
        const energizedBarangayIds = barangayData
          .filter((b) => b.restoredHouseholds > 0)
          .map((b) => b.barangay_id);

        if (energizedBarangayIds.length > 0) {
          setUpdates((prev) => {
            const existing = prev[municipalityLabel]?.energizedBarangayIds || [];
            const merged = [...new Set([...existing, ...energizedBarangayIds])];
            
            return {
              ...prev,
              [municipalityLabel]: {
                ...prev[municipalityLabel],
                energizedBarangayIds: merged,
                energized: merged.length,
              },
            };
          });

          // Also update localStorage
          const savedUpdates = JSON.parse(localStorage.getItem("powerUpdates") || "{}");
          const existingIds = savedUpdates[municipalityLabel]?.energizedBarangayIds || [];
          const mergedIds = [...new Set([...existingIds, ...energizedBarangayIds])];
          
          savedUpdates[municipalityLabel] = {
            ...savedUpdates[municipalityLabel],
            energizedBarangayIds: mergedIds,
            energized: mergedIds.length,
          };
          localStorage.setItem("powerUpdates", JSON.stringify(savedUpdates));
        }
      }
    } catch (err) {
      console.warn("Could not load barangay household data:", err);
      addToast("Failed to load barangay household data", "error");
    } finally {
      setLoadingBarangayHouseholds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(municipalityLabel);
        return newSet;
      });
    }
  };

  const toggleBarangayHouseholdMunicipality = (municipality: string) => {
    if (expandedBarangayMunicipality === municipality) {
      setExpandedBarangayMunicipality(null);
    } else {
      setExpandedBarangayMunicipality(municipality);
      if (!barangayHouseholdData[municipality]) {
        loadBarangayHouseholdData(municipality);
      }
    }
  };

  // Save form data to localStorage whenever updates change
  useEffect(() => {
    if (Object.keys(updates).length > 0) {
      try {
        // Create a copy without File objects (photos can't be serialized)
        const serializableUpdates: { [key: string]: any } = {};
        for (const [key, value] of Object.entries(updates)) {
          serializableUpdates[key] = {
            energized: value.energized,
            remarks: value.remarks,
            energizedHouseholds: value.energizedHouseholds,
            energizedBarangayIds: value.energizedBarangayIds || [],
            // Exclude photo field since File objects can't be serialized
          };
        }
        localStorage.setItem(
          "powerUpdateFormData",
          JSON.stringify(serializableUpdates)
        );
      } catch (e) {
        console.warn("Could not save form data to localStorage:", e);
      }
    }
  }, [updates]);

  const checkAdmin = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) {
        addToast("Please log in to update power status", "error");
        navigate("/admin/login");
        return;
      }

      const { data: staff } = await supabase
        .from("staff_profiles")
        .select("role")
        .eq("uid", data.session.user.id)
        .single();

      if (!staff || (staff.role !== "admin" && staff.role !== "moderator")) {
        addToast("You don't have permission to update power status", "error");
        navigate("/");
        return;
      }

      setIsAdmin(true);

      await loadLatestData();
      setInitialized(true);
    } catch (err) {
      console.error("Auth check failed:", err);
      navigate("/admin/login");
    }
  };

  const loadLatestData = async () => {
    try {
      // Check if there's saved form data in localStorage
      const savedUpdates = localStorage.getItem("powerUpdateFormData");
      if (savedUpdates) {
        try {
          const parsedUpdates = JSON.parse(savedUpdates) as {
            [key: string]: any;
          };
          // Restore photo field as null since it was excluded from serialization
          const restoredUpdates: { [key: string]: UpdateState } = {};
          for (const [key, value] of Object.entries(parsedUpdates)) {
            restoredUpdates[key] = {
              ...(value as any),
              photo: null,
              energizedBarangayIds: (value as any).energizedBarangayIds || [],
            };
          }
          setUpdates(restoredUpdates);
          console.log("✅ Loaded saved form data from localStorage");
          return;
        } catch (e) {
          console.warn("Could not parse saved form data:", e);
        }
      }

      // If no saved data, initialize with empty values
      const newUpdates: { [key: string]: UpdateState } = {};
      MUNICIPALITIES.forEach((muni) => {
        newUpdates[muni.value] = {
          energized: 0,
          remarks: "",
          photo: null,
          energizedHouseholds: 0,
          energizedBarangayIds: [],
        };
      });

      setUpdates(newUpdates);
      console.log("✅ Initialized empty form data");
    } catch (err) {
      console.warn("Could not load latest data:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Determine what type of submission this is based on activeTab
    if (activeTab === "barangay") {
      await submitBarangayUpdates();
    } else if (activeTab === "household") {
      await submitHouseholdUpdates();
    } else if (activeTab === "barangay_household") {
      await submitBarangayHouseholdUpdates();
    }
  };

  const submitBarangayUpdates = async () => {
    // Check if at least one municipality has data
    const hasUpdates = Object.values(updates).some((u) => u.energized > 0);
    if (!hasUpdates) {
      addToast("Please select at least one energized barangay", "error");
      return;
    }

    setLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();

      // Convert local datetime-local to ISO string with timezone
      const asOfDateTime = new Date(`${asOfTime}:00`).toISOString();

      // Process each municipality that has updates
      for (const muni of MUNICIPALITIES) {
        const update = updates[muni.value];
        if (!update || update.energized === 0) continue;

        let photoUrl: string | null = null;

        // Upload photo if provided for this municipality
        if (update.photo) {
          try {
            const fileName = `${Date.now()}-${Math.random()
              .toString(36)
              .substring(7)}.jpg`;
            const { data: uploadData, error: uploadError } =
              await supabase.storage
                .from("report-photos")
                .upload(fileName, update.photo, {
                  cacheControl: "3600",
                  upsert: false,
                });

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
              .from("report-photos")
              .getPublicUrl(uploadData.path);

            photoUrl = urlData.publicUrl;
          } catch (photoErr) {
            console.warn(`Photo upload failed for ${muni.label}:`, photoErr);
          }
        }

        // Calculate no power
        const noPower = Math.max(0, muni.totalBarangays - update.energized);

        // Insert municipality update
        const { error } = await supabase.from("municipality_updates").insert([
          {
            municipality: muni.label,
            total_barangays: muni.totalBarangays,
            energized_barangays: update.energized,
            partial_barangays: 0,
            no_power_barangays: noPower,
            remarks: update.remarks || null,
            photo_url: photoUrl,
            updated_by: session?.session?.user?.id,
            is_published: true,
            as_of_time: asOfDateTime,
          },
        ]);

        if (error) throw error;

        // Now insert individual barangay updates for energized barangays
        // Get all barangays for this municipality
        const muniObj = MUNICIPALITIES.find((m) => m.value === muni.value);
        if (!muniObj) continue;

        const { data: allBarangays } = await supabase
          .from("barangays")
          .select("id")
          .eq("municipality", muniObj.label);

        if (allBarangays) {
          const energizedIds = update.energizedBarangayIds || [];

          // Insert energized updates
          for (const barangayId of energizedIds) {
            await supabase.from("barangay_updates").insert([
              {
                barangay_id: barangayId,
                headline: `Power Status Update - ${asOfDateTime}`,
                body: update.remarks || null,
                power_status: "energized",
                eta: null,
                author_uid: session?.session?.user?.id,
                is_published: true,
              },
            ]);
          }

          // Insert no_power updates for non-energized barangays
          const nonEnergizedIds = (allBarangays || [])
            .filter((b) => !energizedIds.includes(b.id))
            .map((b) => b.id);

          for (const barangayId of nonEnergizedIds) {
            await supabase.from("barangay_updates").insert([
              {
                barangay_id: barangayId,
                headline: `Power Status Update - ${asOfDateTime}`,
                body: update.remarks || null,
                power_status: "no_power",
                eta: null,
                author_uid: session?.session?.user?.id,
                is_published: true,
              },
            ]);
          }
        }
      }

      setSubmitted(true);
      addToast(
        "✅ Barangay power status updates submitted successfully!",
        "success"
      );

      // Keep form data in localStorage - user can see what they submitted
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    } catch (err) {
      console.error("Barangay submission error:", err);
      addToast(
        err instanceof Error ? err.message : "Failed to update barangay status",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateBarangayHouseholdValue = (
    municipality: string,
    barangayId: string,
    restoredCount: number
  ) => {
    // Update state
    setBarangayHouseholdUpdates((prev) => ({
      ...prev,
      [municipality]: {
        ...prev[municipality],
        [barangayId]: Math.max(0, restoredCount),
      },
    }));

    // Persist to localStorage
    const storageKey = "barangayHouseholdUpdates";
    const stored = localStorage.getItem(storageKey);
    const data = stored ? JSON.parse(stored) : {};
    if (!data[municipality]) data[municipality] = {};
    data[municipality][barangayId] = Math.max(0, restoredCount);
    localStorage.setItem(storageKey, JSON.stringify(data));
  };

  const handleManualTotalInputChange = (barangayId: string, value: string) => {
    setManualTotalInputs((prev) => ({
      ...prev,
      [barangayId]: value,
    }));
  };

  const handleManualTotalBlur = (
    municipality: string,
    barangay: BarangayHouseholdData
  ) => {
    const rawValue = manualTotalInputs[barangay.barangay_id];
    const trimmed = rawValue?.trim();

    if (!trimmed) {
      saveManualTotalOverride(
        municipality,
        barangay,
        barangay.baseline_total_households
      );
      return;
    }

    const parsed = parseInt(trimmed, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      addToast("Total households must be a positive number", "error");
      setManualTotalInputs((prev) => ({
        ...prev,
        [barangay.barangay_id]: String(barangay.total_households),
      }));
      return;
    }

    if (parsed < (barangay.restoredHouseholds || 0)) {
      addToast(
        `${barangay.barangay_name} already has ${barangay.restoredHouseholds} restored households`,
        "error"
      );
      setManualTotalInputs((prev) => ({
        ...prev,
        [barangay.barangay_id]: String(barangay.total_households),
      }));
      return;
    }

    saveManualTotalOverride(municipality, barangay, parsed);
  };

  const saveManualTotalOverride = async (
    municipality: string,
    barangay: BarangayHouseholdData,
    newTotal: number
  ) => {
    const baseline = barangay.baseline_total_households;
    const shouldRemoveOverride = newTotal === baseline;
    const noActionNeeded =
      barangay.manual_total_households === null && newTotal === baseline;

    if (noActionNeeded) {
      setManualTotalInputs((prev) => ({
        ...prev,
        [barangay.barangay_id]: String(baseline),
      }));
      return;
    }

    setManualTotalSavingIds((prev) => {
      const next = new Set(prev);
      next.add(barangay.barangay_id);
      return next;
    });

    try {
      const { data: session } = await supabase.auth.getSession();
      const updatedBy = session?.session?.user?.id || null;

      if (shouldRemoveOverride) {
        const { error } = await supabase
          .from("barangay_household_overrides")
          .delete()
          .eq("barangay_id", barangay.barangay_id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("barangay_household_overrides")
          .upsert(
            {
              barangay_id: barangay.barangay_id,
              override_total_households: newTotal,
              updated_by: updatedBy,
            },
            { onConflict: "barangay_id" }
          );
        if (error) throw error;
      }

      setBarangayHouseholdData((prev) => ({
        ...prev,
        [municipality]:
          prev[municipality]?.map((b) => {
            if (b.barangay_id !== barangay.barangay_id) return b;
            return {
              ...b,
              total_households: shouldRemoveOverride ? baseline : newTotal,
              manual_total_households: shouldRemoveOverride ? null : newTotal,
            };
          }) || [],
      }));

      setManualTotalInputs((prev) => ({
        ...prev,
        [barangay.barangay_id]: String(
          shouldRemoveOverride ? baseline : newTotal
        ),
      }));

      addToast(
        shouldRemoveOverride
          ? `${barangay.barangay_name} reverted to baseline total`
          : `${barangay.barangay_name} total households updated`,
        "success"
      );
    } catch (err) {
      console.error("Manual total update error:", err);
      addToast(
        err instanceof Error
          ? err.message
          : "Failed to save manual total households",
        "error"
      );
      setManualTotalInputs((prev) => ({
        ...prev,
        [barangay.barangay_id]: String(barangay.total_households),
      }));
    } finally {
      setManualTotalSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(barangay.barangay_id);
        return next;
      });
    }
  };

  const submitBarangayHouseholdUpdates = async () => {
    // Check if at least one barangay has household data
    const hasUpdates = Object.values(barangayHouseholdUpdates).some(
      (muniUpdates) => Object.values(muniUpdates).some((v) => v > 0)
    );

    if (!hasUpdates) {
      addToast(
        "Please enter at least one barangay's restored households",
        "error"
      );
      return;
    }

    setLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      const asOfDateTime = new Date(`${asOfTime}:00`).toISOString();

      // Process each municipality and barangay
      for (const [municipality, barangayUpdates] of Object.entries(
        barangayHouseholdUpdates
      )) {
        for (const [barangayId, restoredCount] of Object.entries(
          barangayUpdates
        )) {
          if (!restoredCount || restoredCount === 0) continue;

          // Get barangay data to validate
          const barangayArray = barangayHouseholdData[municipality];
          const barangay = barangayArray?.find(
            (b) => b.barangay_id === barangayId
          );

          if (!barangay) continue;

          // Validate restored count doesn't exceed total
          if (restoredCount > barangay.total_households) {
            addToast(
              `Restored households for ${barangay.barangay_name} cannot exceed total (${barangay.total_households})`,
              "error"
            );
            setLoading(false);
            return;
          }

          // Insert barangay household update
          const municipalityObj = MUNICIPALITIES.find((m) => m.value === municipality);
          const { error} = await supabase
            .from("barangay_household_updates")
            .insert([
              {
                municipality: municipalityObj?.label || municipality,
                barangay_id: barangayId,
                barangay_name: barangay.barangay_name,
                total_households: barangay.total_households,
                restored_households: restoredCount,
                as_of_time: asOfDateTime,
                updated_by: session?.session?.user?.id,
              },
            ]);

          if (error) throw error;
        }
      }

      // Auto-sync to Barangay Updates tab: mark barangays with restored > 0 as energized
      for (const [municipality, barangayUpdates] of Object.entries(
        barangayHouseholdUpdates
      )) {
        const energizedBarangayIds = Object.entries(barangayUpdates)
          .filter(([_, restoredCount]) => restoredCount > 0)
          .map(([barangayId]) => barangayId);

        if (energizedBarangayIds.length === 0) continue;

        const municipalityObj = MUNICIPALITIES.find((m) => m.value === municipality);
        
        // Insert energized status into barangay_updates table for each barangay
        for (const barangayId of energizedBarangayIds) {
          // Get barangay name from database
          const { data: barangayData } = await supabase
            .from("barangays")
            .select("name")
            .eq("id", barangayId)
            .single();

          if (!barangayData) continue;

          // Check if already marked as energized in database
          const { data: existingUpdates } = await supabase
            .from("barangay_updates")
            .select("id, power_status")
            .eq("barangay_id", barangayId)
            .eq("is_published", true)
            .order("created_at", { ascending: false })
            .limit(1);

          const latestUpdate = existingUpdates?.[0];

          // Only insert if not already energized
          if (!latestUpdate || latestUpdate.power_status !== "energized") {
            const { error: insertError } = await supabase.from("barangay_updates").insert([
              {
                municipality: municipalityObj?.label || municipality,
                barangay_id: barangayId,
                barangay_name: barangayData.name,
                headline: `Power restored to ${barangayData.name}`,
                power_status: "energized",
                is_published: true,
                updated_by: session?.session?.user?.id,
              },
            ]);

            if (insertError) {
              console.error("Failed to auto-sync energized status:", insertError);
            }
          }
        }

        // Update the local state to mark these barangays as energized
        setUpdates((prev) => ({
          ...prev,
          [municipality]: {
            ...prev[municipality],
            energizedBarangayIds: [
              ...(prev[municipality]?.energizedBarangayIds || []),
              ...energizedBarangayIds.filter(
                (id) => !prev[municipality]?.energizedBarangayIds?.includes(id)
              ),
            ],
          },
        }));

        // Save to localStorage
        const savedUpdates = JSON.parse(localStorage.getItem("powerUpdates") || "{}");
        savedUpdates[municipality] = {
          ...savedUpdates[municipality],
          energizedBarangayIds: [
            ...(savedUpdates[municipality]?.energizedBarangayIds || []),
            ...energizedBarangayIds.filter(
              (id) => !savedUpdates[municipality]?.energizedBarangayIds?.includes(id)
            ),
          ],
        };
        localStorage.setItem("powerUpdates", JSON.stringify(savedUpdates));
      }

      setSubmitted(true);
      addToast(
        "✅ Barangay household restoration updates submitted successfully!",
        "success"
      );

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    } catch (err) {
      console.error("Barangay household submission error:", err);
      addToast(
        err instanceof Error
          ? err.message
          : "Failed to update barangay household status",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const submitHouseholdUpdates = async () => {
    // Check if at least one municipality has household data
    const hasUpdates = Object.values(updates).some(
      (u) => u.energizedHouseholds > 0
    );
    if (!hasUpdates) {
      addToast(
        "Please enter at least one municipality's energized households",
        "error"
      );
      return;
    }

    setLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();

      // Convert local datetime-local to ISO string with timezone
      const asOfDateTime = new Date(`${asOfTime}:00`).toISOString();

      // Process each municipality that has household updates
      for (const muni of MUNICIPALITIES) {
        const update = updates[muni.value];
        if (!update || update.energizedHouseholds === 0) continue;

        const totalHH = HOUSEHOLD_TOTALS[muni.value] || 0;

        // Insert household update
        const { error } = await supabase.from("household_updates").insert([
          {
            municipality: muni.label,
            total_households: totalHH,
            energized_households: update.energizedHouseholds,
            remarks: update.remarks || null,
            updated_by: session?.session?.user?.id,
            is_published: true,
            as_of_time: asOfDateTime,
          },
        ]);

        if (error) throw error;
      }

      setSubmitted(true);
      addToast(
        "✅ Household energization updates submitted successfully!",
        "success"
      );

      // Keep form data in localStorage - user can see what they submitted
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    } catch (err) {
      console.error("Household submission error:", err);
      addToast(
        err instanceof Error
          ? err.message
          : "Failed to update household status",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAdmin || !initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex items-center gap-2">
          <button
            onClick={() => navigate("/admin")}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
            Power Status Update
          </h1>
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Check size={20} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900 text-sm sm:text-base">
                  Updates Submitted
                </p>
                <p className="text-xs sm:text-sm text-green-700">
                  All power status updates have been successfully recorded.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-300">
          <button
            onClick={() => setActiveTab("barangay")}
            className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold text-sm sm:text-base transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "barangay"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Barangay Update
          </button>
          <button
            onClick={() => setActiveTab("household")}
            className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold text-sm sm:text-base transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "household"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Household Update
          </button>
          <button
            onClick={() => setActiveTab("barangay_household")}
            className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold text-sm sm:text-base transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "barangay_household"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Barangay Households
          </button>
        </div>

        {/* Barangay Form */}
        {activeTab === "barangay" && (
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Instructions & Date/Time Picker */}
              <div className="p-3 sm:p-6 bg-blue-50 border-b border-blue-200 space-y-3 sm:space-y-4">
                <p className="text-xs sm:text-sm text-blue-900">
                  ℹ️ Click on a municipality to expand and select which
                  barangays are energized. The count will update automatically.
                </p>
                <div>
                  <label
                    htmlFor="as_of_time"
                    className="block text-xs sm:text-sm font-semibold text-blue-900 mb-2"
                  >
                    Report As Of Date & Time
                  </label>
                  <input
                    id="as_of_time"
                    type="datetime-local"
                    value={asOfTime}
                    onChange={(e) => setAsOfTime(e.target.value)}
                    className="w-full sm:w-64 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* Municipalities List */}
              <div className="space-y-2 p-3 sm:p-6">
                {MUNICIPALITIES.map((muni) => {
                  const energized = updates[muni.value]?.energized || 0;
                  const percentage =
                    energized > 0
                      ? ((energized / muni.totalBarangays) * 100).toFixed(2)
                      : (0).toFixed(2);
                  const isExpanded = expandedMunicipality === muni.value;
                  const muniBarangays = barangays[muni.value] || [];
                  const energizedBarangayIds =
                    updates[muni.value]?.energizedBarangayIds || [];
                  const isLoading = loadingBarangays.has(muni.value);

                  return (
                    <div
                      key={muni.value}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      {/* Municipality Header - Clickable */}
                      <button
                        type="button"
                        onClick={() => toggleMunicipalityExpand(muni.value)}
                        className="w-full bg-gray-50 hover:bg-blue-50 transition px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between"
                      >
                        <div className="text-left flex-1">
                          <p className="font-semibold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                            {muni.label}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Total: {muni.totalBarangays} | Energized:{" "}
                            {energized} | {percentage}%
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-xs sm:text-sm font-bold px-2 py-1 rounded ${
                              parseFloat(percentage) === 100
                                ? "bg-green-100 text-green-800"
                                : parseFloat(percentage) >= 75
                                ? "bg-lime-100 text-lime-800"
                                : parseFloat(percentage) >= 50
                                ? "bg-yellow-100 text-yellow-800"
                                : parseFloat(percentage) > 0
                                ? "bg-orange-100 text-orange-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {percentage}%
                          </span>
                        </div>
                      </button>

                      {/* Expanded Barangay List */}
                      {isExpanded && (
                        <div className="bg-white border-t border-gray-200 p-3 sm:p-6">
                          {isLoading ? (
                            <p className="text-center text-gray-600 py-4">
                              Loading barangays...
                            </p>
                          ) : muniBarangays.length === 0 ? (
                            <p className="text-center text-gray-600 py-4">
                              No barangays found
                            </p>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                                Click checkboxes to mark energized barangays:
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                                {muniBarangays.map((brgy) => {
                                  const isChecked =
                                    energizedBarangayIds.includes(brgy.id);
                                  return (
                                    <label
                                      key={brgy.id}
                                      className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-blue-50 transition"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() =>
                                          toggleBarangaySelection(
                                            muni.value,
                                            brgy.id
                                          )
                                        }
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                      />
                                      <span
                                        className={`text-sm ${
                                          isChecked
                                            ? "font-medium text-blue-900"
                                            : "text-gray-700"
                                        }`}
                                      >
                                        {brgy.name}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                              <p className="text-xs text-gray-500 mt-3">
                                Selected: {energizedBarangayIds.length} /{" "}
                                {muniBarangays.length}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Summary */}
                <div className="mt-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs sm:text-sm font-semibold text-blue-900">
                    Total Energized Barangays:{" "}
                    <span className="text-lg font-bold">
                      {MUNICIPALITIES.reduce(
                        (sum, m) => sum + (updates[m.value]?.energized || 0),
                        0
                      )}
                    </span>{" "}
                    /{" "}
                    <span>
                      {MUNICIPALITIES.reduce(
                        (sum, m) => sum + m.totalBarangays,
                        0
                      )}
                    </span>
                  </p>
                  <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{
                        width: `${
                          (MUNICIPALITIES.reduce(
                            (sum, m) =>
                              sum + (updates[m.value]?.energized || 0),
                            0
                          ) /
                            MUNICIPALITIES.reduce(
                              (sum, m) => sum + m.totalBarangays,
                              0
                            )) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Notes & Submit */}
              <div className="p-3 sm:p-6 bg-gray-50 border-t border-gray-200">
                <p className="text-xs sm:text-xs text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                  * Select energized barangays using checkboxes. Count updates
                  automatically. These selections will sync with the main
                  dashboard.
                </p>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 sm:py-3 rounded-lg transition text-sm sm:text-base"
                >
                  {loading ? "⏳ Submitting..." : "✅ Submit Barangay Updates"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Household Form */}
        {activeTab === "household" && (
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Instructions & Date/Time Picker */}
              <div className="p-3 sm:p-6 bg-blue-50 border-b border-blue-200 space-y-3 sm:space-y-4">
                <p className="text-xs sm:text-sm text-blue-900">
                  ℹ️ Enter the number of energized households for each
                  municipality. Leave blank or zero to skip.
                </p>
                <div>
                  <label
                    htmlFor="as_of_time_hh"
                    className="block text-xs sm:text-sm font-semibold text-blue-900 mb-2"
                  >
                    Report As Of Date & Time
                  </label>
                  <input
                    id="as_of_time_hh"
                    type="datetime-local"
                    value={asOfTime}
                    onChange={(e) => setAsOfTime(e.target.value)}
                    className="w-full sm:w-64 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* Household Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-gray-900 text-xs sm:text-base">
                        Municipality / Town
                      </th>
                      <th className="px-2 sm:px-6 py-3 sm:py-4 text-center font-bold text-gray-900 text-xs sm:text-base">
                        Total HH
                      </th>
                      <th className="px-2 sm:px-6 py-3 sm:py-4 text-center font-bold text-gray-900 text-xs sm:text-base">
                        Energized HH *
                      </th>
                      <th className="px-2 sm:px-6 py-3 sm:py-4 text-center font-bold text-green-600 text-xs sm:text-base">
                        %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {MUNICIPALITIES.map((muni, idx) => {
                      const bgColor = idx % 2 === 0 ? "bg-white" : "bg-gray-50";
                      const totalHH = HOUSEHOLD_TOTALS[muni.value] || 0;
                      const energizedHH =
                        updates[muni.value]?.energizedHouseholds || 0;
                      const percentage =
                        totalHH > 0
                          ? ((energizedHH / totalHH) * 100).toFixed(2)
                          : (0).toFixed(2);

                      return (
                        <tr
                          key={`hh-${muni.value}`}
                          className={`${bgColor} border-b border-gray-200`}
                        >
                          <td className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-gray-900 text-xs sm:text-base">
                            {muni.label}
                          </td>
                          <td className="px-2 sm:px-6 py-3 sm:py-4 text-center font-semibold text-gray-900 text-xs sm:text-base">
                            {totalHH}
                          </td>
                          <td className="px-2 sm:px-6 py-3 sm:py-4 text-center">
                            <input
                              type="number"
                              min="0"
                              max={totalHH}
                              value={energizedHH === 0 ? "" : energizedHH}
                              placeholder="0"
                              onChange={(e) => {
                                const val = Math.max(
                                  0,
                                  Math.min(
                                    totalHH,
                                    parseInt(e.target.value) || 0
                                  )
                                );
                                setUpdates({
                                  ...updates,
                                  [muni.value]: {
                                    energized:
                                      updates[muni.value]?.energized || 0,
                                    remarks: updates[muni.value]?.remarks || "",
                                    photo: updates[muni.value]?.photo || null,
                                    energizedHouseholds: val,
                                    energizedBarangayIds:
                                      updates[muni.value]
                                        ?.energizedBarangayIds || [],
                                  },
                                });
                              }}
                              onFocus={(e) => {
                                // Clear the field on focus for better UX
                                if (energizedHH === 0) {
                                  e.target.value = "";
                                }
                              }}
                              onBlur={(e) => {
                                // Reset to 0 if empty on blur
                                if (e.target.value === "") {
                                  setUpdates({
                                    ...updates,
                                    [muni.value]: {
                                      energized:
                                        updates[muni.value]?.energized || 0,
                                      remarks:
                                        updates[muni.value]?.remarks || "",
                                      photo: updates[muni.value]?.photo || null,
                                      energizedHouseholds: 0,
                                      energizedBarangayIds:
                                        updates[muni.value]
                                          ?.energizedBarangayIds || [],
                                    },
                                  });
                                }
                              }}
                              className="w-16 sm:w-20 mx-auto px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-sm sm:text-base"
                            />
                          </td>
                          <td
                            className={`px-2 sm:px-6 py-3 sm:py-4 text-center font-bold text-xs sm:text-lg ${
                              parseFloat(percentage) === 100
                                ? "text-green-600 bg-green-50"
                                : parseFloat(percentage) >= 75
                                ? "text-lime-600"
                                : parseFloat(percentage) >= 50
                                ? "text-yellow-600"
                                : parseFloat(percentage) > 0
                                ? "text-orange-600"
                                : "text-gray-400"
                            }`}
                          >
                            {percentage}%
                          </td>
                        </tr>
                      );
                    })}
                    {/* Total Row for Households */}
                    <tr className="bg-gray-200 border-t-2 border-gray-300 font-bold">
                      <td className="px-6 py-4 text-gray-900">TOTAL</td>
                      <td className="px-6 py-4 text-center text-gray-900">
                        {MUNICIPALITIES.reduce(
                          (sum, m) => sum + (HOUSEHOLD_TOTALS[m.value] || 0),
                          0
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-900">
                        {MUNICIPALITIES.reduce(
                          (sum, m) =>
                            sum + (updates[m.value]?.energizedHouseholds || 0),
                          0
                        )}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-lg">
                        {(() => {
                          const totalHH = MUNICIPALITIES.reduce(
                            (sum, m) => sum + (HOUSEHOLD_TOTALS[m.value] || 0),
                            0
                          );
                          const energizedHH = MUNICIPALITIES.reduce(
                            (sum, m) =>
                              sum +
                              (updates[m.value]?.energizedHouseholds || 0),
                            0
                          );
                          const totalPercent =
                            totalHH > 0
                              ? ((energizedHH / totalHH) * 100).toFixed(2)
                              : (0).toFixed(2);
                          return (
                            <span
                              className={
                                parseFloat(totalPercent) === 100
                                  ? "text-green-600 bg-green-50 px-2 py-1 rounded"
                                  : parseFloat(totalPercent) >= 75
                                  ? "text-lime-600"
                                  : parseFloat(totalPercent) >= 50
                                  ? "text-yellow-600"
                                  : parseFloat(totalPercent) > 0
                                  ? "text-orange-600"
                                  : "text-gray-400"
                              }
                            >
                              {totalPercent}%
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Notes & Submit */}
              <div className="p-3 sm:p-6 bg-gray-50 border-t border-gray-200">
                <p className="text-xs sm:text-xs text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                  * Percentage calculates automatically. Leave energized
                  households empty or zero to skip that municipality.
                </p>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 sm:py-3 rounded-lg transition text-sm sm:text-base"
                >
                  {loading ? "⏳ Submitting..." : "✅ Submit Household Updates"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Barangay Household Form */}
        {activeTab === "barangay_household" && (
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Instructions & Date/Time Picker */}
              <div className="p-3 sm:p-6 bg-blue-50 border-b border-blue-200 space-y-3 sm:space-y-4">
                <p className="text-xs sm:text-sm text-blue-900">
                  ℹ️ Click on a municipality to expand and enter restored
                  households for each barangay. The percentage will calculate
                  automatically.
                </p>
                <div>
                  <label
                    htmlFor="as_of_time_brgy_hh"
                    className="block text-xs sm:text-sm font-semibold text-blue-900 mb-2"
                  >
                    Report As Of Date & Time
                  </label>
                  <input
                    id="as_of_time_brgy_hh"
                    type="datetime-local"
                    value={asOfTime}
                    onChange={(e) => setAsOfTime(e.target.value)}
                    className="w-full sm:w-64 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* Municipalities List */}
              <div className="space-y-2 p-3 sm:p-6">
                {MUNICIPALITIES.map((muni) => {
                  const isExpanded =
                    expandedBarangayMunicipality === muni.value;
                  const barangays = barangayHouseholdData[muni.value] || [];
                  const isLoading = loadingBarangayHouseholds.has(muni.value);
                  const muniUpdates =
                    barangayHouseholdUpdates[muni.value] || {};

                  return (
                    <div
                      key={`brgy_hh_${muni.value}`}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      {/* Municipality Header - Clickable */}
                      <button
                        type="button"
                        onClick={() =>
                          toggleBarangayHouseholdMunicipality(muni.value)
                        }
                        disabled={loading}
                        className="w-full bg-gray-50 hover:bg-blue-50 disabled:opacity-50 transition px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between"
                      >
                        <span className="font-semibold text-gray-900 text-sm sm:text-base">
                          {muni.label}
                          {barangays.length > 0 && (
                            <span className="text-xs text-gray-500 ml-2">
                              ({barangays.length} barangays)
                            </span>
                          )}
                        </span>
                        <span className="text-gray-600">
                          {isExpanded ? "▼" : "▶"}
                        </span>
                      </button>

                      {/* Expanded Barangay List */}
                      {isExpanded && (
                        <div className="p-3 sm:p-6 bg-white space-y-3">
                          {isLoading ? (
                            <div className="text-center py-4">
                              <p className="text-sm text-gray-600">
                                Loading barangays...
                              </p>
                            </div>
                          ) : barangays.length === 0 ? (
                            <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-xs sm:text-sm text-yellow-900">
                              No barangay household data found.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {/* Barangay Grid Header */}
                              <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-700 pb-2 border-b border-gray-200">
                                <div className="col-span-3">Barangay</div>
                                <div className="col-span-2">Total HH</div>
                                <div className="col-span-2">Restored</div>
                                <div className="col-span-2">For Restore</div>
                                <div className="col-span-3">%</div>
                              </div>

                              {/* Barangay Rows */}
                              {barangays.map((barangay) => {
                                const restoredCount =
                                  muniUpdates[barangay.barangay_id] ||
                                  barangay.restoredHouseholds ||
                                  0;
                                const forRestoration =
                                  barangay.total_households - restoredCount;
                                const percent =
                                  barangay.total_households > 0
                                    ? Math.round(
                                        (restoredCount /
                                          barangay.total_households) *
                                          100
                                      )
                                    : 0;

                                // Color logic based on percentage
                                let bgColor = "bg-red-50"; // 0-24%
                                let barColor = "bg-red-500"; // 0-24%
                                if (percent >= 25 && percent < 50) {
                                  bgColor = "bg-orange-50";
                                  barColor = "bg-orange-500";
                                } else if (percent >= 50 && percent < 75) {
                                  bgColor = "bg-yellow-50";
                                  barColor = "bg-yellow-500";
                                } else if (percent >= 75 && percent < 100) {
                                  bgColor = "bg-lime-50";
                                  barColor = "bg-lime-500";
                                } else if (percent === 100) {
                                  bgColor = "bg-green-50";
                                  barColor = "bg-green-500";
                                }

                                return (
                                  <div
                                    key={barangay.barangay_id}
                                    className={`grid grid-cols-12 gap-2 items-center p-2 rounded ${bgColor} border border-gray-100`}
                                  >
                                    {/* Barangay Name */}
                                    <div className="col-span-3">
                                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                        ⚡ {barangay.barangay_name}
                                      </p>
                                    </div>

                                    {/* Total HH */}
                                    <div className="col-span-2">
                                      <div className="space-y-1">
                                        <input
                                          type="number"
                                          min="1"
                                          value={
                                            manualTotalInputs[
                                              barangay.barangay_id
                                            ] ??
                                            String(barangay.total_households)
                                          }
                                          onChange={(e) =>
                                            handleManualTotalInputChange(
                                              barangay.barangay_id,
                                              e.target.value
                                            )
                                          }
                                          onBlur={() =>
                                            handleManualTotalBlur(
                                              muni.value,
                                              barangay
                                            )
                                          }
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                              e.preventDefault();
                                              handleManualTotalBlur(
                                                muni.value,
                                                barangay
                                              );
                                              (
                                                e.target as HTMLInputElement
                                              ).blur();
                                            }
                                          }}
                                          disabled={
                                            loading ||
                                            manualTotalSavingIds.has(
                                              barangay.barangay_id
                                            )
                                          }
                                          className="w-full px-1 py-1 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                                        />
                                        {manualTotalSavingIds.has(
                                          barangay.barangay_id
                                        ) && (
                                          <p className="text-[10px] text-blue-600">
                                            Saving…
                                          </p>
                                        )}
                                        {barangay.manual_total_households !==
                                          null &&
                                          barangay.baseline_total_households &&
                                          barangay.manual_total_households !==
                                            barangay.baseline_total_households && (
                                            <p className="text-[10px] text-gray-500">
                                              Original{" "}
                                              {
                                                barangay.baseline_total_households
                                              }
                                            </p>
                                          )}
                                      </div>
                                    </div>

                                    {/* Restored HH Input */}
                                    <div className="col-span-2">
                                      <input
                                        type="number"
                                        min="0"
                                        max={barangay.total_households}
                                        value={restoredCount}
                                        onChange={(e) => {
                                          const val = parseInt(
                                            e.target.value || "0"
                                          );
                                          updateBarangayHouseholdValue(
                                            muni.value,
                                            barangay.barangay_id,
                                            val
                                          );
                                        }}
                                        disabled={loading}
                                        className="w-full px-1 py-1 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      />
                                    </div>

                                    {/* For Restoration */}
                                    <div className="col-span-2">
                                      <p className="text-xs sm:text-sm text-gray-700 text-center font-medium">
                                        {forRestoration}
                                      </p>
                                    </div>

                                    {/* Percentage with Bar */}
                                    <div className="col-span-3">
                                      <div className="space-y-1">
                                        <p className="text-xs sm:text-sm font-semibold text-gray-900 text-center">
                                          {percent}%
                                        </p>
                                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                          <div
                                            className={`h-full ${barColor} transition-all duration-200`}
                                            style={{
                                              width: `${percent}%`,
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Notes & Submit */}
              <div className="p-3 sm:p-6 bg-gray-50 border-t border-gray-200">
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-xs sm:text-sm text-blue-900 font-semibold mb-2">
                      💡 How to use:
                    </p>
                    <ul className="text-xs sm:text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>
                        Click on a municipality to expand and see all barangays
                      </li>
                      <li>
                        Enter the number of restored households in the
                        "Restored" column
                      </li>
                      <li>"For Restore" and percentage will auto-calculate</li>
                      <li>Verify the timestamp and submit</li>
                    </ul>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 sm:py-3 rounded-lg transition text-sm sm:text-base"
                  >
                    {loading
                      ? "⏳ Submitting..."
                      : "✅ Submit Barangay Household Updates"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
