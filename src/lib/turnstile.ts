/**
 * Load Turnstile widget script
 */
export function loadTurnstile(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).turnstile) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Turnstile"));
    document.head.appendChild(script);
  });
}

/**
 * Render Turnstile widget
 */
export function renderTurnstile(
  containerId: string,
  sitekey: string,
  callback?: (token: string) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!(window as any).turnstile) {
      reject(new Error("Turnstile not loaded"));
      return;
    }

    (window as any).turnstile.render(`#${containerId}`, {
      sitekey,
      theme: "light",
      callback: (token: string) => {
        callback?.(token);
        resolve(token);
      },
      "error-callback": () => {
        reject(new Error("Turnstile error"));
      },
    });
  });
}

/**
 * Get Turnstile token
 */
export function getTurnstileToken(): string | null {
  if (!(window as any).turnstile) {
    return null;
  }
  return (window as any).turnstile.getResponse();
}

/**
 * Reset Turnstile widget
 */
export function resetTurnstile(): void {
  if ((window as any).turnstile) {
    (window as any).turnstile.reset();
  }
}

/**
 * Remove Turnstile widget
 */
export function removeTurnstile(containerId: string): void {
  if ((window as any).turnstile) {
    (window as any).turnstile.remove(`#${containerId}`);
  }
}
