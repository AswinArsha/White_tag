// supabase/functions/send-whitetag-email/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM = "WhiteTag <no-reply@whitedogpetgrooming.com>";
const WEB_URL = Deno.env.get("PUBLIC_WEB_URL") ?? "https://white-tag.pages.dev";

type Stage = "new_signup" | "tag_writing" | "packed" | "out_for_delivery" | "delivered";

interface Payload {
  email: string;
  name?: string;
  petName?: string;
  username?: string; // preferred slug
  template?: Stage;
}

const BRAND = {
  bgOuter: "#F8FAFC",
  bgCard: "#FFFFFF",
  border: "#E5E7EB",
  text: "#111827",
  muted: "#6B7280",
  brand: "#4F46E5",
  summaryBg: "#F1F5F9",
};

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const esc = (v?: string) =>
  (v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// simple slugify fallback for pet name
function slugify(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

function button({ href, label }: { href: string; label: string }) {
  return `
  <!--[if mso]>
  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${href}"
    style="height:44px;v-text-anchor:middle;width:260px;" arcsize="14%" fillcolor="${BRAND.brand}" strokecolor="${BRAND.brand}">
    <w:anchorlock/>
    <center style="color:#ffffff;font-family:Segoe UI, Arial, sans-serif;font-size:16px;font-weight:bold;">
      ${esc(label)}
    </center>
  </v:roundrect>
  <![endif]-->
  <!--[if !mso]><!-- -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
    <tr>
      <td align="center" bgcolor="${BRAND.brand}" style="border-radius:10px;">
        <a href="${href}" style="display:inline-block;padding:12px 22px;text-decoration:none;background:${BRAND.brand};color:#ffffff;font-weight:700;border-radius:10px;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-size:16px;" target="_blank" rel="noopener">
          ${esc(label)}
        </a>
      </td>
    </tr>
  </table>
  <!--<![endif]-->`;
}

function timeline(current: Stage) {
  const steps: { key: Stage; label: string; emoji: string }[] = [
    { key: "new_signup", label: "Profile Created", emoji: "✅" },
    { key: "tag_writing", label: "Tag Engraving", emoji: "✍️" },
    { key: "packed", label: "Packed", emoji: "📦" },
    { key: "out_for_delivery", label: "Out for delivery", emoji: "🚚" },
    { key: "delivered", label: "Delivered", emoji: "🎉" },
  ];
  const activeIdx = steps.findIndex((s) => s.key === current);
  const rows = steps
    .map((s, i) => {
      const on = i <= activeIdx;
      const dot = on ? s.emoji : "•";
      const color = on ? BRAND.text : BRAND.muted;
      return `<tr>
        <td style="padding:2px 0;font-size:14px;color:${color};font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;">
          ${dot} ${s.label}
        </td>
      </tr>`;
    })
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">${rows}</table>`;
}

function wrapEmail({
  preheader = "",
  title,
  intro,
  summaryHtml = "",
  bodyHtml = "",
  ctaText,
  ctaHref,
  footerNote = "This is a transactional email related to your WhiteTag account.",
}: {
  preheader?: string;
  title: string;
  intro: string;
  summaryHtml?: string;
  bodyHtml?: string;
  ctaText?: string;
  ctaHref?: string;
  footerNote?: string;
}) {
  const cta = ctaText && ctaHref ? button({ href: ctaHref, label: ctaText }) : "";
  return `<!doctype html>
<html lang="en">
  <head>
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <title>${esc(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.bgOuter};">
    <div style="display:none;opacity:0;visibility:hidden;mso-hide:all;height:0;width:0;color:transparent;overflow:hidden;">
      ${esc(preheader)}
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${BRAND.bgOuter};padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:${BRAND.bgCard};border:1px solid ${BRAND.border};border-radius:14px;">
            <!-- Header (domain removed) -->
            <tr>
              <td style="padding:16px 20px;border-bottom:1px solid ${BRAND.border};">
                <table width="100%" role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-weight:800;font-size:18px;color:${BRAND.text};">
                      WhiteTag
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Title & Intro -->
            <tr>
              <td style="padding:22px 24px 8px 24px;">
                <h1 style="margin:0 0 8px 0;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-size:22px;line-height:28px;color:${BRAND.text};">
                  ${esc(title)}
                </h1>
                <p style="margin:0 0 12px 0;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;color:${BRAND.text};">
                  ${intro}
                </p>
              </td>
            </tr>

            <!-- Summary block -->
            ${
              summaryHtml
                ? `<tr><td style="padding:0 24px 12px 24px;">
                    <table role="presentation" width="100%" style="background:${BRAND.summaryBg};border-radius:10px;">
                      <tr><td style="padding:14px 16px;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;color:${BRAND.text};">
                        ${summaryHtml}
                      </td></tr>
                    </table>
                  </td></tr>`
                : ""
            }

            <!-- Body -->
            ${
              bodyHtml
                ? `<tr><td style="padding:0 24px 6px 24px;">
                    <div style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;line-height:22px;color:${BRAND.text};">
                      ${bodyHtml}
                    </div>
                  </td></tr>`
                : ""
            }

            <!-- CTA -->
            ${cta ? `<tr><td style="padding:8px 24px 18px 24px;">${cta}</td></tr>` : ""}

            <!-- Footer -->
            <tr>
              <td style="padding:16px 24px 20px 24px;border-top:1px solid ${BRAND.border};">
                <p style="margin:0 0 6px 0;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-size:12px;color:${BRAND.muted};">
                  — The WhiteTag Team
                </p>
                <p style="margin:0;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-size:12px;color:${BRAND.muted};">
                  ${esc(footerNote)}
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// Build the correct profile URL: https://white-tag.pages.dev/pet/<slug>
function buildProfileUrl(username?: string, petName?: string) {
  const slug = username && username.trim().length > 0
    ? username
    : petName
      ? slugify(petName)
      : "";
  return slug ? `${WEB_URL}/pet/${slug}` : WEB_URL;
}

function composeForStage(stage: Stage, data: Required<Pick<Payload, "name">> & Pick<Payload, "petName" | "username">) {
  const name = esc(data.name || "there");
  const pet = esc(data.petName || "your pet");
  const uname = esc(data.username || "");
  const profileUrl = buildProfileUrl(data.username, data.petName);

  // Summary block: Pet + Username, plus Status only for "out_for_delivery"
  const lines: string[] = [];
  if (data.petName) lines.push(`<tr><td><strong>Pet:</strong> ${pet}</td></tr>`);
  if (data.username) lines.push(`<tr><td><strong>Profile username:</strong> ${uname}</td></tr>`);
  if (stage === "out_for_delivery") {
    lines.push(`<tr><td><strong>Status:</strong> Out for delivery</td></tr>`);
  }
  const summary = lines.length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${lines.join("")}</table>${timeline(stage)}`
    : timeline(stage);

  const common = {
    summaryHtml: summary,
    ctaText: profileUrl ? "View Pet Profile" : undefined,
    ctaHref: profileUrl ? profileUrl : undefined,
  };

  switch (stage) {
    case "tag_writing":
      return {
        subject: `We’re engraving ${pet}’s WhiteTag ✍️`,
        html: wrapEmail({
          ...common,
          preheader: "Your WhiteTag is now being engraved.",
          title: "Tag Engraving In Progress",
          intro: `Hi ${name}, great news! We’ve started engraving your WhiteTag.`,
          bodyHtml: "We’ll notify you as soon as it’s packed and ready to ship.",
        }),
        text: `Hi ${data.name},\n\nWe’ve started engraving your WhiteTag for ${data.petName ?? "your pet"}.\n${profileUrl}\n— The WhiteTag Team`,
      };

    case "packed":
      return {
        subject: "Packed and ready to ship 📦",
        html: wrapEmail({
          ...common,
          preheader: "Your WhiteTag is packed and ready.",
          title: "All Packed!",
          intro: `Hi ${name}, your WhiteTag is carefully packed and ready to ship.`,
          bodyHtml: "We’ll let you know when it’s out for delivery.",
        }),
        text: `Hi ${data.name},\n\nYour WhiteTag is packed and ready to ship.\n${profileUrl}\n— The WhiteTag Team`,
      };

  case "out_for_delivery":
  return {
    subject: "Out for delivery 🚚",
    html: wrapEmail({
      ...common,
      preheader: "Your WhiteTag is on its way.",
      title: "It’s On The Way",
      intro: `Hi ${name}, your WhiteTag is out for delivery and will reach you within 7 working days.`,
      bodyHtml: "Thanks for your patience — we hope you and your pet love it!",
    }),
    text: `Hi ${data.name},\n\nYour WhiteTag is out for delivery and will reach you within 7 working days.\n${profileUrl}\n— The WhiteTag Team`,
  };


 case "delivered":
  return {
    subject: "Delivered 🎉",
    html: wrapEmail({
      ...common,
      preheader: "Your WhiteTag has been delivered.",
      title: "Delivered",
      intro: `Hi ${name}, your WhiteTag for ${pet} has been successfully delivered.`,
      bodyHtml: "We hope you and your pet love it! If anything looks off, just reply to this email and we’ll help right away.",
    }),
    text: `Hi ${data.name},\n\nYour WhiteTag for ${data.petName ?? "your pet"} has been delivered.\n${profileUrl}\n— The WhiteTag Team`,
  };


    default: // new_signup
      return {
        subject: "Your WhiteTag pet profile is ready 🎉",
        html: wrapEmail({
          ...common,
          preheader: "Your WhiteTag account is ready.",
          title: "Welcome to WhiteTag",
          intro: `Hi ${name}, your pet profile has been created successfully.`,
          bodyHtml: "We’ll keep you updated as we engrave, pack, and ship your tag. Thanks for joining the WhiteTag family! 🐾",
        }),
        text: [
          `Hi ${data.name},`,
          ``,
          `Your pet profile has been created successfully.`,
          data.petName ? `Pet: ${data.petName}` : undefined,
          data.username ? `Profile username: ${data.username}` : undefined,
          profileUrl ? `View pet profile: ${profileUrl}` : undefined,
          ``,
          `— The WhiteTag Team`,
        ]
          .filter(Boolean)
          .join("\n"),
      };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { email, name, petName, username, template } = (await req.json()) as Payload;
    if (!email) {
      return new Response(JSON.stringify({ ok: false, error: "Missing 'email'" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    const stage: Stage = (template as Stage) ?? "new_signup";
    const composed = composeForStage(stage, { name: name ?? "there", petName, username });

    const body = {
      from: FROM,
      to: email,
      subject: composed.subject,
      html: composed.html,
      text: composed.text,
    };

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) throw new Error(await resp.text());

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json", ...cors },
    });
  } catch (err) {
    console.error("Email error:", err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...cors },
    });
  }
});
