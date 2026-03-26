"use client";

import SwaggerUI from "swagger-ui-react";

export default function DocsPage() {
  return (
    <div style={{ padding: "20px" }}>
      <SwaggerUI url="/api/docs" />
    </div>
  );
}