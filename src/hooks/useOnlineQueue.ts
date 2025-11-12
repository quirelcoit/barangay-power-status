import { useEffect, useState } from "react";
import { getQueue, removeFromQueue } from "../store/reportQueue";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/Toast";

export function useOnlineQueue() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const syncQueue = async () => {
    if (isSyncing || !isOnline) return;

    setIsSyncing(true);
    const queue = getQueue();

    for (const report of queue) {
      try {
        // Upload photo if exists
        let photoPath: string | null = null;
        if (report.photoBase64) {
          const fileName = `${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}.jpg`;

          // Convert base64 data URL to Blob
          const base64Data =
            report.photoBase64.split(",")[1] || report.photoBase64;
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const photoBlob = new Blob([bytes], { type: "image/jpeg" });

          const { error: uploadError } = await supabase.storage
            .from("report-photos")
            .upload(fileName, photoBlob, {
              contentType: "image/jpeg",
            });

          if (!uploadError) {
            photoPath = fileName;
          } else {
            console.error("❌ Photo upload failed during sync:", uploadError);
          }
        }

        // Insert report
        const { data: insertedReport, error: reportError } = await supabase
          .from("reports")
          .insert([
            {
              barangay_id: report.barangayId,
              custom_location: report.customLocation,
              category: report.category,
              description: report.description,
              contact_hint: report.contactHint,
              lat: report.lat,
              lng: report.lng,
              turnstile_ok: true,
            },
          ])
          .select();

        if (reportError) throw reportError;

        // Insert photo reference if uploaded
        if (photoPath && insertedReport && insertedReport.length > 0) {
          await supabase.from("report_photos").insert([
            {
              report_id: insertedReport[0].id,
              storage_path: photoPath,
            },
          ]);
        }

        removeFromQueue(report.id);
        addToast("Report submitted successfully!", "success");
      } catch (err) {
        console.error("Failed to sync report:", err);
        addToast("Failed to sync report. Will retry later.", "error");
        break;
      }
    }

    setIsSyncing(false);
  };

  useEffect(() => {
    if (isOnline) {
      syncQueue();
    }
  }, [isOnline]);

  return { isOnline, isSyncing, syncQueue };
}
