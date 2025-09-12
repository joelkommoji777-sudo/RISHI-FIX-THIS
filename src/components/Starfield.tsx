import { useEffect, useRef, useState } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  delay: number;
}

const Starfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stars, setStars] = useState<Star[]>([]);
  const [scrollY, setScrollY] = useState(0);
  const animationRef = useRef<number>();

  // Generate stars
  useEffect(() => {
    const generateStars = () => {
      const starArray: Star[] = [];
      const numStars = 150;
      
      for (let i = 0; i < numStars; i++) {
        starArray.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          delay: Math.random() * Math.PI * 2
        });
      }
      
      setStars(starArray);
    };

    generateStars();
    
    const handleResize = () => {
      generateStars();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = (time: number) => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate visibility based on scroll
      const visibility = Math.min(scrollY / 300, 1); // Fade in over 300px of scroll

      if (visibility > 0) {
        // Draw stars
        stars.forEach((star) => {
          const twinkle = Math.sin(time * star.twinkleSpeed + star.delay) * 0.5 + 0.5;
          const finalOpacity = star.opacity * twinkle * visibility;

          // Create gradient for star glow
          const gradient = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, star.size * 3
          );
          
          gradient.addColorStop(0, `hsl(269, 89%, 68%, ${finalOpacity})`);
          gradient.addColorStop(0.5, `hsl(269, 89%, 68%, ${finalOpacity * 0.5})`);
          gradient.addColorStop(1, `hsl(269, 89%, 68%, 0)`);

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
          ctx.fill();

          // Core star
          ctx.fillStyle = `hsl(269, 89%, 88%, ${finalOpacity})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [stars, scrollY]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'black' }}
    />
  );
};

export default Starfield;