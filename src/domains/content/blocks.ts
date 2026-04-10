import { z } from "zod";

export const blockTypeSchema = z.enum([
  "rich_text",
  "callout",
  "checklist",
  "download",
  "audio",
  "video",
  "quiz",
  "divider",
]);

export type BlockType = z.infer<typeof blockTypeSchema>;

const richTextPayloadSchema = z.object({
  markdown: z.string().min(1),
});

const calloutPayloadSchema = z.object({
  tone: z.enum(["info", "warning", "success"]),
  body: z.string().min(1),
});

const checklistPayloadSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
      }),
    )
    .min(1),
});

const downloadPayloadSchema = z.object({
  assetId: z.string().min(1),
  label: z.string().min(1),
});

const mediaPayloadSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
});

const quizPayloadSchema = z.object({
  question: z.string().min(1),
  answers: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        isCorrect: z.boolean(),
      }),
    )
    .min(2),
});

const dividerPayloadSchema = z.strictObject({});

const payloadSchemas = {
  rich_text: richTextPayloadSchema,
  callout: calloutPayloadSchema,
  checklist: checklistPayloadSchema,
  download: downloadPayloadSchema,
  audio: mediaPayloadSchema,
  video: mediaPayloadSchema,
  quiz: quizPayloadSchema,
  divider: dividerPayloadSchema,
} satisfies Record<BlockType, z.ZodTypeAny>;

type PayloadMap = {
  rich_text: z.infer<typeof richTextPayloadSchema>;
  callout: z.infer<typeof calloutPayloadSchema>;
  checklist: z.infer<typeof checklistPayloadSchema>;
  download: z.infer<typeof downloadPayloadSchema>;
  audio: z.infer<typeof mediaPayloadSchema>;
  video: z.infer<typeof mediaPayloadSchema>;
  quiz: z.infer<typeof quizPayloadSchema>;
  divider: z.infer<typeof dividerPayloadSchema>;
};

export function parseBlockPayload<T extends BlockType>(
  type: T,
  payloadJson: string,
): PayloadMap[T] {
  const payload = JSON.parse(payloadJson) as unknown;
  return payloadSchemas[type].parse(payload) as PayloadMap[T];
}
