"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function DraftPage() {
  const params = useParams<{ id: string }>();
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/projects/${params.id}/draft`)
      .then((r) => r.json())
      .then((d) => setMarkdown(d.markdown || ""));
  }, [params.id]);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <Card className="space-y-3">
        <h1 className="text-xl font-bold">6. 最終統合画面</h1>
        <p className="text-sm text-slate-600">下書きを編集して Markdown として保存できます。</p>
        <Textarea rows={24} value={markdown} onChange={(e) => setMarkdown(e.target.value)} />
      </Card>
    </main>
  );
}
