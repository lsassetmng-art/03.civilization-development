"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { StatusMessage } from "../../components/feedback/status-message";
import { getGatewaySessionSummary } from "../../services/civilization-auth/auth-gateway";
import {
  requestPublicSupportCenterGet,
  requestPublicSupportContactSubmit,
} from "../../services/portal-api/support-client";
import type {
  PortalContactChannelItem,
  PortalHelpArticleItem,
  PortalPolicyDocumentItem,
} from "../../types/portal-support-api";
import { ROUTES } from "../../lib/routing/routes";

type SupportMode = "help" | "policy" | "terms" | "contact";

type SupportCenterPageProps = {
  mode: SupportMode;
};

const PAGE_META: Record<
  SupportMode,
  {
    eyebrow: string;
    title: string;
    description: string;
  }
> = {
  help: {
    eyebrow: "Help Center",
    title: "Help",
    description: "Find guidance about portal entry, launcher usage, and supported navigation flows.",
  },
  policy: {
    eyebrow: "Policy Center",
    title: "Policy",
    description: "Review privacy, support handling, and operational policy summaries.",
  },
  terms: {
    eyebrow: "Terms Center",
    title: "Terms",
    description: "Read service terms, availability notes, and operational conditions.",
  },
  contact: {
    eyebrow: "Support Contact",
    title: "Contact",
    description: "Submit support requests and review the approved support contact channels.",
  },
};

export function SupportCenterPage({
  mode,
}: SupportCenterPageProps) {
  const [helpArticles, setHelpArticles] = useState<PortalHelpArticleItem[]>([]);
  const [policyDocuments, setPolicyDocuments] = useState<PortalPolicyDocumentItem[]>([]);
  const [termsDocuments, setTermsDocuments] = useState<PortalPolicyDocumentItem[]>([]);
  const [contactChannels, setContactChannels] = useState<PortalContactChannelItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [category, setCategory] =
    useState<"general" | "policy" | "technical" | "account">("general");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [replyEmail, setReplyEmail] = useState("");

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        const session = getGatewaySessionSummary();
        const response = await requestPublicSupportCenterGet({
          surface: mode,
          session,
        });

        if (!active) {
          return;
        }

        setHelpArticles(response.data.helpArticles);
        setPolicyDocuments(response.data.policyDocuments);
        setTermsDocuments(response.data.termsDocuments);
        setContactChannels(response.data.contactChannels);
      } catch (error) {
        if (!active) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Support center could not be loaded.";

        setErrorMessage(message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      active = false;
    };
  }, [mode]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setSubmitMessage(null);

      const session = getGatewaySessionSummary();

      const response = await requestPublicSupportContactSubmit({
        session,
        category,
        subject,
        body,
        replyEmail: replyEmail || undefined,
      });

      setSubmitMessage(`Support request received: ${response.data.item.id}`);
      setSubject("");
      setBody("");
      setReplyEmail("");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Support request could not be submitted.";

      setSubmitMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-stack">
      <PageTitleBlock
        eyebrow={PAGE_META[mode].eyebrow}
        title={PAGE_META[mode].title}
        description={PAGE_META[mode].description}
      />

      <section className="page-section">
        <article className="card">
          <div className="button-row">
            <Link href={ROUTES.help} className="secondary-button">
              Help
            </Link>
            <Link href={ROUTES.policy} className="secondary-button">
              Policy
            </Link>
            <Link href={ROUTES.terms} className="secondary-button">
              Terms
            </Link>
            <Link href={ROUTES.contact} className="secondary-button">
              Contact
            </Link>
          </div>
        </article>
      </section>

      {loading ? (
        <StatusMessage
          title="Loading support center"
          message="Reading help, policy, terms, and contact resources."
          variant="info"
        />
      ) : null}

      {errorMessage ? (
        <StatusMessage
          title="Support center fallback active"
          message={errorMessage}
          variant="warning"
        />
      ) : null}

      {mode === "help" ? (
        <section className="page-section">
          <h2 className="section-title">Help articles</h2>
          <div className="grid-2">
            {helpArticles.map((item) => (
              <article key={item.id} className="card">
                <p className="eyebrow">{item.category.toUpperCase()}</p>
                <h3 className="card-title">{item.title}</h3>
                <p className="card-copy">{item.summary}</p>
                <p className="meta-text">{item.body}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {mode === "policy" ? (
        <section className="page-section">
          <h2 className="section-title">Policy documents</h2>
          <div className="grid-2">
            {policyDocuments.map((item) => (
              <article key={item.id} className="card">
                <p className="eyebrow">{item.versionLabel}</p>
                <h3 className="card-title">{item.title}</h3>
                <p className="card-copy">{item.summary}</p>
                <p className="meta-text">Effective: {item.effectiveDate}</p>
                <p className="meta-text">{item.body}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {mode === "terms" ? (
        <section className="page-section">
          <h2 className="section-title">Terms documents</h2>
          <div className="grid-2">
            {termsDocuments.map((item) => (
              <article key={item.id} className="card">
                <p className="eyebrow">{item.versionLabel}</p>
                <h3 className="card-title">{item.title}</h3>
                <p className="card-copy">{item.summary}</p>
                <p className="meta-text">Effective: {item.effectiveDate}</p>
                <p className="meta-text">{item.body}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {mode === "contact" ? (
        <>
          <section className="page-section">
            <h2 className="section-title">Contact channels</h2>
            <div className="grid-2">
              {contactChannels.map((item) => (
                <article key={item.id} className="card">
                  <p className="eyebrow">{item.channelType.toUpperCase()}</p>
                  <h3 className="card-title">{item.title}</h3>
                  <p className="card-copy">{item.description}</p>
                  <p className="meta-text">{item.availability}</p>
                  {item.href ? (
                    <div className="button-row">
                      <Link href={item.href} className="button-link">
                        Open
                      </Link>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </section>

          {submitMessage ? (
            <StatusMessage
              title="Support submission"
              message={submitMessage}
              variant="success"
            />
          ) : null}

          <section className="page-section">
            <h2 className="section-title">Submit support request</h2>
            <article className="card">
              <form onSubmit={handleSubmit} className="stack">
                <label className="field-block">
                  <span className="label-text">Category</span>
                  <select
                    className="select-input"
                    value={category}
                    onChange={(event) =>
                      setCategory(
                        event.target.value as
                          | "general"
                          | "policy"
                          | "technical"
                          | "account",
                      )
                    }
                  >
                    <option value="general">general</option>
                    <option value="policy">policy</option>
                    <option value="technical">technical</option>
                    <option value="account">account</option>
                  </select>
                </label>

                <label className="field-block">
                  <span className="label-text">Subject</span>
                  <input
                    className="text-input"
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    placeholder="Support request subject"
                  />
                </label>

                <label className="field-block">
                  <span className="label-text">Reply email</span>
                  <input
                    className="text-input"
                    value={replyEmail}
                    onChange={(event) => setReplyEmail(event.target.value)}
                    placeholder="reply@example.com"
                  />
                </label>

                <label className="field-block">
                  <span className="label-text">Message</span>
                  <textarea
                    className="text-area"
                    rows={6}
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    placeholder="Describe the issue or request"
                  />
                </label>

                <div className="button-row">
                  <button
                    type="submit"
                    className="button-link"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Support Request"}
                  </button>
                </div>
              </form>
            </article>
          </section>
        </>
      ) : null}
    </div>
  );
}
