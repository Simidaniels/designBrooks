"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { submitInquiryAction } from "@/lib/actions/inquiries";
import { inquirySchema } from "@/lib/validation";

const schema = inquirySchema.extend({
  preferredContact: z.enum(["email", "phone", "either"]).optional(),
});
type FormValues = z.infer<typeof schema>;

export function InquiryForm({ variant = "contact" }: { variant?: "contact" | "consultation" }) {
  const [submitted, setSubmitted] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { service: "", preferredContact: "either", website: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    const result = await submitInquiryAction(values);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    setSubmitted(true);
    reset();
  };

  if (submitted) {
    return (
      <div role="status" className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border border-success/30 bg-success-soft p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-success" aria-hidden="true" />
        <h3 className="mt-4 font-display text-3xl font-semibold text-ink">Enquiry received.</h3>
        <p className="mt-2 max-w-md text-[0.9rem] leading-relaxed text-muted">
          Thank you — a member of the studio will be in touch within two business days.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>
          Send another enquiry
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="name" required error={errors.name?.message}>
          <Input id="name" autoComplete="name" placeholder="Your name" {...register("name")} aria-invalid={!!errors.name} />
        </Field>
        <Field label="Email address" htmlFor="email" required error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} aria-invalid={!!errors.email} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone (optional)" htmlFor="phone" error={errors.phone?.message}>
          <Input id="phone" type="tel" autoComplete="tel" placeholder="+234 …" {...register("phone")} />
        </Field>
        <Field label="Service / project type" htmlFor="service" required error={errors.service?.message}>
          <Select id="service" {...register("service")} aria-invalid={!!errors.service} defaultValue="">
            <option value="" disabled>Choose a service…</option>
            <option>Residential</option>
            <option>Commercial</option>
            <option>Hospitality</option>
            <option>Cultural</option>
            <option>Interior Design</option>
            <option>Refurbishment</option>
            <option>Other</option>
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Project location (optional)" htmlFor="location">
          <Input id="location" placeholder="City, Country" {...register("location")} />
        </Field>
        <Field label="Preferred contact method" htmlFor="preferredContact">
          <Select id="preferredContact" {...register("preferredContact")}>
            <option value="either">Either is fine</option>
            <option value="email">Email</option>
            <option value="phone">Phone / WhatsApp</option>
          </Select>
        </Field>
      </div>

      <Field
        label={variant === "consultation" ? "Project brief" : "How can we help?"}
        htmlFor="brief"
        required
        error={errors.brief?.message}
        hint="Site, timeline, scope and anything you already know."
      >
        <Textarea id="brief" rows={5} placeholder="Tell us about the site, timeline, and scope…" {...register("brief")} aria-invalid={!!errors.brief} />
      </Field>

      {/* Honeypot — invisible to humans */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      {serverError && (
        <p role="alert" className="text-[0.82rem] font-semibold text-danger">{serverError}</p>
      )}

      <Button type="submit" size="lg" shape="pill" disabled={isSubmitting} className="mt-1 w-full sm:w-auto">
        {isSubmitting ? (
          <><Loader2 className="animate-spin" aria-hidden="true" /> Sending…</>
        ) : (
          <><Send aria-hidden="true" /> {variant === "consultation" ? "Request Consultation" : "Send Enquiry"}</>
        )}
      </Button>
    </form>
  );
}
