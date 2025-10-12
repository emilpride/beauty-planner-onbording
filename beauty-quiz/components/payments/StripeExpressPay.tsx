"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useQuizStore } from '@/store/quizStore'

// Minimal, optional Stripe Payment Request button wrapper.
// Renders Apple/Google Pay if Stripe is available and the device supports it.
// Falls back to a simple placeholder button when Stripe is not configured.

type Props = {
  amountCents: number; // amount in the smallest currency unit
  currency?: string; // default 'usd'
  label?: string; // default 'Total'
  onSuccess?: () => void; // called when payment succeeds (placeholder for now)
};

export default function StripeExpressPay({ amountCents, currency = "usd", label = "Total", onSuccess }: Props) {
  const [ready, setReady] = useState(false);
  const [supportsPRB, setSupportsPRB] = useState(false);
  const [StripePkg, setStripePkg] = useState<any>(null);
  const [ReactStripe, setReactStripe] = useState<any>(null);
  const [stripePromise, setStripePromise] = useState<any>(null);
  const sessionId = useQuizStore(s => s.sessionId)
  const userId = useQuizStore(s => s.answers.Id)

  const pubKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!pubKey) {
        setReady(true);
        return;
      }
      try {
        const stripeJs = await import("@stripe/stripe-js");
        const reactStripe = await import("@stripe/react-stripe-js");
        if (!mounted) return;
        const promise = stripeJs.loadStripe(pubKey);
        setStripePkg(stripeJs);
        setReactStripe(reactStripe as any);
        setStripePromise(promise);
        setReady(true);
      } catch (e) {
        // stripe not installed or failed to load
        setReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [pubKey]);

  const Placeholder = (
    <button
      type="button"
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-base font-semibold text-white"
      onClick={() => {
        // Placeholder: without backend, we cannot complete payment.
        // Act as a no-op or call onSuccess for demo flow.
        onSuccess?.();
      }}
    >
      <span> Pay / G Pay</span>
    </button>
  );

  if (!ready || !StripePkg || !ReactStripe || !stripePromise) {
    // Not configured or still loading: show placeholder
    return Placeholder;
  }

  const Elements = (ReactStripe as any).Elements as React.ComponentType<any>;
  const PaymentRequestButtonElement = (ReactStripe as any).PaymentRequestButtonElement as React.ComponentType<any>;
  const useStripe = (ReactStripe as any).useStripe as () => any;

  function Inner() {
    const stripe = useStripe();
    const [paymentRequest, setPaymentRequest] = useState<any>(null);

    useEffect(() => {
      if (!stripe) return;
      const pr = stripe.paymentRequest({
        country: "US",
        currency,
        total: { label, amount: amountCents },
        requestPayerName: true,
        requestPayerEmail: true,
      });
      pr.canMakePayment().then((result: any) => {
        if (result) {
          setSupportsPRB(true);
          setPaymentRequest(pr);
        }
      });

      pr.on("paymentmethod", async (ev: any) => {
        // Create + confirm a PaymentIntent on the server using the received paymentMethod
        try {
          const resp = await fetch('/api/pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: amountCents, currency, paymentMethodId: ev.paymentMethod.id, sessionId, userId })
          });
          if (!resp.ok) {
            const text = await resp.text().catch(() => '');
            console.warn('Payment error:', text);
            try { ev.complete('fail'); } catch {}
            return;
          }
          const data = await resp.json();
          if (data.status === 'succeeded' || data.status === 'requires_capture' || data.status === 'processing') {
            try { ev.complete('success'); } catch {}
            onSuccess?.();
          } else if (data.status === 'requires_action' && data.clientSecret) {
            // Handle extra auth (3DS) if required
            const result = await stripe?.confirmCardPayment(data.clientSecret);
            if (result?.error) {
              console.warn('3DS failed', result.error.message);
              try { ev.complete('fail'); } catch {}
            } else {
              try { ev.complete('success'); } catch {}
              onSuccess?.();
            }
          } else {
            try { ev.complete('fail'); } catch {}
          }
        } catch (e) {
          console.warn('PRB payment exception', e);
          try { ev.complete('fail'); } catch {}
        }
      });
    }, [stripe]);

    if (!supportsPRB || !paymentRequest) return Placeholder;

    return (
      <div className="w-full overflow-hidden rounded-full">
        <PaymentRequestButtonElement
          options={{
            paymentRequest,
            style: { paymentRequestButton: { type: "buy", theme: "dark", height: "44px" } },
          }}
        />
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <Inner />
    </Elements>
  );
}
