import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

const OnboardingPersonalInfo = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    grade: '',
    interests: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Store personal info in localStorage for the next step
      const personalInfo = {
        name: formData.name,
        email: formData.email,
        grade: formData.grade,
        interests: formData.interests.split(',').map(i => i.trim()).filter(i => i)
      };
      
      localStorage.setItem('personalInfo', JSON.stringify(personalInfo));
      setSuccess(true);
      
      // Navigate to resume upload after a short delay
      setTimeout(() => {
        navigate('/onboarding/resume');
      }, 1500);
      
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="p-8">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-2">Information Saved!</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Redirecting to resume upload...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
        <div className="container mx-auto max-w-2xl">
          {/* Progress */}
          <div className="flex items-center justify-between mb-8 text-sm">
            <span className="text-foreground font-medium">Personal info</span>
            <span className="text-muted-foreground">Resume</span>
            <span className="text-muted-foreground">Review</span>
            <Button variant="outline" size="sm">Finish</Button>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-2">Enter your details.</h1>
            <p className="text-xl text-muted-foreground">Let's start your onboarding.</p>
          </div>

          {/* Form Card */}
          <Card className="p-8 mb-8">
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Personal information</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Please enter your personal information below to begin the onboarding process. 
                This information will be used to personalize your professor matching experience.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                Your details will remain confidential and are only used to enhance your 
                research opportunity matching. Click next after completing all fields to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input 
                    id="name" 
                    name="name"
                    placeholder="Jane Smith" 
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    placeholder="jane@university.edu" 
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="grade">Academic Level</Label>
                <Input 
                  id="grade" 
                  name="grade"
                  placeholder="e.g., College Senior, Graduate Student, PhD Candidate" 
                  value={formData.grade}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="interests">Research Interests</Label>
                <Textarea 
                  id="interests" 
                  name="interests"
                  placeholder="e.g., Machine Learning, Computer Vision, Data Science (separate with commas)" 
                  rows={3}
                  value={formData.interests}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate multiple interests with commas
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit"
                className="w-full bg-foreground text-background hover:bg-foreground/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Continue to Resume Upload'}
              </Button>
            </form>
          </Card>

          {/* Footer Navigation */}
          <div className="grid grid-cols-4 gap-8 text-center text-sm">
            <div>
              <h4 className="font-medium mb-2">Onboarding</h4>
              <div className="space-y-1 text-muted-foreground">
                <div>Personal info</div>
                <div>Resume</div>
                <div>Review</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Help</h4>
              <div className="space-y-1 text-muted-foreground">
                <div>Support</div>
                <div>FAQ</div>
                <div>Contact</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Company</h4>
              <div className="space-y-1 text-muted-foreground">
                <div>About us</div>
                <div>Careers</div>
                <div>Blog</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Legal</h4>
              <div className="space-y-1 text-muted-foreground">
                <div>Privacy</div>
                <div>Terms</div>
                <div>Cookies</div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default OnboardingPersonalInfo;