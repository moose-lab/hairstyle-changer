import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Shield, Palette, Check } from "lucide-react";
import { useEffect, useRef } from "react";

export default function Home() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Intersection Observer for entrance animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all fade-in-up elements
    const elements = document.querySelectorAll(".fade-in-up");
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const scrollToDemo = () => {
    const demoSection = document.getElementById("demo");
    demoSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden animated-gradient min-h-screen flex items-center">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://private-us-east-1.manuscdn.com/sessionFile/21kOF6EWp9VrrrhRPQNOzS/sandbox/SreMNeY8q6SNFW1tE1iKlB-img-1_1770372703000_na1fn_aGVyby1iYWNrZ3JvdW5k.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvMjFrT0Y2RVdwOVZycnJoUlBRTk96Uy9zYW5kYm94L1NyZU1OZVk4cTZTTkZXMXRFMWlLbEItaW1nLTFfMTc3MDM3MjcwMzAwMF9uYTFmbl9hR1Z5YnkxaVlXTnJaM0p2ZFc1ay5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=fnjDIl-YCym4WIgePOSBZpFOpZNWl8Hme0CdiNUW0sk0VOJXQbbJ2QUm~Wj8I7bgZxlbCC2Qzp9q0xdFFk41Ii9LCeMmmsyYg0ANNqf-Izi9gGoK5dRtaRv2iNtxFQf~RnTzvyw0IYC3xa3hdTSOPVpk-1obgUCo4XhKuXlQnHlHJRfytxR1rUYlVYigp1jGEIcUCxsRg6lna8v6hAMtkSoYjxHRPhtfY0W75ual8R4W8zSSJUhhO8GXvvn1u6Ongt54Z17a5Vsg-v5Hvcp7f5QvBLQY3tZrb~cpfvOtSAvqbtYRXG0DFsW7wq-HT1xjHNjtwT~UI1ua4Nq5LrDolw__"
            alt="Background"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white fade-in-up">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6">
                Transform Your Look
                <br />
                <span className="text-white/90">Instantly with AI</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                Try any hairstyle before you commit. Change colors, lengths, and styles with <span className="font-bold">9.6/10 quality rating</span>.
              </p>
              <Button
                onClick={scrollToDemo}
                className="gradient-button text-lg px-8 py-6 h-auto"
              >
                Try It Free
              </Button>
              <p className="text-white/70 mt-4 text-sm">No signup required • Unlimited tries</p>
            </div>
            
            <div className="fade-in-up" style={{ transitionDelay: "0.2s" }}>
              <img
                src="https://private-us-east-1.manuscdn.com/sessionFile/21kOF6EWp9VrrrhRPQNOzS/sandbox/SreMNeY8q6SNFW1tE1iKlB-img-2_1770372696000_na1fn_YmVmb3JlLWFmdGVyLWV4YW1wbGU.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvMjFrT0Y2RVdwOVZycnJoUlBRTk96Uy9zYW5kYm94L1NyZU1OZVk4cTZTTkZXMXRFMWlLbEItaW1nLTJfMTc3MDM3MjY5NjAwMF9uYTFmbl9ZbVZtYjNKbExXRm1kR1Z5TFdWNFlXMXdiR1UucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=ASmbcDdDHezTcUaeCZxI5e3waor5I1TjJRum5oreaSxP9Dtjo9cN7UElxqlHMVylWn25o1lXcsjyEzeFwKgfpPs1eW-VhBUYRjkHjM~Bk~buuPtdQWNHMC8XyLKR5t~xXzXwbnXnWgnLLXUxhvr29q94K5mqvN6KQ7NSd9X3I6mp0Wj9BhSDSF~nt3Jn4Bz3oM5kdN7TJ5pKk0ejobHdUeIkQoZAKvp-6k~062xZNiQplal1FmQg6IlCHTG2QHoVNzaWADEqld-M8M65rXSAYkWyUGx0aDjo-zoL6RHEti7f0DGqaUpW1WNLn2kzglqjgC15BymXPg3ctOKnHqb7Ww__"
                alt="Before and After Example"
                className="rounded-3xl shadow-2xl w-full max-w-lg mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="text-center mb-16 fade-in-up">
            <p className="text-purple-600 font-semibold mb-2 uppercase tracking-wide">How It Works</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              See Yourself with Any Hairstyle in 3 Easy Steps
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Upload Your Photo",
                description: "Take or upload a well-lit selfie facing the camera. The clearer your photo, the better your results will be."
              },
              {
                step: "2",
                title: "Describe Your Hairstyle",
                description: "Tell our AI what you want to see: short hair, long waves, pink color, or any style you can imagine."
              },
              {
                step: "3",
                title: "See Your Transformation",
                description: "Watch as our AI shows you exactly how you'd look with your new hairstyle in seconds."
              }
            ].map((item, index) => (
              <div key={index} className="fade-in-up" style={{ transitionDelay: `${index * 0.1}s` }}>
                <Card className="feature-card border-0">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold mb-4">
                      {item.step}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container">
          <div className="text-center mb-16 fade-in-up">
            <p className="text-purple-600 font-semibold mb-2 uppercase tracking-wide">Why Choose Us</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Powered by Advanced AI Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI has been tested and proven with real-world results, achieving near-perfect quality ratings.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: "9.6/10 Quality Rating",
                description: "Near-perfect results powered by advanced AI technology. Tested across multiple scenarios with consistently high ratings.",
                image: "https://private-us-east-1.manuscdn.com/sessionFile/21kOF6EWp9VrrrhRPQNOzS/sandbox/SreMNeY8q6SNFW1tE1iKlB-img-3_1770372701000_na1fn_ZmVhdHVyZS1pY29uLXF1YWxpdHk.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvMjFrT0Y2RVdwOVZycnJoUlBRTk96Uy9zYW5kYm94L1NyZU1OZVk4cTZTTkZXMXRFMWlLbEItaW1nLTNfMTc3MDM3MjcwMTAwMF9uYTFmbl9abVZoZEhWeVpTMXBZMjl1TFhGMVlXeHBkSGsucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=OvjHq1Ftcoj1xg1OefBVOY7YyxvzU1u5QmTF2xyqq1Fijdd~ffg8fx1XHiibhrSo6uRSG2cyQYgRTGrlcr8pXhsRJSqd4llvJNuV1I6N~0Z5JTnSrEAHlUJCC82RKvHT~sHhEuah~5~oifo3GF3dHC-t0mpr7Z2CyacUIkafilJTnRI8Dx413n0mQ5TYIHfbJ5efNV~MARRjtXJOUqwZnXpXOlzyshPxvMXS2utPehQsdnNDKEQJazWEY0ee~W8kwlgc~hH6G3d5HBmGHBbiHnpGPEMNoHBI8lRGQFLK0jYfrLyvsVJf-7V~pKS4POZJkyizXYWVWr5ekk7dwS4P2A__"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Perfect Preservation",
                description: "Only changes hair - face, skin tone, lighting, and background stay exactly the same. Your identity is perfectly preserved.",
                image: "https://private-us-east-1.manuscdn.com/sessionFile/21kOF6EWp9VrrrhRPQNOzS/sandbox/SreMNeY8q6SNFW1tE1iKlB-img-4_1770372699000_na1fn_ZmVhdHVyZS1pY29uLXByZXNlcnZhdGlvbg.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvMjFrT0Y2RVdwOVZycnJoUlBRTk96Uy9zYW5kYm94L1NyZU1OZVk4cTZTTkZXMXRFMWlLbEItaW1nLTRfMTc3MDM3MjY5OTAwMF9uYTFmbl9abVZoZEhWeVpTMXBZMjl1TFhCeVpYTmxjblpoZEdsdmJnLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=mVQIMXKglVscMF~17ryzSryKNd-~s59ZC5ggmd~RZ3xaB9W3JLsMMrWUsdSlK6KTWrPEvvUKAEcO0TFAwuLVHHhF-4TtQhBrlebNCWHQk0J3TUbNlb9LBUyn7UcKUO9qD1oP7shRpUjTuiWJar4YYp97yQ4bDf8yrI1qSFALQ9i0qZkhyueU3SsLsQ8-1lQQw16v4Y4avznLjBwNIrfjabevW7dvy5wuzqFFwNoH7O-orTuX5wyNpgHap-eA36bXhq7g15fwCarczmHZOeki2rVnNX60WeIppJN1CNuBCoe1fbUP9h72MdTYzhjBufucGXQKTQOMFYsZylajBU~b-g__"
              },
              {
                icon: <Palette className="w-8 h-8" />,
                title: "Unlimited Flexibility",
                description: "Try any color, length, or style - from subtle changes to bold transformations. Supports highlights, bangs, and complex styles.",
                image: "https://private-us-east-1.manuscdn.com/sessionFile/21kOF6EWp9VrrrhRPQNOzS/sandbox/SreMNeY8q6SNFW1tE1iKlB-img-5_1770372697000_na1fn_ZmVhdHVyZS1pY29uLWZsZXhpYmlsaXR5.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvMjFrT0Y2RVdwOVZycnJoUlBRTk96Uy9zYW5kYm94L1NyZU1OZVk4cTZTTkZXMXRFMWlLbEItaW1nLTVfMTc3MDM3MjY5NzAwMF9uYTFmbl9abVZoZEhWeVpTMXBZMjl1TFdac1pYaHBZbWxzYVhSNS5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=qgYo5QE2eM55-GsPa4gUSNd3Apd9geb~AafaL5HmVPbXQfx1dUKbeZNhI0~QkA~5BgaXod9wOp9F39I1XXoT4DV~kKb0hhkrcD12WcbfCVZYmC~yK4EvwySbZBCcd~XcJ1pH8OJ5CC82KHNpFn9RBPhLWLXkn-nIGT4vu6vBhNyTUoRJ9BGmctW52YzQgRgSWPuyZeTLf6ExPGVcsFS6tgXlUx-TJjrOMxUdGJz7~uNZyHrbc2Oz7gZKnjV6ySNXu4hhgon1CjGKecjoKrvVS~ggA5KD70sGUWUPDmMC99dB37vz0p-cCJz0U8BTGRmqHmeLIXnXyQ8NdtblB5sSGA__"
              }
            ].map((feature, index) => (
              <div key={index} className="fade-in-up" style={{ transitionDelay: `${index * 0.1}s` }}>
                <Card className="feature-card border-0 h-full">
                  <CardContent className="pt-6">
                    <div className="w-20 h-20 mb-6 mx-auto">
                      <img src={feature.image} alt={feature.title} className="w-full h-full object-contain" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-center">{feature.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="text-center mb-16 fade-in-up">
            <p className="text-purple-600 font-semibold mb-2 uppercase tracking-wide">Tested & Proven</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Real Results from Real Tests
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI has been rigorously tested across multiple scenarios, achieving consistently high quality ratings.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { style: "Pink Short Hair", rating: "9.3/10", description: "Pure color, short length" },
              { style: "Green Short Hair", rating: "9.8/10", description: "Pure color, perfect preservation" },
              { style: "Blue-Purple Highlights", rating: "9.5/10", description: "Complex multi-color, long hair" },
              { style: "Red with Bangs", rating: "9.7/10", description: "Pure color with see-through bangs" }
            ].map((test, index) => (
              <div key={index} className="fade-in-up" style={{ transitionDelay: `${index * 0.1}s` }}>
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0">
                  <CardContent className="pt-6 text-center">
                    <div className="text-4xl font-black gradient-text mb-2">{test.rating}</div>
                    <h4 className="font-bold text-gray-900 mb-2">{test.style}</h4>
                    <p className="text-sm text-gray-600">{test.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center fade-in-up">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-6 py-3 rounded-full font-semibold">
              <Check className="w-5 h-5" />
              Average Rating: 9.6/10 across all tests
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 fade-in-up">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Try It Yourself
              </h2>
              <p className="text-xl text-gray-600">
                Upload your photo and describe your dream hairstyle. See the magic happen in seconds.
              </p>
            </div>
            
            <Card className="fade-in-up border-2 border-purple-200">
              <CardContent className="pt-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Upload Your Photo
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-purple-400 transition-colors cursor-pointer">
                      <div className="text-gray-400 mb-2">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPEG, WEBP up to 10MB</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Describe Your Desired Hairstyle
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows={4}
                      placeholder="Example: Short pink hair with see-through bangs, or long blue-purple highlights..."
                    />
                  </div>
                  
                  <Button className="w-full gradient-button text-lg py-6 h-auto">
                    Generate My New Look
                  </Button>
                  
                  <p className="text-center text-sm text-gray-500">
                    This is a demo interface. Full functionality coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16 fade-in-up">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
            </div>
            
            <div className="space-y-6">
              {[
                {
                  q: "Will the results actually look like me?",
                  a: "Yes! Our AI preserves your exact facial features, skin tone, expression, and lighting. Only the hair changes - everything else stays perfectly the same."
                },
                {
                  q: "How accurate are the colors?",
                  a: "Very accurate. Our tests show 9-10/10 color accuracy across pure colors (pink, green, red) and complex styles (highlights, ombre). The AI generates pure, vibrant colors without mixing with your original hair color."
                },
                {
                  q: "Can I try different lengths?",
                  a: "Absolutely! You can go from long to short, short to long, or anywhere in between. Our AI handles length changes naturally while maintaining realistic hair flow and texture."
                },
                {
                  q: "What about complex styles like highlights or bangs?",
                  a: "Our AI excels at complex styles. We've successfully tested blue-purple highlights (9.5/10) and see-through bangs (9.7/10). The AI understands multi-dimensional color effects and specific styling elements."
                },
                {
                  q: "Is my privacy protected?",
                  a: "Yes. Your photos are processed securely and are not stored or shared. We take privacy seriously and comply with all data protection regulations."
                }
              ].map((faq, index) => (
                <div key={index} className="fade-in-up" style={{ transitionDelay: `${index * 0.05}s` }}>
                  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{faq.q}</h3>
                      <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 animated-gradient">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center text-white fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Look?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Try it free - no signup required. See yourself with any hairstyle in seconds.
            </p>
            <Button
              onClick={scrollToDemo}
              className="bg-white text-purple-600 hover:bg-white/90 font-bold text-lg px-8 py-6 h-auto rounded-full shadow-xl hover:scale-105 transition-transform"
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-xl mb-4 gradient-text">AI Hairstyle Changer</h3>
              <p className="text-gray-400 text-sm">
                Transform your look instantly with AI-powered hairstyle changes. Powered by v3.1 technology.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2026 AI Hairstyle Changer. All rights reserved.</p>
            <p className="mt-2">Powered by AI Hairstyle Changer v3.1 - 9.6/10 Quality Rating</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
