import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const registerVisitorCount = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      visitorId: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const { registerVisitor } = await import("../visitor-counter.server");
    return registerVisitor(data.visitorId);
  });
