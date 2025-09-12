import { useInView } from "@/hooks/useInView";

const ProcessSection = () => {
  const { ref, isInView } = useInView();

  return (
    <section className="py-20 px-6 bg-background relative z-10">
      <div ref={ref} className={`container mx-auto text-center transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="mb-8">
          <span className={`text-sm text-muted-foreground uppercase tracking-wider transition-all duration-700 delay-100 ${isInView ? 'opacity-100' : 'opacity-0'}`}>Our Process</span>
        </div>
        
        <h2 className={`text-4xl md:text-5xl font-bold mb-6 leading-tight text-glow transition-all duration-700 delay-200 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          Our Simple, Smart,<br />
          and Profitable Process
        </h2>
        
        <p className={`text-lg text-muted-foreground max-w-3xl mx-auto transition-all duration-700 delay-300 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          We design, develop, and implement automation tools that help you work
          smarter, not harder
        </p>
      </div>
    </section>
  );
};

export default ProcessSection;