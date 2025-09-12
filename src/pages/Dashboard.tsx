import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Type definitions
interface PersonalInfo {
  name?: string;
  linkedin?: string;
  email?: string;
  phone?: string;
  location?: string;
}

interface Education {
  degree?: string;
  school?: string;
  graduation_year?: string;
  gpa?: string;
}

interface Experience {
  title?: string;
  company?: string;
  duration?: string;
  description?: string;
}

interface Project {
  name?: string;
  description?: string;
  technologies?: string[];
}

interface SchoolInvolvement {
  activity?: string;
  role?: string;
  duration?: string;
}

interface ActivityMetrics {
  total_activities?: number;
  leadership_roles?: number;
  community_service_hours?: number;
  academic_achievements?: number;
}

interface ResumeData {
  personal_info?: PersonalInfo;
  education?: Education[];
  experience?: Experience[];
  skills?: string[];
  projects?: Project[];
  school_involvement?: SchoolInvolvement[];
  activity_metrics?: ActivityMetrics;
}
import { 
  TrendingUp, 
  Mail, 
  MessageSquare, 
  Calendar, 
  User, 
  GraduationCap, 
  Briefcase, 
  Award, 
  FileText, 
  ExternalLink,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Search,
  Send,
  Eye,
  Download,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


const Dashboard = () => {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ResumeData | null>(null);
  const [professorHistory, setProfessorHistory] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const savedResumeData = localStorage.getItem('extractedResumeData');
    const savedHistory = localStorage.getItem('professorHistory');
    
    if (savedResumeData) {
      try {
        const parsed = JSON.parse(savedResumeData);
        console.log('Loaded resume data:', parsed);
        
        // Ensure all required arrays exist with proper structure
        const dataWithDefaults = {
          ...parsed,
          education: Array.isArray(parsed.education) ? parsed.education : [],
          experience: Array.isArray(parsed.experience) ? parsed.experience : [],
          skills: Array.isArray(parsed.skills) ? parsed.skills : [],
          projects: Array.isArray(parsed.projects) ? parsed.projects : [],
          school_involvement: Array.isArray(parsed.school_involvement) ? parsed.school_involvement : [],
          personal_info: parsed.personal_info || {}
        };
        
        console.log('Processed resume data:', dataWithDefaults);
        setResumeData(dataWithDefaults);
        setEditedData(dataWithDefaults);
      } catch (error) {
        console.error('Error parsing resume data:', error);
        setError('Error loading resume data');
      }
    }
    
    if (savedHistory) {
      try {
        setProfessorHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error parsing professor history:', error);
      }
    }

    // Generate recent activity
    const activities = [
      {
        id: 1,
        type: 'resume_upload',
        title: 'Resume Processed Successfully',
        description: 'Your resume has been analyzed and data extracted',
        timestamp: new Date().toISOString(),
        icon: FileText
      },
      {
        id: 2,
        type: 'profile_complete',
        title: 'Profile 100% Complete',
        description: 'All required information has been provided',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        icon: CheckCircle
      }
    ];
    
    if (professorHistory.length > 0) {
      activities.push({
        id: 3,
        type: 'professor_search',
        title: `${professorHistory.length} Professor Searches`,
        description: 'You have searched for professors',
        timestamp: professorHistory[0]?.timestamp || new Date().toISOString(),
        icon: Search
      });
    }
    
    setRecentActivity(activities);
    setIsLoading(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData({ ...resumeData });
  };

  const handleSave = () => {
    if (editedData) {
      setResumeData(editedData);
      localStorage.setItem('extractedResumeData', JSON.stringify(editedData));
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedData(resumeData);
    setIsEditing(false);
  };

  const updateField = (section: string, field: string, value: any) => {
    if (editedData) {
      setEditedData({
        ...editedData,
        [section]: {
          ...(editedData[section] || {}),
          [field]: value
        }
      });
    }
  };

  const addExperience = () => {
    if (editedData) {
      setEditedData({
        ...editedData,
        experience: [
          ...(editedData.experience || []),
          {
            title: '',
            company: '',
            duration: '',
            description: ''
          }
        ]
      });
    }
  };

  const removeExperience = (index: number) => {
    if (editedData) {
      setEditedData({
        ...editedData,
        experience: (editedData.experience || []).filter((_, i) => i !== index)
      });
    }
  };

  const addEducation = () => {
    if (editedData) {
      setEditedData({
        ...editedData,
        education: [
          ...(editedData.education || []),
          {
            degree: '',
            school: '',
            graduation_year: '',
            gpa: ''
          }
        ]
      });
    }
  };

  const removeEducation = (index: number) => {
    if (editedData) {
      setEditedData({
        ...editedData,
        education: (editedData.education || []).filter((_, i) => i !== index)
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
            </div>
          </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => navigate('/onboarding/personal-info')}>
            Start Onboarding
          </Button>
        </div>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="p-8">
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            No resume data found. Please complete the onboarding process first.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => navigate('/onboarding/personal-info')}>
            Start Onboarding
          </Button>
        </div>
      </div>
    );
  }

  // Ensure all required arrays exist
  const safeResumeData: ResumeData = resumeData ? {
    ...resumeData,
    education: Array.isArray(resumeData.education) ? resumeData.education : [],
    experience: Array.isArray(resumeData.experience) ? resumeData.experience : [],
    skills: Array.isArray(resumeData.skills) ? resumeData.skills : [],
    projects: Array.isArray(resumeData.projects) ? resumeData.projects : [],
    school_involvement: Array.isArray(resumeData.school_involvement) ? resumeData.school_involvement : [],
    personal_info: resumeData.personal_info || {
      name: '',
      email: '',
      phone: '',
      location: ''
    }
  } : {
    personal_info: { name: '', email: '', phone: '', location: '' },
    education: [],
    experience: [],
    skills: [],
    projects: [],
    school_involvement: []
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
          {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Dashboard</h1>
            <p className="text-xl text-muted-foreground">
              Welcome back, {safeResumeData.personal_info?.name || 'User'}!
            </p>
          </div>
          <div className="flex gap-3">
            {!isEditing ? (
              <Button onClick={handleEdit} variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button onClick={handleCancel} variant="outline">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
            <Button onClick={() => navigate('/professor-match')}>
              <Search className="w-4 h-4 mr-2" />
              Find Professors
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{safeResumeData.experience.length}</p>
                <p className="text-sm text-muted-foreground">Experiences</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <GraduationCap className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{safeResumeData.education.length}</p>
                <p className="text-sm text-muted-foreground">Education</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <Search className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{professorHistory.length}</p>
                <p className="text-sm text-muted-foreground">Searches</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <Award className="w-8 h-8 text-orange-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{safeResumeData.skills.length}</p>
                <p className="text-sm text-muted-foreground">Skills</p>
          </div>
                </div>
              </Card>
          </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <Icon className="w-5 h-5 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                  </div>
                  </div>
                    );
                  })}
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    onClick={() => navigate('/professor-match')}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search for Professors
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/history')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Search History
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/email-settings')}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email Settings
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={isEditing && editedData ? editedData.personal_info?.name || '' : safeResumeData.personal_info?.name || ''}
                    onChange={(e) => isEditing && updateField('personal_info', 'name', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={isEditing && editedData ? editedData.personal_info?.email || '' : safeResumeData.personal_info?.email || ''}
                    onChange={(e) => isEditing && updateField('personal_info', 'email', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={isEditing && editedData ? editedData.personal_info?.phone || '' : safeResumeData.personal_info?.phone || ''}
                    onChange={(e) => isEditing && updateField('personal_info', 'phone', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={isEditing && editedData ? editedData.personal_info?.location || '' : safeResumeData.personal_info?.location || ''}
                    onChange={(e) => isEditing && updateField('personal_info', 'location', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </Card>

            {/* Education Section */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Education</h3>
                {isEditing && (
                  <Button onClick={addEducation} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Education
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                {(isEditing && editedData ? editedData.education || [] : safeResumeData.education).map((edu, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Degree</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => isEditing && editedData && setEditedData({
                            ...editedData,
                            education: (editedData.education || []).map((item, i) => 
                              i === index ? { ...item, degree: e.target.value } : item
                            )
                          })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label>School</Label>
                        <Input
                          value={edu.school}
                          onChange={(e) => isEditing && editedData && setEditedData({
                            ...editedData,
                            education: (editedData.education || []).map((item, i) => 
                              i === index ? { ...item, school: e.target.value } : item
                            )
                          })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label>Graduation Year</Label>
                        <Input
                          value={edu.graduation_year}
                          onChange={(e) => isEditing && editedData && setEditedData({
                            ...editedData,
                            education: (editedData.education || []).map((item, i) => 
                              i === index ? { ...item, graduation_year: e.target.value } : item
                            )
                          })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label>GPA</Label>
                        <Input
                          value={edu.gpa}
                          onChange={(e) => isEditing && editedData && setEditedData({
                            ...editedData,
                            education: (editedData.education || []).map((item, i) => 
                              i === index ? { ...item, gpa: e.target.value } : item
                            )
                          })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    {isEditing && (
                      <Button 
                        onClick={() => removeEducation(index)} 
                        variant="destructive" 
                        size="sm" 
                        className="mt-2"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Experience Section */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Experience</h3>
                {isEditing && (
                  <Button onClick={addExperience} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Experience
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                {(isEditing && editedData ? editedData.experience || [] : safeResumeData.experience).map((exp, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={exp.title}
                          onChange={(e) => isEditing && editedData && setEditedData({
                            ...editedData,
                            experience: (editedData.experience || []).map((item, i) => 
                              i === index ? { ...item, title: e.target.value } : item
                            )
                          })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label>Company</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => isEditing && editedData && setEditedData({
                            ...editedData,
                            experience: (editedData.experience || []).map((item, i) => 
                              i === index ? { ...item, company: e.target.value } : item
                            )
                          })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Duration</Label>
                        <Input
                          value={exp.duration}
                          onChange={(e) => isEditing && editedData && setEditedData({
                            ...editedData,
                            experience: (editedData.experience || []).map((item, i) => 
                              i === index ? { ...item, duration: e.target.value } : item
                            )
                          })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Description</Label>
                        <Textarea
                          value={exp.description}
                          onChange={(e) => isEditing && editedData && setEditedData({
                            ...editedData,
                            experience: (editedData.experience || []).map((item, i) => 
                              i === index ? { ...item, description: e.target.value } : item
                            )
                          })}
                          disabled={!isEditing}
                          rows={3}
                        />
                      </div>
                    </div>
                    {isEditing && (
                      <Button 
                        onClick={() => removeExperience(index)} 
                        variant="destructive" 
                        size="sm" 
                        className="mt-2"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Skills Section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {safeResumeData.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
            ))}
          </div>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Search History</h3>
              {professorHistory.length === 0 ? (
                <p className="text-muted-foreground">No searches yet. Start by searching for professors!</p>
              ) : (
            <div className="space-y-4">
                  {professorHistory.map((search, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{search.university} - {search.researchField}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(search.timestamp).toLocaleDateString()} • {search.totalFound} professors found
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate('/professor-match')}
                        >
                          <Search className="w-4 h-4 mr-2" />
                          Search Again
                        </Button>
                      </div>
                </div>
              ))}
            </div>
              )}
          </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
              <div className="space-y-4">
                <Button variant="outline" onClick={() => navigate('/email-settings')}>
                  <Mail className="w-4 h-4 mr-2" />
                  Email Configuration
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Download Resume
                </Button>
        </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;