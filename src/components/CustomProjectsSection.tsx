import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Clock } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const CustomProjectsSection = () => {
  const { ref: contentRef, isInView: contentInView } = useInView();
  const { ref: cardRef, isInView: cardInView } = useInView();

  const services = [
    { name: "Strategy", active: true },
    { name: "Custom AI", active: false },
    { name: "Consulting", active: false }
  ];

  const projectData = {
    ongoing: "Customer Support Chatbot",
    progress: "90% Finished",
    schedule: [
      { day: "Mo", active: false },
      { day: "Tu", active: false },
      { day: "We", active: false },
      { day: "Th", active: false },
      { day: "Fr", active: true },
      { day: "Sa", active: false },
      { day: "Su", active: false }
    ],
    tasks: [
      { name: "Discovery call", time: "beginning 10:30 am" },
      { name: "Custom automation", time: "finishing 2:30 pm" }
    ]
  };

  return (
    <section className="py-20 px-6 bg-background relative z-10">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div ref={contentRef} className={`transition-all duration-700 ${contentInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <div className="mb-8">
              <Badge variant="secondary" className="mb-4">
                Custom Projects
              </Badge>
              <h2 className="text-4xl font-bold mb-6">
                Build Smarter Resumes
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Whether you're reaching out for the first time or improving your
                approach, we provide strategic guidance and build custom AI
                tools to align your outreach with your academic and research
                goals.
              </p>
            </div>

            {/* Service tabs */}
            <div className="flex gap-2 mb-8">
              {services.map((service, index) => (
                <Button
                  key={index}
                  variant={service.active ? "default" : "ghost"}
                  size="sm"
                  className={service.active ? "bg-primary/20 text-primary border border-primary/30" : ""}
                >
                  {service.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Project Dashboard */}
          <div className={`transition-all duration-700 ${cardInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <Card ref={cardRef} className="bg-secondary/50 border-border/50 p-6 card-glow hover-float">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-muted-foreground">Hey David!</span>
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                Here is your Custom project & schedule
              </p>

              {/* Ongoing Project */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm font-medium">Ongoing project :</span>
                </div>
                <div className="flex items-center justify-between bg-background/30 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">{projectData.ongoing}</span>
                  </div>
                  <span className="text-xs text-primary">{projectData.progress}</span>
                </div>
              </div>

              {/* Schedule */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Schedule</span>
                </div>
                <div className="flex gap-2 mb-4">
                  {projectData.schedule.map((day, index) => (
                    <div
                      key={index}
                      className={`w-8 h-8 rounded flex items-center justify-center text-xs ${
                        day.active 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-background/30 text-muted-foreground"
                      }`}
                    >
                      {day.day}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-3">
                {projectData.tasks.map((task, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-border rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{task.name}</div>
                      <div className="text-xs text-muted-foreground">{task.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomProjectsSection;