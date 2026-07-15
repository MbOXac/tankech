export default function Stats() {
  const stats = [
    { value: "15+", label: "Années d'expérience" },
    { value: "500+", label: "Projets Réalisés" },
    { value: "100%", label: "Clients Satisfaits" },
    { value: "24/7", label: "Assistance Bricolage" },
  ];

  return (
    <section className="bg-primary py-16 text-background border-t border-accent/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-background/10">
          {stats.map((stat, index) => (
            <div key={index} className="text-center px-4">
              <div className="text-4xl md:text-5xl font-serif font-bold text-accent mb-2">
                {stat.value}
              </div>
              <div className="text-background/80 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
