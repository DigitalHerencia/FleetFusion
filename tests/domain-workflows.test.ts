import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Prisma } from "../generated/prisma/client";
import { calculateInvoiceTotals } from "../lib/db/transactions/create-invoice.tx";
import { updateDealStageTx } from "../lib/db/transactions/update-deal-stage.tx";
import { updateTaskStatusTx } from "../lib/db/transactions/update-task-status.tx";
import {
  createContactSchema,
  createCrmDealSchema,
} from "../schemas/crmSchemas";
import { createTaskSchema } from "../schemas/projectsSchemas";
import { audienceFormSchema } from "../schemas/marketingSchemas";
import { expenseFormSchema } from "../schemas/invoicingSchemas";
import { CrmPipelineTemplate } from "../components/templates/crmPipelineTemplate";
import { ProjectsTemplate } from "../components/templates/projectsTemplate";
import { InvoicingInvoiceDetailTemplate } from "../components/templates/invoicingInvoiceDetailTemplate";
import type { InvoiceDTO } from "../types/invoicingTypes";

const id = "00000000-0000-4000-8000-000000000001";

test("contact forms validate actual contact fields and reject the old generic payload", () => {
  assert.equal(
    createContactSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      status: "ACTIVE",
    }).success,
    false,
  );
  assert.equal(
    createContactSchema.safeParse({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      phone: "",
      title: "Engineer",
      status: "LEAD",
    }).success,
    true,
  );
});
test("opportunities reject invalid account references and probabilities", () => {
  assert.equal(
    createCrmDealSchema.safeParse({ accountId: "other", name: "Deal" }).success,
    false,
  );
  assert.equal(
    createCrmDealSchema.safeParse({
      accountId: id,
      name: "Deal",
      probability: 101,
    }).success,
    false,
  );
});
test("tasks reject arbitrary status-like priority and require a project", () => {
  assert.equal(
    createTaskSchema.safeParse({
      title: "Deliver",
      priority: "ACTIVE",
      projectId: id,
    }).success,
    false,
  );
  assert.equal(
    createTaskSchema.safeParse({ title: "Deliver", priority: "HIGH" }).success,
    false,
  );
  assert.equal(
    createTaskSchema.parse({ title: "Deliver", projectId: id }).priority,
    "MEDIUM",
  );
});
test("audience editor rejects unsupported definitions rather than overwriting them", () => {
  assert.equal(
    audienceFormSchema.safeParse({
      name: "Customers",
      status: "ACTIVE",
      definition: { operator: "or", rules: [] },
    }).success,
    false,
  );
  assert.equal(
    audienceFormSchema.safeParse({
      name: "Customers",
      status: "ACTIVE",
      definition: {
        operator: "and",
        rules: [{ field: "status", operator: "equals", value: "active" }],
      },
    }).success,
    true,
  );
});
test("expenses reject nonpositive amounts and invalid dates", () => {
  const input = {
    vendor: "Vendor",
    description: "Travel",
    currency: "USD",
    incurredAt: "2026-09-08",
  };
  assert.equal(
    expenseFormSchema.safeParse({ ...input, amount: "0" }).success,
    false,
  );
  assert.equal(
    expenseFormSchema.safeParse({ ...input, amount: "-10" }).success,
    false,
  );
  assert.equal(
    expenseFormSchema.safeParse({
      ...input,
      amount: "10",
      incurredAt: "invalid",
    }).success,
    false,
  );
});
test("invoice totals preserve decimal precision and tax rounding", () => {
  const totals = calculateInvoiceTotals([
    { quantity: "3", unitPrice: "0.1", taxRate: "0.0825" },
    { quantity: "2.5", unitPrice: "12.3456", taxRate: "0" },
  ]);
  assert.equal(totals.subtotal.toString(), "31.164");
  assert.equal(totals.taxTotal.toString(), "0.0248");
  assert.equal(totals.total.toString(), "31.1888");
  assert.throws(
    () =>
      calculateInvoiceTotals([
        { quantity: "0", unitPrice: "10", taxRate: "0" },
      ]),
    /invalid/,
  );
});
test("pipeline rejects invalid stage transitions before writing", async () => {
  let writes = 0;
  const tx = {
    crmDeal: {
      findFirstOrThrow: async () => ({ stage: "LEAD" }),
      updateMany: async () => {
        writes++;
        return { count: 1 };
      },
    },
  } as unknown as Prisma.TransactionClient;
  await assert.rejects(
    updateDealStageTx(tx, {
      organizationId: "tenant-a",
      dealId: id,
      stage: "WON",
      expectedVersion: 2,
    }),
    /cannot move/,
  );
  assert.equal(writes, 0);
});
test("pipeline stage changes retain tenant and version predicates", async () => {
  let read = 0;
  const tx = {
    crmDeal: {
      findFirstOrThrow: async () => (++read === 1 ? { stage: "LEAD" } : { id }),
      updateMany: async ({
        where,
      }: {
        where: { organizationId: string; version: number };
      }) => {
        assert.equal(where.organizationId, "tenant-a");
        assert.equal(where.version, 2);
        return { count: 0 };
      },
    },
  } as unknown as Prisma.TransactionClient;
  await assert.rejects(
    updateDealStageTx(tx, {
      organizationId: "tenant-a",
      dealId: id,
      stage: "QUALIFIED",
      expectedVersion: 2,
    }),
    /changed after/,
  );
});
test("task updates reject stale versions instead of reporting success", async () => {
  const tx = {
    task: {
      updateMany: async ({
        where,
      }: {
        where: { organizationId: string; version: number };
      }) => {
        assert.equal(where.organizationId, "tenant-a");
        assert.equal(where.version, 4);
        return { count: 0 };
      },
    },
  } as unknown as Prisma.TransactionClient;
  await assert.rejects(
    updateTaskStatusTx(tx, {
      organizationId: "tenant-a",
      taskId: id,
      status: "DONE",
      expectedVersion: 4,
    }),
    /changed after/,
  );
});
test("CRM pipeline renders opportunity stages and value without a generic table or fake trend", () => {
  const html = renderToStaticMarkup(
    createElement(CrmPipelineTemplate, {
      deals: [
        {
          id,
          name: "Annual renewal",
          stage: "PROPOSAL",
          value: "1250.00",
          currency: "EUR",
          probability: 70,
          expectedCloseDate: "2026-10-01",
          version: 1,
          account: { id, name: "Acme" },
          owner: null,
        },
      ],
      toolbar: null,
      renderControls: () => null,
    }),
  );
  assert.match(html, /PROPOSAL/);
  assert.match(html, /Annual renewal/);
  assert.match(html, /1250.00/);
  assert.match(html, /Acme/);
  assert.doesNotMatch(html, /<table|Pipeline trend|SERVER/);
});
test("project portfolio renders delivery progress and links to the actual project", () => {
  const html = renderToStaticMarkup(
    createElement(ProjectsTemplate, {
      projects: [
        {
          id,
          name: "Website delivery",
          description: "Acceptance brief",
          status: "ACTIVE",
          startsAt: null,
          dueAt: "2026-10-01",
          version: 1,
          taskCount: 5,
          openTaskCount: 2,
        },
      ],
      toolbar: null,
    }),
  );
  assert.match(html, /3 of 5 tasks closed/);
  assert.match(html, /<progress/);
  assert.match(html, new RegExp(`/projects/${id}/timeline`));
  assert.doesNotMatch(html, /<table/);
});
test("invoice detail renders persisted line items and calculated total", () => {
  const invoice: InvoiceDTO = {
    id,
    number: 42,
    customerName: "Acme",
    customerEmail: null,
    currency: "USD",
    subtotal: "100",
    taxTotal: "5",
    total: "105",
    status: "DRAFT",
    issuedAt: null,
    dueAt: null,
    paidAt: null,
    approvedAt: null,
    approvedBy: null,
    version: 1,
    createdAt: "2026-09-08",
    updatedAt: "2026-09-08",
    lines: [
      {
        id,
        position: 1,
        description: "Design services",
        quantity: "2",
        unitPrice: "50",
        taxRate: "0.05",
        lineSubtotal: "100",
        lineTax: "5",
        lineTotal: "105",
      },
    ],
  };
  const html = renderToStaticMarkup(
    createElement(InvoicingInvoiceDetailTemplate, { invoice }, null),
  );
  assert.match(html, /Design services/);
  assert.match(html, /Bill to/);
  assert.match(html, /105/);
  assert.doesNotMatch(html, /SERVER|Records/);
});
