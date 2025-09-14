import { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Code, ChevronDown, User, Mail, MapPin, TrendingUp } from "lucide-react";

export default function Profile() {
  const [experienceOpen, setExperienceOpen] = useState(true);
  const [educationOpen, setEducationOpen] = useState(true);
  const [skillsOpen, setSkillsOpen] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const backupRef = useRef<any>(null);

  const [profileInfo, setProfileInfo] = useState({
    name: "Joel Kommoji",
    title: "Senior Research Scientist",
    email: "joel@example.com",
    location: "New York, USA",
    interests: ["Machine Learning", "NLP", "Deep Learning", "AI Ethics"],
  });

  const [experiences, setExperiences] = useState([
    {
      title: "Senior Research Scientist",
      org: "Google AI",
      period: "2022 - Present",
      desc: "Leading research in natural language processing and large language models. Published 15+ papers in top-tier conferences.",
      bullets: [
        "Led team of 8 researchers",
        "Published in NeurIPS, ICML, ACL",
        "Filed 3 patents",
      ],
    },
    {
      title: "Research Fellow",
      org: "Stanford University",
      period: "2020 - 2022",
      desc: "Postdoctoral research in machine learning focused on deep learning architectures.",
      bullets: [
        "Collaborated with industry partners",
        "Mentored 5 PhD students",
        "Secured $2M in funding",
      ],
    },
  ]);

  const [education, setEducation] = useState([
    {
      degree: "Ph.D. in Computer Science",
      institution: "MIT",
      period: "2016 - 2020",
      description:
        'Thesis: "Advances in Neural Network Architectures for Natural Language Understanding"',
    },
    {
      degree: "M.S. in Computer Science",
      institution: "Stanford University",
      period: "2014 - 2016",
      description: "Focus: Data Science and Analytics",
    },
  ]);

  const [skills, setSkills] = useState([
    { name: "Python", category: "Programming", level: "Expert" },
    { name: "PyTorch", category: "Machine Learning", level: "Expert" },
    { name: "TensorFlow", category: "Machine Learning", level: "Advanced" },
    { name: "SQL", category: "Data", level: "Advanced" },
  ]);

  return (
    <main className="min-h-screen space-bg relative py-10">
      {/* Enhanced Cosmic Background Layers */}
      <div className="absolute inset-0 nebula-glow opacity-40"></div>
      <div className="absolute inset-0 cosmic-depth opacity-30"></div>
      <div className="absolute inset-0 nebula-band opacity-20"></div>
      <div className="absolute inset-0 cosmic-glow opacity-15"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile and Academic Info */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="shadow-lg bg-[#001D3D]/30 backdrop-blur-sm border-[#003566]/30 electric-glow">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-24 h-24 cosmic-gradient rounded-full flex items-center justify-center mx-auto mb-4 sky-glow">
                    <span className="text-2xl font-bold text-white">JK</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">{profileInfo.name}</h2>
                  <p className="text-[#CAF0F8] mb-4">{profileInfo.title}</p>
                  
                  <div className="space-y-2 text-sm text-[#90E0EF]">
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{profileInfo.email}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{profileInfo.location}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Research Interests */}
            <Card className="shadow-lg bg-[#001D3D]/30 backdrop-blur-sm border-[#003566]/30 cyan-glow">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Research Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profileInfo.interests.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-[#0077B6]/20 text-[#00B4D8] border-[#0077B6]/30">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column - Experience, Education, Skills */}
          <div className="lg:col-span-2 space-y-6">

            {/* Experience Section */}
            <Card className="shadow-lg bg-[#001D3D]/30 backdrop-blur-sm border-[#003566]/30 sky-glow">
              <Collapsible
                open={experienceOpen}
                onOpenChange={setExperienceOpen}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-[#000814]/30 transition-colors rounded-t-xl flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <User className="w-5 h-5 text-[#00B4D8]" />
                      <span>Experience</span>
                      <TrendingUp className="w-4 h-4 text-[#90E0EF]" />
                    </CardTitle>
                    <ChevronDown
                      className={
                        experienceOpen
                          ? "w-5 h-5 rotate-180 transition-transform text-[#CAF0F8]"
                          : "w-5 h-5 transition-transform text-[#CAF0F8]"
                      }
                    />
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="space-y-6">
                    {experiences.map((exp, idx) => (
                      <div
                        key={idx}
                        className="border-l-2 border-[#0077B6] pl-6 pb-6 last:pb-0 relative"
                      >
                        <div className="absolute -left-2 top-0 h-3 w-3 rounded-full bg-[#0077B6]" />
                        <div className="space-y-2">
                          <h4 className="text-lg font-semibold text-white">
                            {exp.title}
                          </h4>
                          <p className="text-[#00B4D8] font-medium">
                            {exp.org}
                          </p>
                          <p className="text-sm text-[#90E0EF]">
                            {exp.period}
                          </p>
                          <p className="text-sm text-[#CAF0F8]">
                            {exp.desc}
                          </p>
                          <ul className="mt-2 list-disc pl-5 text-sm text-[#CAF0F8]">
                            {exp.bullets.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Education Section */}
            <Card className="shadow-lg bg-[#001D3D]/30 backdrop-blur-sm border-[#003566]/30 electric-glow">
              <Collapsible open={educationOpen} onOpenChange={setEducationOpen}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-[#000814]/30 transition-colors rounded-t-xl flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <BookOpen className="w-5 h-5 text-[#00B4D8]" />
                      <span>Education</span>
                      <ChevronDown className="w-4 h-4 text-[#90E0EF]" />
                    </CardTitle>
                    <ChevronDown
                      className={
                        educationOpen
                          ? "w-5 h-5 rotate-180 transition-transform text-[#CAF0F8]"
                          : "w-5 h-5 transition-transform text-[#CAF0F8]"
                      }
                    />
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="space-y-6">
                    {education.map((edu, index) => (
                      <div
                        key={index}
                        className="border-l-2 border-[#00B4D8] pl-6 pb-6 last:pb-0 relative"
                      >
                        <div className="absolute -left-2 top-0 h-3 w-3 rounded-full bg-[#00B4D8]" />
                        <div className="space-y-2">
                          <h4 className="text-lg font-semibold text-white">
                            {edu.degree}
                          </h4>
                          <p className="text-[#00B4D8] font-medium">
                            {edu.institution}
                          </p>
                          <p className="text-sm text-[#90E0EF]">
                            {edu.period}
                          </p>
                          <p className="text-sm text-[#CAF0F8]">
                            {edu.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Skills & Expertise Section */}
            <Card className="shadow-lg bg-[#001D3D]/30 backdrop-blur-sm border-[#003566]/30 cyan-glow">
              <Collapsible open={skillsOpen} onOpenChange={setSkillsOpen}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-[#000814]/30 transition-colors rounded-t-xl flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Code className="w-5 h-5 text-[#00B4D8]" />
                      <span>Skills & Expertise</span>
                      <ChevronDown className="w-4 h-4 text-[#90E0EF]" />
                    </CardTitle>
                    <ChevronDown
                      className={
                        skillsOpen
                          ? "w-5 h-5 rotate-180 transition-transform text-[#CAF0F8]"
                          : "w-5 h-5 transition-transform text-[#CAF0F8]"
                      }
                    />
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {skills.map((skill, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-white">
                              {skill.name}
                            </span>
                            <Badge
                              variant={
                                skill.level === "Expert"
                                  ? "default"
                                  : "secondary"
                              }
                              className={`text-xs ${skill.level === "Expert" ? "bg-[#0077B6] text-white" : "bg-[#0077B6]/20 text-[#00B4D8] border-[#0077B6]/30"}`}
                            >
                              {skill.level}
                            </Badge>
                          </div>

                          <div className="w-full bg-[#000814] rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${skill.level === "Expert" ? "bg-[#00B4D8] w-full" : skill.level === "Advanced" ? "bg-[#0077B6] w-4/5" : "bg-[#90E0EF] w-3/5"}`}
                            />
                          </div>

                          <span className="text-xs text-[#90E0EF]">
                            {skill.category}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
