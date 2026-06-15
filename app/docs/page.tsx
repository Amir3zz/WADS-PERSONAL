"use client";

import SwaggerUI from "swagger-ui-react";

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
        <section className="mb-6 rounded-2xl border bg-card p-6 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight">
            API Documentation
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Interactive Swagger documentation for the Boardside backend. The
            spec is served from <code>/api/docs</code>.
          </p>
        </section>

        <section className="overflow-hidden rounded-2xl border bg-background shadow-sm">
          <SwaggerUI
            url="/api/docs"
            docExpansion="list"
            defaultModelsExpandDepth={1}
            displayRequestDuration
            persistAuthorization
          />
        </section>
      </div>
    </main>
  );
}