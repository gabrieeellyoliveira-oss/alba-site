import { describe, it, expect } from "vitest";
import { leadSchema, maskWhatsapp } from "./lead-schema";

const base = { nome: "Ana", email: "ana@empresa.com", empresa: "X", whatsapp: "(11) 98765-4321", faixa_parceiros: "11 a 30", plano_interesse: "Pro" };

describe("lead", () => {
  it("aceita lead válido", () => expect(leadSchema.safeParse(base).success).toBe(true));
  it("rejeita e-mail inválido", () => expect(leadSchema.safeParse({ ...base, email: "ana" }).success).toBe(false));
  it("rejeita WhatsApp fora da máscara", () => expect(leadSchema.safeParse({ ...base, whatsapp: "1198" }).success).toBe(false));
  it("limita texto livre a 1000", () => expect(leadSchema.safeParse({ ...base, como_acompanham: "a".repeat(1001) }).success).toBe(false));
  it("aplica máscara", () => expect(maskWhatsapp("11987654321")).toBe("(11) 98765-4321"));
});
