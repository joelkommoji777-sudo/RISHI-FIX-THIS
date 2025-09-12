import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  History, 
  Search, 
  Mail, 
  ExternalLink, 
  Calendar,
  GraduationCap,
  Trash2,
  RefreshCw
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Professor {
  name: string;
  title: string;
  department: string;
  email: string;
  researchAreas: string[];
  matchingScore: number;
  responseScore: number;
  matchingReason: string;
}

interface SearchHistory {
  id: string;
  timestamp: string;
  university: string;
  researchField: string;
  professors: Professor[];
  totalFound: number;
}

const ProfessorHistory = () => {
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = () => {
    const savedHistory = localStorage.getItem('professorHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
    setIsLoading(false);
  };

  const clearHistory = () => {
    localStorage.removeItem('professorHistory');
    setSearchHistory([]);
  };

  const deleteSearch = (id: string) => {
    const updatedHistory = searchHistory.filter(search => search.id !== id);
    setSearchHistory(updatedHistory);
    localStorage.setItem('professorHistory', JSON.stringify(updatedHistory));
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <History className="w-8 h-8" />
              Search History
            </h1>
            <p className="text-muted-foreground mt-2">
              View and manage your previous professor searches
            </p>
          </div>
          {searchHistory.length > 0 && (
            <Button variant="outline" onClick={clearHistory}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <Search className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{searchHistory.length}</p>
                <p className="text-sm text-muted-foreground">Total Searches</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <GraduationCap className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">
                  {searchHistory.reduce((sum, search) => sum + search.totalFound, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Professors Found</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <Mail className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">
                  {searchHistory.reduce((sum, search) => sum + search.professors.length, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Contacts</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search History */}
        {searchHistory.length === 0 ? (
          <Alert>
            <Search className="h-4 w-4" />
            <AlertDescription>
              No search history found. Start by searching for professors to see your history here.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {searchHistory.map((search) => (
              <Card key={search.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      {search.university} - {search.researchField}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(search.timestamp)} • {search.totalFound} professors found
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate('/professor-match')}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Search Again
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => deleteSearch(search.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Professors from this search */}
                <div className="grid md:grid-cols-2 gap-4">
                  {search.professors.slice(0, 4).map((professor, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{professor.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {professor.title} • {professor.department}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="secondary">
                            Match: {professor.matchingScore}/10
                          </Badge>
                          <Badge variant="outline">
                            Response: {professor.responseScore}/10
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium">Research Areas:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {professor.researchAreas.slice(0, 3).map((area, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {area}
                              </Badge>
                            ))}
                            {professor.researchAreas.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{professor.researchAreas.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Mail className="w-3 h-3 mr-1" />
                            Contact
                          </Button>
                          <Button size="sm" variant="outline">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {search.professors.length > 4 && (
                  <div className="mt-4 text-center">
                    <Button variant="outline" size="sm">
                      View All {search.professors.length} Professors
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessorHistory;

