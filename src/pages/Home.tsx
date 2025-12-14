import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Scissors, Ruler, Palette, Sparkles } from 'lucide-react';
import { useTenantStore } from '@/store/tenantStore';

export default function Home() {
  const { tenant } = useParams<{ tenant: string }>();
  const { config } = useTenantStore();

  if (!config || !tenant) return null;

  const features = [
    {
      icon: Scissors,
      title: 'Premium Fabrics',
      description: 'Choose from our curated selection of high-quality fabrics',
    },
    {
      icon: Palette,
      title: 'Custom Designs',
      description: 'Personalize every detail from neckline to embroidery',
    },
    {
      icon: Ruler,
      title: 'Perfect Fit',
      description: 'Tailored precisely to your measurements',
    },
    {
      icon: Sparkles,
      title: 'Expert Craftsmanship',
      description: 'Handcrafted by skilled artisans with attention to detail',
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://media.istockphoto.com/id/105680592/photo/indian-scarves-in-many-colors-for-display.jpg?s=612x612&w=0&k=20&c=eGIl-xZv6K7miZSCQjvezFqSoas3H6uVZ4OR7cAhDxs=)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4 animate-slide-up">
            {config.tagline}
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold mb-6 animate-slide-up stagger-1">
            {config.brandName}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up stagger-2">
            {config.description}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up stagger-3">
            <Link to={`/${tenant}/order`} className="btn-tenant">
              <Scissors className="w-4 h-4 mr-2" />
              Start Custom Order
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link to={`/${tenant}/about`} className="btn-tenant-outline">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Creating your perfect custom garment is easy with our simple 5-step process
          </p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { step: 1, title: 'Choose Fabric', desc: 'Select your preferred fabric and color' },
              { step: 2, title: 'Select Garment', desc: 'Pick your garment type' },
              { step: 3, title: 'Design Details', desc: 'Customize neck, embroidery & more' },
              { step: 4, title: 'Measurements', desc: 'Enter your precise measurements' },
              { step: 5, title: 'Place Order', desc: 'Review and submit your order' },
            ].map((item, index) => (
              <div
                key={item.step}
                className="text-center animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-full bg-tenant-primary text-tenant-secondary flex items-center justify-center mx-auto mb-4 text-lg font-semibold">
                  {item.step}
                </div>
                <h3 className="font-medium mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12">
            Why Choose Us
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="text-center p-6 rounded-xl bg-card border border-border animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-full bg-tenant-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-tenant-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Saree Gallery */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              Our Silk Saree Collection
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover the elegance of handcrafted silk sarees, each piece a masterpiece of traditional artistry
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                title: 'Kanchipuram Silk',
                image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=800&fit=crop',
                desc: 'Traditional temple border',
              },
              {
                title: 'Banarasi Silk',
                image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&h=800&fit=crop',
                desc: 'Intricate zari work',
              },
              {
                title: 'Mysore Silk',
                image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=800&fit=crop',
                desc: 'Royal elegance',
              },
              {
                title: 'Patola Silk',
                image: 'https://images.unsplash.com/flagged/photo-1551854716-8b811be39e7e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                desc: 'Double ikat weaving',
              },
              {
                title: 'Tussar Silk',
                image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&h=800&fit=crop',
                desc: 'Natural golden sheen',
              },
              {
                title: 'Chanderi Silk',
                image: 'https://images.unsplash.com/photo-1641877953739-8cab85119201?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                desc: 'Lightweight & sheer',
              },
              {
                title: 'Bhagalpuri Silk',
                image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=800&fit=crop&sat=-30',
                desc: 'Textured finish',
              },
              {
                title: 'Paithani Silk',
                image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&h=800&fit=crop&hue=40',
                desc: 'Peacock motifs',
              },
            ].map((saree, index) => (
              <div
                key={saree.title}
                className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-muted animate-slide-up cursor-pointer"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <img
                  src={saree.image}
                  alt={saree.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
                  <h3 className="text-background font-semibold text-base md:text-lg mb-1">
                    {saree.title}
                  </h3>
                  <p className="text-background/80 text-xs md:text-sm">
                    {saree.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to={`/${tenant}/order`}
              className="inline-flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all btn-tenant-outline"
            >
              Browse All Designs
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-tenant-primary text-tenant-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            Ready to Create Your Custom Garment?
          </h2>
          <p className="opacity-80 mb-8 max-w-md mx-auto">
            Start your order today and experience the art of bespoke tailoring
          </p>
          <Link
            to={`/${tenant}/order`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-tenant-secondary text-tenant-primary rounded-md font-medium hover:opacity-90 transition-opacity"
          >
            <Scissors className="w-4 h-4" />
            Start Custom Order
          </Link>
        </div>
      </section>
    </div>
  );
}
