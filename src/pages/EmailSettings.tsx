import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Settings,
  ExternalLink,
  RefreshCw,
  Send
} from "lucide-react";
import { useState, useEffect } from "react";

interface EmailConfig {
  provider: 'gmail' | 'emailjs';
  gmail?: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    accessToken: string;
    email: string;
  };
  emailjs?: {
    serviceId: string;
    templateId: string;
    publicKey: string;
  };
}

const EmailSettings = () => {
  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [userId] = useState('default-user'); // Simple user ID for now

  useEffect(() => {
    loadEmailConfig();
  }, []);

  const loadEmailConfig = async () => {
    try {
      // Use user-specific email config endpoint
      const response = await fetch(`http://localhost:3001/api/user/email-config/${userId}`);
      if (response.ok) {
        const config = await response.json();
        console.log('Loaded email config:', config);
        setEmailConfig(config);
        setIsConnected(config.configured);
      } else {
        // If no user config found, check general config
        const generalResponse = await fetch('http://localhost:3001/api/email/config');
        if (generalResponse.ok) {
          const generalConfig = await generalResponse.json();
          setEmailConfig(generalConfig);
          setIsConnected(generalConfig.gmail?.configured || generalConfig.emailjs?.configured);
        }
      }
    } catch (error) {
      console.error('Failed to load email config:', error);
    }
  };

  const connectGmail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/gmail/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        window.open(data.authUrl, '_blank');
        setTestResult('Please complete the Gmail authorization in the new window.');
      } else {
        setTestResult('Failed to initiate Gmail connection.');
      }
    } catch (error) {
      setTestResult('Error connecting to Gmail: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const testEmailConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const response = await fetch('http://localhost:3001/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'test@example.com',
          subject: 'Test Email from Professor Matcher',
          body: 'This is a test email to verify your email configuration.'
        })
      });
      
      if (response.ok) {
        setTestResult('✅ Test email sent successfully!');
      } else {
        setTestResult('❌ Failed to send test email.');
      }
    } catch (error) {
      setTestResult('❌ Error sending test email: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshConfig = async () => {
    setIsLoading(true);
    await loadEmailConfig();
    setIsLoading(false);
  };

  const disconnectEmail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/email/disconnect', {
        method: 'POST',
      });
      
      if (response.ok) {
        setEmailConfig(null);
        setIsConnected(false);
        setTestResult('Email configuration disconnected.');
      }
    } catch (error) {
      setTestResult('Error disconnecting email: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Mail className="w-8 h-8" />
            Email Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure your email provider to send automated outreach emails to professors
          </p>
        </div>

        {/* Connection Status */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isConnected ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <AlertCircle className="w-6 h-6 text-yellow-500" />
              )}
              <div>
                <h3 className="text-lg font-semibold">Email Connection</h3>
                <p className="text-sm text-muted-foreground">
                  {isConnected ? 'Connected and ready to send emails' : 'Not connected'}
                </p>
              </div>
            </div>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "Connected" : "Not Connected"}
            </Badge>
          </div>
        </Card>

        {/* Gmail Integration */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6" />
            <h3 className="text-xl font-semibold">Gmail Integration</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Connect Gmail Account</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your Gmail account to send personalized emails directly to professors. 
                This allows you to send emails through your own Gmail account with proper authentication.
              </p>
              
              {emailConfig?.gmail ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-green-800">Gmail Connected</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Connected as: {emailConfig.gmail.email}
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button onClick={testEmailConnection} disabled={isLoading}>
                      <Send className="w-4 h-4 mr-2" />
                      Test Email
                    </Button>
                    <Button variant="outline" onClick={disconnectEmail} disabled={isLoading}>
                      Disconnect
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium text-yellow-800">Gmail Not Connected</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Connect your Gmail account to send emails directly to professors
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={connectGmail} disabled={isLoading}>
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <ExternalLink className="w-4 h-4 mr-2" />
                      )}
                      Connect Gmail
                    </Button>
                    <Button onClick={refreshConfig} variant="outline" disabled={isLoading}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* EmailJS Fallback */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-6 h-6" />
            <h3 className="text-xl font-semibold">EmailJS Fallback</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">EmailJS Configuration</h4>
              <p className="text-sm text-muted-foreground mb-4">
                EmailJS provides a fallback email service when Gmail is not available. 
                This service is already configured and ready to use.
              </p>
              
              {emailConfig?.emailjs ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-blue-800">EmailJS Ready</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Service ID: {emailConfig.emailjs.serviceId}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-800">EmailJS Not Configured</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    EmailJS will be used as a fallback when Gmail is not available
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Test Results */}
        {testResult && (
          <Alert className={testResult.includes('✅') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{testResult}</AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">How Email Integration Works</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <div>
                <p className="font-medium">Connect Gmail (Recommended)</p>
                <p>Use your own Gmail account to send emails directly to professors with proper authentication.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <div>
                <p className="font-medium">EmailJS Fallback</p>
                <p>If Gmail is not available, emails will be sent through EmailJS service.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <div>
                <p className="font-medium">Automated Outreach</p>
                <p>When you find professors, you can send personalized emails directly from the platform.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EmailSettings;
