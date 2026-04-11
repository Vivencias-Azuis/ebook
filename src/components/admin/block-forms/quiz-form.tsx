import {
  deleteBlockAction,
  updateBlockAction,
} from "@/app/admin/editor/actions";
import type { EditorBlock } from "@/domains/admin/editor-queries";

export function QuizForm({
  block,
  payload,
  productId,
}: {
  block: EditorBlock;
  payload: {
    question: string;
    answers: { id: string; label: string; isCorrect: boolean }[];
  };
  productId: string;
}) {
  return (
    <div className="grid gap-4">
      <form
        action={async (formData: FormData) => {
          "use server";
          const entries = Array.from(formData.entries());
          const answerIds = entries
            .filter(([key]) => key.startsWith("answer-id-"))
            .map(([, value]) => String(value));
          const answers = answerIds.map((id) => ({
            id,
            label: String(formData.get(`answer-label-${id}`) || ""),
            isCorrect: formData.get(`answer-correct-${id}`) === "on",
          }));
          await updateBlockAction(productId, block.id, {
            title: String(formData.get("title") || "") || null,
            payloadJson: JSON.stringify({
              question: String(formData.get("question") || ""),
              answers,
            }),
            isPublished: formData.get("isPublished") === "on",
          });
        }}
        className="grid gap-4"
      >
        <label className="grid gap-2">
          <span className="text-sm font-medium">Título</span>
          <input
            name="title"
            defaultValue={block.title ?? ""}
            className="rounded-xl border bg-white px-4 py-3"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium">Pergunta</span>
          <input
            name="question"
            defaultValue={payload.question}
            className="rounded-xl border bg-white px-4 py-3"
          />
        </label>
        <div className="grid gap-2">
          <span className="text-sm font-medium">Respostas</span>
          {payload.answers.map((answer) => (
            <label key={answer.id} className="flex items-center gap-3">
              <input
                type="hidden"
                name={`answer-id-${answer.id}`}
                value={answer.id}
              />
              <input
                type="checkbox"
                name={`answer-correct-${answer.id}`}
                defaultChecked={answer.isCorrect}
                className="h-4 w-4 rounded"
              />
              <input
                name={`answer-label-${answer.id}`}
                defaultValue={answer.label}
                className="flex-1 rounded-xl border bg-white px-4 py-3"
              />
            </label>
          ))}
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={block.isPublished}
          />
          <span className="text-sm">Publicado</span>
        </label>
        <button
          type="submit"
          className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white"
        >
          Salvar bloco
        </button>
      </form>
      <form
        action={async () => {
          "use server";
          await deleteBlockAction(productId, block.id);
        }}
      >
        <button
          type="submit"
          className="rounded-full border px-4 py-2 text-sm font-medium"
        >
          Excluir
        </button>
      </form>
    </div>
  );
}
