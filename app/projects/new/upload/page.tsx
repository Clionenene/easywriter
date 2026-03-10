"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function NewUploadPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState("auto");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!file || !title) return;
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("documentType", documentType);
      formData.append("file", file);

      const created = await fetch("/api/projects", {
        method: "POST",
        body: formData
      }).then((r) => r.json());

      if (!created.id) throw new Error(created.error || "作成に失敗しました");
      router.push(`/projects/${created.id}/upload`);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Card className="space-y-4">
        <h1 className="text-xl font-bold">1. 文書アップロード</h1>
        <Input placeholder="プロジェクト名" value={title} onChange={(e) => setTitle(e.target.value)} />
        <select className="w-full rounded-md border px-3 py-2" value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
          <option value="auto">自動判定</option>
          <option value="paper">学術論文</option>
          <option value="grant_proposal">助成金申請書</option>
          <option value="research_plan">研究計画書</option>
          <option value="essay">エッセイ</option>
          <option value="other">その他</option>
        </select>
        <Input type="file" accept=".txt,.md,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <Button onClick={handleSubmit} disabled={!file || !title || loading}>{loading ? "作成中..." : "プロジェクト作成"}</Button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </Card>
    </main>
  );
}
