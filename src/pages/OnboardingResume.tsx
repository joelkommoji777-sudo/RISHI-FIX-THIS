import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const OnboardingResume = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please select a PDF file');
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Please drop a PDF file');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const uploadResume = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('http://localhost:3001/api/resume/extract', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Failed to extract resume data');
      }

      const data = await response.json();
      
      if (data.success) {
        setExtractedData(data);
        // Store in localStorage for the next step
        localStorage.setItem('extractedResumeData', JSON.stringify(data));
        // Navigate to review step or dashboard
        navigate('/dashboard');
      } else {
        throw new Error(data.error || 'Failed to process resume');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8">
        <div className="container mx-auto max-w-2xl">
          {/* Progress */}
          <div className="flex items-center justify-between mb-8 text-sm">
            <span className="text-muted-foreground">Personal info</span>
            <span className="text-foreground font-medium">Resume</span>
            <span className="text-muted-foreground">Review</span>
            <Button variant="outline" size="sm">Finish</Button>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-2">Upload your resume.</h1>
            <p className="text-xl text-muted-foreground">
              <span className="bg-blue-100 px-2 py-1 rounded">Get started in seconds.</span>
            </p>
          </div>

          {/* Form Card */}
          <Card className="p-8 mb-8">
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Upload your resume file</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Choose your resume file and upload it here. Our system 
                will automatically extract your information for review.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                Supported formats: PDF only. After upload, you'll proceed 
                to review your extracted personal and professional details.
              </p>
            </div>

            {/* File Upload Area */}
            <div 
              className={`border-2 border-dashed rounded-lg p-12 text-center mb-8 transition-colors ${
                file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {file ? (
                <div className="flex flex-col items-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-green-700 font-medium mb-2">{file.name}</p>
                  <p className="text-sm text-green-600">Ready to upload</p>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Drag and drop your resume file here</p>
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose File
                  </Button>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Processing resume...</span>
                  <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {/* Error Display */}
            {error && (
              <Alert className="mb-6" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Upload Button */}
            <Button 
              className="w-full bg-foreground text-background hover:bg-foreground/90"
              onClick={uploadResume}
              disabled={!file || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Extract Resume Data
                </>
              )}
            </Button>
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

export default OnboardingResume;