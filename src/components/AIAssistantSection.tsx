import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const AIAssistantSection = () => {
  const { ref: contentRef, isInView: contentInView } = useInView();
  const { ref: cardRef, isInView: cardInView } = useInView();

  return (
    <section className="py-20 px-6 bg-background relative z-10">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div ref={contentRef} className={`transition-all duration-700 ${contentInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <div className="mb-8">
              <span className="text-sm text-muted-foreground uppercase tracking-wider">AI Assistant</span>
            </div>
            
            <h2 className="text-4xl font-bold mb-6">
              Delegate Daily Tasks
            </h2>
            
            <p className="text-muted-foreground leading-relaxed mb-8">
              From identifying professors to drafting personalized emails and
              organizing responses, our AI handles every aspect of the outreach
              process. This systematic approach can scale as your connection needs
              grow, adapting to your evolving academic journey while maintaining
              consistent, professional communication quality.
            </p>
          </div>

          {/* AI Chat Interface */}
          <div className={`transition-all duration-700 ${cardInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <Card ref={cardRef} className="bg-secondary/50 border-border/50 p-6 card-glow hover-float">
              <div className="flex items-center justify-center mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center glow-orb animate-glow-pulse">
                  <div className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">What can I help with?</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Whether you want help in customer handling or make
                </p>
                
                <div className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start text-left">
                    Draft a research collaboration email
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-left">
                    Find professors in my field
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-left">
                    Schedule follow-up reminders
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIAssistantSection;