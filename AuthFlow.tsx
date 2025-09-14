import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export default function AuthFlow() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [researchInterests, setResearchInterests] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const auth = useAuth();

  const handleNext = () => setStep((s) => (s === 1 ? 2 : 3));
  const handleBack = () => setStep((s) => (s === 3 ? 2 : 1));

  const parsedResume = file
    ? {
        name: `${firstName || ""} ${lastName || ""}`.trim() || "(No name)",
        email: email || "(No email)",
        summary:
          "Experienced researcher with expertise in applied machine learning and data analysis.",
        experiences: [
          {
            role: "Research Assistant",
            org: "University Lab",
            years: "2021 - Present",
          },
        ],
        education: [
          {
            degree: "MSc Computer Science",
            school: "Your University",
            year: "2023",
          },
        ],
        skills: ["Python", "Machine Learning", "Data Analysis"],
      }
    : null;

  return (
    <div className="min-h-screen space-bg relative py-12">
      {/* Enhanced Cosmic Background Layers */}
      <div className="absolute inset-0 nebula-glow opacity-40"></div>
      <div className="absolute inset-0 cosmic-depth opacity-30"></div>
      <div className="absolute inset-0 nebula-band opacity-20"></div>
      <div className="absolute inset-0 cosmic-glow opacity-15"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="mx-auto max-w-2xl rounded-md bg-[#001D3D]/30 backdrop-blur-sm border border-[#003566]/30 p-8 shadow electric-glow">
          <h2 className="mb-4 text-2xl font-semibold text-white">Create your account</h2>

          <div className="mb-6 flex gap-3">
            <div
              className={`flex-1 rounded px-3 py-2 text-sm transition-colors ${step === 1 ? "bg-[#0077B6] text-white" : "bg-[#000814]/50 text-[#CAF0F8] border border-[#003566]/30"}`}
            >
              1. Basic info
            </div>
            <div
              className={`flex-1 rounded px-3 py-2 text-sm transition-colors ${step === 2 ? "bg-[#0077B6] text-white" : "bg-[#000814]/50 text-[#CAF0F8] border border-[#003566]/30"}`}
            >
              2. Upload resume
            </div>
            <div
              className={`flex-1 rounded px-3 py-2 text-sm transition-colors ${step === 3 ? "bg-[#0077B6] text-white" : "bg-[#000814]/50 text-[#CAF0F8] border border-[#003566]/30"}`}
            >
              3. Review
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#CAF0F8]">
                    First name
                  </label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded border border-[#003566]/50 bg-[#000814]/50 text-white placeholder-[#90E0EF] px-3 py-2 text-sm focus:border-[#0077B6] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#CAF0F8]">
                    Last name
                  </label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded border border-[#003566]/50 bg-[#000814]/50 text-white placeholder-[#90E0EF] px-3 py-2 text-sm focus:border-[#0077B6] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#CAF0F8]">
                  Gmail
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className="w-full rounded border border-[#003566]/50 bg-[#000814]/50 text-white placeholder-[#90E0EF] px-3 py-2 text-sm focus:border-[#0077B6] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#CAF0F8]">
                  Research interests
                </label>
                <textarea
                  value={researchInterests}
                  onChange={(e) => setResearchInterests(e.target.value)}
                  className="w-full rounded border border-[#003566]/50 bg-[#000814]/50 text-white placeholder-[#90E0EF] px-3 py-2 text-sm focus:border-[#0077B6] focus:outline-none"
                  rows={4}
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  className="rounded bg-[#0077B6] hover:bg-[#00B4D8] px-4 py-2 text-sm font-semibold text-white transition-colors electric-glow"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#CAF0F8]">
                  Upload your resume (PDF preferred)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-[#CAF0F8] file:bg-[#000814] file:border-[#003566] file:text-[#CAF0F8] file:rounded file:px-3 file:py-1 file:mr-3"
                />
                {file && (
                  <p className="mt-2 text-sm text-[#90E0EF]">
                    Selected: {file.name}
                  </p>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="rounded border border-[#003566] text-[#CAF0F8] hover:text-[#00B4D8] hover:border-[#0077B6] px-4 py-2 text-sm transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="rounded bg-[#0077B6] hover:bg-[#00B4D8] px-4 py-2 text-sm font-semibold text-white transition-colors electric-glow"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Review your profile</h3>
              {parsedResume ? (
                <div className="space-y-3 text-[#CAF0F8]">
                  <div>
                    <strong className="text-[#00B4D8]">Name:</strong> <span className="text-white">{parsedResume.name}</span>
                  </div>
                  <div>
                    <strong className="text-[#00B4D8]">Email:</strong> <span className="text-white">{parsedResume.email}</span>
                  </div>
                  <div>
                    <strong className="text-[#00B4D8]">Summary:</strong> <span className="text-white">{parsedResume.summary}</span>
                  </div>
                  <div>
                    <strong className="text-[#00B4D8]">Experiences:</strong>
                    <ul className="ml-4 list-disc text-white">
                      {parsedResume.experiences.map((ex, i) => (
                        <li key={i}>
                          {ex.role} — {ex.org} ({ex.years})
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong className="text-[#00B4D8]">Education:</strong>
                    <ul className="ml-4 list-disc text-white">
                      {parsedResume.education.map((ed, i) => (
                        <li key={i}>
                          {ed.degree} — {ed.school} ({ed.year})
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong className="text-[#00B4D8]">Skills:</strong> <span className="text-white">{parsedResume.skills.join(", ")}</span>
                  </div>
                </div>
              ) : (
                <p className="text-[#CAF0F8]">
                  No resume uploaded — we'll use the information you provided.
                </p>
              )}

              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="rounded border border-[#003566] text-[#CAF0F8] hover:text-[#00B4D8] hover:border-[#0077B6] px-4 py-2 text-sm transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    const name = `${firstName} ${lastName}`.trim();
                    auth.login({ name, email, researchInterests });
                    navigate("/dashboard");
                  }}
                  className="rounded bg-[#00B4D8] hover:bg-[#90E0EF] px-4 py-2 text-sm font-semibold text-white transition-colors cyan-glow"
                >
                  Finish and go to dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
