"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectActions } from "@/components/project-actions";

export default function AnalyzeTriggerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [models, setModels] = useState<string[]>(["gpt-4.1-mini"]);
  const [model, setModel] = useState("gpt-4.1-mini");
  const [warning, setWarning] = useState("");

  useEffect(() => {
    fetch("/api/models")
      .then((r) => r.json())
      .then((json) => {
        const list = Array.isArray(json.models) && json.models.length > 0 ? json.models : ["gpt-4.1-mini"];
        setModels(list);
        setModel(list[0]);
        if (json.warning) setWarning(json.warning);
      })
      .catch(() => {
        setModels(["gpt-4.1-mini", "gpt-4o-mini", "gpt-4.1", "gpt-4o"]);
        setModel("gpt-4.1-mini");
      });
  }, []);

  async function startAnalysis() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${params.id}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = json.detail ? `\n詳細: ${json.detail}` : "";
        throw new Error(`${json.error || "解析失敗"}${detail}`);
      }
      router.push(`/projects/${params.id}/analysis`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <ProjectActions projectId={params.id} />
      <Card className="space-y-4">
        <h1 className="text-xl font-bold">2. 解析開始</h1>
        <p className="text-slate-600">文書を3層（構造・論理・執筆行動）で分析し、30個以上の実行タスクへ分解します。</p>
        <div className="space-y-1">
          <label className="text-sm font-medium">解析モデル</label>
          <select className="w-full rounded border px-3 py-2 text-sm" value={model} onChange={(e) => setModel(e.target.value)}>
            {models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          {warning && <p className="text-xs text-amber-700">{warning}</p>}
        </div>
        <Button onClick={startAnalysis} disabled={loading}>{loading ? "解析中..." : "解析開始"}</Button>
        {error && <pre className="whitespace-pre-wrap rounded bg-red-50 p-3 text-sm text-red-700">{error}</pre>}
      </Card>
    </main>
  );
}
