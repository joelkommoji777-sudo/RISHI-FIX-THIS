import { Card } from "@/components/ui/card";

const WorkflowSection = () => {
  const steps = [
    {
      title: "Search professors.",
      description: "Quickly search for research professors by name, university, research area or any type"
    },
    {
      title: "Select universities.",
      description: "Universities are already set to the top 10 universities leveraged research discovery"
    },
    {
      title: "Pick research field.",
      description: "Filter and choose from your area of research, ensuring relevant matches every time."
    }
  ];

  return (
    <section className="py-20 px-6 bg-background">
      <div className="container mx-auto max-w-4xl">
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="p-8 text-center border border-border">
              <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;