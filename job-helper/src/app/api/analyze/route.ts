import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getActor } from "@/lib/actor";

const MAX_PER_DAY = parseInt(process.env.DAILY_LIMIT || "50", 10);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

type DbSkill = { id: number; name: string };

function norm(s: string) {
  return s.toLowerCase().trim();
}

export async function GET() {
  return NextResponse.json({ ok: true, ping: "pong" });
}

export async function POST(req: NextRequest) {
  try {
    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: "Silly you need an OPENAI key env" }, { status: 500 });
    }

    const actor = getActor(req);
    const { data: usageCount, error: usageErr } = await supabaseAdmin.rpc("increment_usage", { p_actor: actor });
    if (usageErr) return NextResponse.json({ error: "Whoopsss... Usage tracking failed" }, { status: 500 });
    const used = Number(usageCount ?? 0);
    if (used > MAX_PER_DAY) {
      return NextResponse.json(
        { error: `This guy is cheap, he limited usage. Try again tomorrow. (${MAX_PER_DAY}/day)` },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const jobDescription = String(body?.jobDescription || "").trim();
    if (!jobDescription) return NextResponse.json({ error: "D'oh Missing jobDescription" }, { status: 400 });

    const { data: skills, error: skillsErr } = await supabaseAdmin
      .from("skills")
      .select("id,name")
      .order("name", { ascending: true });

    if (skillsErr) return NextResponse.json({ error: "Err can't load skills" }, { status: 500 });

    const canon: DbSkill[] = skills || [];
    const canonByNorm = new Map(canon.map((s) => [norm(s.name), s]));

    const prompt = [
      "Extract ALL skill-like words from the job description (technologies, tools, languages, frameworks, security standards, cloud services, or like that).",
      "Return STRICT JSON with a single key 'skills_raw' which is an array of short strings.",
      "Do NOT include explanations or extra keys.",
      "",
      "Job Description:",
      jobDescription,
    ].join("\n");

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You can only output compact JSON only." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text().catch(() => "");
      console.error("OpenAI error:", aiRes.status, t);
      return NextResponse.json({ error: "Darn... OpenAI bombed out on the call" }, { status: 502 });
    }

    const aiJson = await aiRes.json();
    let skillsRaw: string[] = [];
    try {
      const content = aiJson?.choices?.[0]?.message?.content || "{}";
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed?.skills_raw)) skillsRaw = parsed.skills_raw.map((x: any) => String(x));
    } catch {
      skillsRaw = [];
    }

    const rawNorm = Array.from(new Set(skillsRaw.map(norm))).filter(Boolean);

    // Separate mattched and not matched keywords here
    const matchedSet = new Set<string>();
    const matched: DbSkill[] = [];
    for (const n of rawNorm) {
      const hit = canonByNorm.get(n);
      if (hit && !matchedSet.has(hit.name)) {
        matchedSet.add(hit.name);
        matched.push(hit);
      }
    }


    const gaps = rawNorm
      .filter((n) => !canonByNorm.has(n))
      .map((n) => n)
      .slice(0, 20);


    const scoreBase = matched.length + gaps.length;
    const score = scoreBase === 0 ? 0 : Math.round((matched.length / scoreBase) * 100);

    return NextResponse.json({
      score,
      matched,
      gaps,
      limit: { used, remaining: Math.max(0, MAX_PER_DAY - used), max: MAX_PER_DAY },
    });
    // Handle the error
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Ohh shit" }, { status: 500 });
  }
}
