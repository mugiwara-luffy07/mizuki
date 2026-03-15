import { Link, useParams } from 'react-router-dom';
import { useTenantStore } from '@/store/tenantStore';
import { Scissors, Heart, Award, Users } from 'lucide-react';

export default function About() {
  const { tenant } = useParams<{ tenant: string }>();
  const { config } = useTenantStore();

  if (!config || !tenant) return null;

  const values = [
    {
      icon: Scissors,
      title: 'Expert Craftsmanship',
      description: 'Every stitch reflects our commitment to excellence and attention to detail.',
    },
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Your satisfaction is our priority. We work closely with you to bring your vision to life.',
    },
    {
      icon: Award,
      title: 'Quality Materials',
      description: 'We source only the finest fabrics to ensure your garments look and feel exceptional.',
    },
    {
      icon: Users,
      title: 'Personal Touch',
      description: 'Each order receives individual attention from our skilled tailoring team.',
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold mb-4">
            About {config.brandName}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {config.description}
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-center">
              Our Story
            </h2>
            <div className="prose prose-lg mx-auto text-muted-foreground">
              <p>
                {config.brandName} was founded with a simple yet powerful vision: to bring 
                the art of bespoke tailoring to everyone. We believe that everyone deserves 
                clothing that fits perfectly and reflects their unique style.
              </p>
              <p>
                Our journey began with a passion for quality craftsmanship and a deep 
                appreciation for traditional tailoring techniques. Today, we combine 
                time-honored methods with modern convenience, making custom tailoring 
                accessible and enjoyable.
              </p>
              <p>
                Every garment we create tells a story – your story. From the first 
                measurement to the final stitch, we pour our expertise and dedication 
                into creating pieces that you'll treasure for years to come.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-semibold mb-12 text-center">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="text-center p-6 rounded-xl bg-card border border-border animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-full bg-tenant-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-6 h-6 text-tenant-primary" />
                </div>
                <h3 className="font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            Ready to Create Something Beautiful?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Start your custom order today and experience the difference of bespoke tailoring.
          </p>
          <Link to={`/${tenant}/custom-order`} className="btn-tenant inline-flex">
            <Scissors className="w-4 h-4 mr-2" />
            Start Custom Order
          </Link>
        </div>
      </section>
    </div>
  );
}
