import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const BenefitsSection = () => {
  return (
    <section className="py-20 px-6 bg-background">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to find your match?</h2>
        <p className="text-xl text-muted-foreground mb-12">
          Get matched based on your research interests and career goals.
        </p>
        <Button className="bg-foreground text-background hover:bg-foreground/90 px-8 py-4 text-lg">
          Get started
        </Button>
      </div>
    </section>
  );
};

export default BenefitsSection;