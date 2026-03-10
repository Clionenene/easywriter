"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { NextElementResponse, SubmissionFeedback } from "@/types/domain";

type LearnState = {
  next: NextElementResponse["next"];
  stats: {
    completed: number;
    total: number;
    rate: number;
    xp: number;
    level: number;
    streakDays: number;
  };
};

export default function LearnPage() {
  const params = useParams<{ id: string }>();
  const [state, setState] = useState<LearnState | null>(null);
  const [content, setContent] = useState("");
  const [feedback, setFeedback] = useState<SubmissionFeedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function loadNext() {
    setLoading(true);
    const json: LearnState = await fetch(`/api/projects/${params.id}/next`).then((r) => r.json());
    setState(json);
    setContent(json.next?.userOutput || "");
    setFeedback(null);
    setLoading(false);
  }

  useEffect(() => {
    loadNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit() {
    if (!state?.next) return;
    setSubmitting(true);
    const res = await fetch(`/api/elements/${state.next.id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content })
    });
    const json = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setFeedback({
        strengths: [],
        gaps: [json.error || "送信失敗"],
        suggestions: ["もう一度入力内容を見直してください"],
        next_sentence: "",
        passed: false,
        score: 0,
        summary: json.error || "送信失敗"
      });
      return;
    }

    setFeedback(json.feedback);
    await loadNext();
  }

  if (loading || !state) return <main className="p-6">ロード中...</main>;

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <Card className="space-y-2">
        <h1 className="text-xl font-bold">4. 学習画面（今やるべき1問）</h1>
        <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          <div>進捗: {state.stats.rate}%</div>
          <div>XP: {state.stats.xp}</div>
          <div>Level: {state.stats.level}</div>
          <div>Streak: {state.stats.streakDays}日</div>
        </div>
        <Progress value={state.stats.rate} />
      </Card>

      {!state.next ? (
        <Card>
          <p className="font-semibold">全タスク完了です！🎉</p>
          <Link className="text-blue-600" href={`/projects/${params.id}/draft`}>
            最終統合画面へ
          </Link>
        </Card>
      ) : (
        <>
          <Card className="space-y-3 border-2 border-brand-500">
            <div className="text-xs text-slate-500">{state.next.category} / 難易度 {state.next.difficulty} / {state.next.estimatedMinutes}分</div>
            <h2 className="text-lg font-semibold">{state.next.title}</h2>
            <p><strong>目的:</strong> {state.next.description}</p>
            <p><strong>なぜ必要か:</strong> {state.next.whyNeeded || "説得力のある文書にするため"}</p>
            <p><strong>完了条件:</strong> {state.next.completionCriteria}</p>
            <p><strong>良い例:</strong> {state.next.exampleOutput}</p>
            <p><strong>悪い例:</strong> {state.next.badExample || "抽象的で検証不能"}</p>
            <p><strong>書き出しヒント:</strong> {state.next.hint || "まず対象・主張・根拠を1文ずつ"}</p>
          </Card>

          <Card className="space-y-3">
            <Textarea rows={7} value={content} onChange={(e) => setContent(e.target.value)} placeholder="100〜300文字で回答してください" />
            <div className="flex gap-2">
              <Button onClick={submit} disabled={submitting || content.length < 20}>{submitting ? "送信中..." : "提出する"}</Button>
              <Button onClick={loadNext} className="bg-slate-600 hover:bg-slate-700">再読み込み</Button>
              <Link href={`/projects/${params.id}/map`}><Button className="bg-emerald-700 hover:bg-emerald-800">全体マップ</Button></Link>
            </div>
          </Card>
        </>
      )}

      {feedback && (
        <Card className="space-y-2">
          <h3 className="font-semibold">AIフィードバック</h3>
          <p><strong>総評:</strong> {feedback.summary}</p>
          <p><strong>次の1文候補:</strong> {feedback.next_sentence}</p>
          <p><strong>スコア:</strong> {feedback.score} / 100</p>
        </Card>
      )}
    </main>
  );
}
