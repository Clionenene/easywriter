"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AnalyzeTriggerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startAnalysis() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${params.id}/analyze`, { method: "POST" });
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
    <main className="mx-auto max-w-3xl p-6">
      <Card className="space-y-4">
        <h1 className="text-xl font-bold">2. 解析開始</h1>
        <p className="text-slate-600">文書を3層（構造・論理・執筆行動）で分析し、30個以上の実行タスクへ分解します。</p>
        <Button onClick={startAnalysis} disabled={loading}>{loading ? "解析中..." : "解析開始"}</Button>
        {error && <pre className="whitespace-pre-wrap rounded bg-red-50 p-3 text-sm text-red-700">{error}</pre>}
      </Card>
    </main>
  );
}
