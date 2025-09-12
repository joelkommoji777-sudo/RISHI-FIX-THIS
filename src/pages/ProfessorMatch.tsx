import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Users, GraduationCap, Loader2, AlertCircle, CheckCircle, Mail, Eye } from "lucide-react";
import { useState, useEffect } from "react";

interface Professor {
  name: string;
  title: string;
  department: string;
  email: string;
  phone?: string;
  researchAreas: string[];
  recentPublications: string[];
  labWebsite?: string;
  matchingScore: number;
  responseScore: number;
  matchingReason: string;
  keyProjects: string[];
  studentMentoring: string;
}

interface ResearchResult {
  professors: Professor[];
  researchSummary: string;
  totalProfessorsFound: number;
}

const ProfessorMatch = () => {
  const [collegeName, setCollegeName] = useState("");
  const [researchField, setResearchField] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [results, setResults] = useState<ResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<any>(null);

  // Load resume data from localStorage
  useEffect(() => {
    const savedResumeData = localStorage.getItem('extractedResumeData');
    if (savedResumeData) {
      setResumeData(JSON.parse(savedResumeData));
    }
  }, []);

  const universities = [
    "Harvard University",
    "Stanford University", 
    "MIT",
    "University of California, Berkeley",
    "Princeton University",
    "Yale University",
    "Columbia University",
    "University of Chicago",
    "Caltech",
    "University of Pennsylvania"
  ];

  const researchFields = [
    "Computer Science",
    "Artificial Intelligence",
    "Machine Learning",
    "Data Science",
    "Robotics",
    "Cybersecurity",
    "Software Engineering",
    "Human-Computer Interaction",
    "Computer Vision",
    "Natural Language Processing"
  ];

  const sendEmailToProfessor = async (professor: Professor) => {
    try {
      const response = await fetch('http://localhost:3001/api/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: professor.email,
          professorName: professor.name,
          professorTitle: professor.title,
          professorDepartment: professor.department,
          researchAreas: professor.researchAreas,
          studentName: resumeData?.personal_info?.name || 'Student',
          studentEmail: resumeData?.personal_info?.email || '',
          studentBackground: resumeData?.education || '',
          matchingReason: professor.matchingReason,
          userId: 'default-user' // Include user ID for proper token usage
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setError(`✅ Email sent successfully to ${professor.name}!`);
        } else {
          setError(`❌ Failed to send email: ${result.message}`);
        }
      } else {
        setError('❌ Failed to send email. Please check your email configuration.');
      }
    } catch (err) {
      setError('❌ Error sending email. Please check your email configuration in Settings.');
    }
  };

  const viewProfessorEmails = async (professor: Professor) => {
    try {
      // Generate email content for preview
      const response = await fetch('http://localhost:3001/api/emails/generate-single-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          professor: professor,
          resumeData: resumeData,
          userId: 'default-user'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.email) {
          // Show email preview in a modal or new window
          const emailPreview = `
Subject: ${result.email.subject}

${result.email.body}

---
This email would be sent to: ${professor.email}
          `;
          
          // Open in new window for now
          const newWindow = window.open('', '_blank');
          if (newWindow) {
            newWindow.document.write(`
              <html>
                <head><title>Email Preview - ${professor.name}</title></head>
                <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                  <h2>Email Preview for ${professor.name}</h2>
                  <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; white-space: pre-wrap;">${emailPreview}</div>
                  <p><strong>Recipient:</strong> ${professor.email}</p>
                </body>
              </html>
            `);
          }
        } else {
          setError(`❌ Failed to generate email preview: ${result.message}`);
        }
      } else {
        setError(`❌ Error generating email preview: ${response.statusText}`);
      }
    } catch (error) {
      setError(`❌ Error generating email preview: ${error}`);
    }
  };

  const searchProfessors = async () => {
    if (!collegeName || !researchField) {
      setError("Please select both university and research field");
      return;
    }

    if (!resumeData) {
      setError("Please upload your resume first to get personalized matches");
      return;
    }

    setIsSearching(true);
    setError(null);
    setSearchProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setSearchProgress(prev => Math.min(prev + 15, 90));
      }, 300);

      const response = await fetch('http://localhost:3001/api/research-professors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeData,
          collegeName,
          researchField
        }),
      });

      clearInterval(progressInterval);
      setSearchProgress(100);

      if (!response.ok) {
        throw new Error('Failed to search professors');
      }

      const data = await response.json();
      
      if (data.success) {
        setResults(data.data);
        
        // Save search to history
        const searchEntry = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          university: collegeName,
          researchField: researchField,
          professors: data.data.professors,
          totalFound: data.data.totalProfessorsFound
        };
        
        const existingHistory = JSON.parse(localStorage.getItem('professorHistory') || '[]');
        const updatedHistory = [searchEntry, ...existingHistory].slice(0, 10); // Keep last 10 searches
        localStorage.setItem('professorHistory', JSON.stringify(updatedHistory));
      } else {
        throw new Error(data.message || 'Search failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="p-8">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">
              Professor Matching.
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Find target professors and universities.
            </p>
          </div>

          {/* Search Form */}
          <Card className="p-8 mb-12">
            <h3 className="text-xl font-semibold mb-6">Find Your Research Match</h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label htmlFor="university">Select University</Label>
                <Select value={collegeName} onValueChange={setCollegeName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a university" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((uni) => (
                      <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="research-field">Research Field</Label>
                <Select value={researchField} onValueChange={setResearchField}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your research area" />
                  </SelectTrigger>
                  <SelectContent>
                    {researchFields.map((field) => (
                      <SelectItem key={field} value={field}>{field}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {!resumeData && (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please upload your resume first to get personalized professor matches.
                </AlertDescription>
              </Alert>
            )}

            <Button 
              className="w-full bg-foreground text-background hover:bg-foreground/90"
              onClick={searchProfessors}
              disabled={!collegeName || !researchField || !resumeData || isSearching}
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Find Professors
                </>
              )}
            </Button>

            {/* Search Progress */}
            {isSearching && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Searching for professors...</span>
                  <span className="text-sm text-muted-foreground">{searchProgress}%</span>
                </div>
                <Progress value={searchProgress} className="w-full" />
              </div>
            )}

            {/* Error Display */}
            {error && (
              <Alert className="mt-6" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </Card>

          {/* Results */}
          {results && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Found {results.totalProfessorsFound} Professors</h2>
                <p className="text-muted-foreground">{results.researchSummary}</p>
              </div>

              <div className="grid gap-6">
                {results.professors.map((professor, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">{professor.name}</h3>
                        <p className="text-muted-foreground">{professor.title} • {professor.department}</p>
                        {professor.labWebsite && (
                          <a 
                            href={professor.labWebsite} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Lab Website
                          </a>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex gap-2 mb-2">
                          <Badge variant="secondary">Match: {professor.matchingScore}/10</Badge>
                          <Badge variant="outline">Response: {professor.responseScore}/10</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => sendEmailToProfessor(professor)}
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Contact
                          </Button>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => viewProfessorEmails(professor)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Emails
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Research Areas</h4>
                        <div className="flex flex-wrap gap-2">
                          {professor.researchAreas.map((area, i) => (
                            <Badge key={i} variant="secondary">{area}</Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Why This Match?</h4>
                        <p className="text-sm text-muted-foreground">{professor.matchingReason}</p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Recent Publications</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {professor.recentPublications.map((pub, i) => (
                            <li key={i}>• {pub}</li>
                          ))}
                        </ul>
                      </div>

                      {professor.keyProjects.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Key Projects</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {professor.keyProjects.map((project, i) => (
                              <li key={i}>• {project}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div>
                        <h4 className="font-medium mb-2">Mentoring Style</h4>
                        <p className="text-sm text-muted-foreground">{professor.studentMentoring}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Steps (shown when no results) */}
          {!results && (
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="p-8 text-center">
                <h3 className="text-xl font-semibold mb-4">Search professors.</h3>
                <p className="text-muted-foreground mb-6">
                  Quickly search for research professors by name, university, research area or any type
                </p>
              </Card>

              <Card className="p-8 text-center">
                <h3 className="text-xl font-semibold mb-4">Select universities.</h3>
                <p className="text-muted-foreground mb-6">
                  Universities are already set to the top 10 universities
                  leveraged research discovery
                </p>
              </Card>

              <Card className="p-8 text-center">
                <h3 className="text-xl font-semibold mb-4">Pick research field.</h3>
                <p className="text-muted-foreground mb-6">
                  Filter and choose from your area of research, ensuring
                  relevant matches every time.
                </p>
              </Card>
            </div>
          )}
        </div>
    </div>
  );
};

export default ProfessorMatch;