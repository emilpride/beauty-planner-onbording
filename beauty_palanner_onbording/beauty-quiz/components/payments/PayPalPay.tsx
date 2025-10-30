"use client";

import React, { useEffect, useRef, useState } from "react";

interface PayPalPayProps {
  amountCents: number;
  currency?: string; // e.g., "USD"
  onSuccess: () => void;
}

// Lightweight PayPal Buttons loader without adding extra deps
export default function PayPalPay({ amountCents, currency = "USD", onSuccess }: PayPalPayProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const clientId = process.env["NEXT_PUBLIC_PAYPAL_CLIENT_ID"];

  useEffect(() => {
    let script: HTMLScriptElement | null = null;
    if (typeof window === "undefined") {
      return () => {};
    }
    if (!(window as any).paypal) {
      if (!clientId) {
        // no client id provided; remain not ready
      } else {
        script = document.createElement("script");
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
        script.async = true;
        script.onload = () => setReady(true);
        script.onerror = () => console.warn("PayPal SDK failed to load");
        document.body.appendChild(script);
      }
    } else {
      setReady(true);
    }
    return () => {
      // keep script for caching between modal opens; do not remove
      // if cleanup is desired in the future:
      // if (script && script.parentNode) script.parentNode.removeChild(script);
    };
  }, [clientId, currency]);

  useEffect(() => {
    if (!ready) return;
    const paypal = (window as any).paypal;
    if (!paypal || !containerRef.current) return;
    try {
      // Clear previous buttons if any (when reopening modal)
      containerRef.current.innerHTML = "";
      paypal.Buttons({
        style: {
          layout: "horizontal",
          color: "gold",
          shape: "pill",
          label: "paypal",
          tagline: false,
          height: 40,
        },
        createOrder: (_data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: (amountCents / 100).toFixed(2),
                  currency_code: currency,
                },
              },
            ],
          });
        },
        onApprove: async (_data: any, actions: any) => {
          try {
            await actions.order.capture();
            onSuccess();
          } catch (e) {
            console.warn("PayPal capture failed", e);
          }
        },
        onError: (err: any) => {
          console.warn("PayPal error", err);
        },
      }).render(containerRef.current);
    } catch (e) {
      console.warn("Failed to render PayPal buttons", e);
    }
  }, [ready, amountCents, currency, onSuccess]);

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-3">
      {!clientId && (
        <div className="mb-2 text-xs text-text-secondary">
          PayPal client ID not configured.
        </div>
      )}
      <div ref={containerRef} className="flex justify-center" />
    </div>
  );
}
