import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageUpload } from "@/components/ImageUpload";
import { ResultDisplay } from "@/components/ResultDisplay";
import HairstyleSelector from "@/components/HairstyleSelector";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, Shield, Palette, Check, Coins, User, LogIn } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { ANONYMOUS_FREE_TRIES, INITIAL_CREDITS } from "@shared/const";

const ANON_TRIES_KEY = "hairstyle_anon_tries";

function getAnonTries(): number {
  try {
    return parseInt(localStorage.getItem(ANON_TRIES_KEY) || "0", 10);
  } catch {
    return 0;
  }
}

function incrementAnonTries(): number {
  const next = getAnonTries() + 1;
  try {
    localStorage.setItem(ANON_TRIES_KEY, String(next));
  } catch {
    // localStorage unavailable — allow anyway
  }
  return next;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, credits, refreshCredits } = useAuth();
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Hairstyle changer state
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [anonTriesUsed, setAnonTriesUsed] = useState(getAnonTries);

  const handleImageSelect = useCallback((base64Data: string, mimeType: string) => {
    setImageData(base64Data);
    setImageMimeType(mimeType);
    setPreviewUrl(`data:${mimeType};base64,${base64Data}`);
    // Clear previous results when a new image is selected
    setResultImage(null);
    setError(null);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!imageData || !prompt.trim()) {
      toast.error("Missing input", {
        description: "Please upload a photo and describe your desired hairstyle.",
      });
      return;
    }

    // Gate: anonymous users limited to ANONYMOUS_FREE_TRIES
    if (!user && anonTriesUsed >= ANONYMOUS_FREE_TRIES) {
      toast.error("Free tries used up", {
        description: `Sign up to get ${INITIAL_CREDITS} free credits and keep transforming!`,
      });
      setLocation("/signup");
      return;
    }

    // Gate: authenticated users need credits
    if (user && credits !== null && credits <= 0) {
      toast.error("No credits remaining", {
        description: "You've used all your credits. More purchasing options coming soon.",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const response = await fetch("/api/hairstyle/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          image: `data:${imageMimeType};base64,${imageData}`,
          prompt: prompt.trim(),
        }),
      });

      // Guard against non-JSON responses (e.g. Vercel returning
      // "Request Entity Too Large" as plain text / HTML)
      let data: Record<string, unknown>;
      const ct = response.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(
          response.status === 413
            ? "Image is too large. Please upload a smaller photo."
            : text.slice(0, 200) || `Server error (${response.status})`
        );
      }

      if (!response.ok || !data.success) {
        throw new Error((data.error as string) || "Failed to generate hairstyle");
      }

      setResultImage(data.image as string);

      if (user) {
        // Refresh credits from server after successful generation
        await refreshCredits();
        toast.success("Hairstyle generated!", {
          description: `Check out your new look! ${data.credits ?? ""} credits remaining.`,
        });
      } else {
        // Track anonymous usage
        const newCount = incrementAnonTries();
        setAnonTriesUsed(newCount);
        const remaining = ANONYMOUS_FREE_TRIES - newCount;
        if (remaining > 0) {
          toast.success("Hairstyle generated!", {
            description: `${remaining} free ${remaining === 1 ? "try" : "tries"} remaining. Sign up for ${INITIAL_CREDITS} more!`,
          });
        } else {
          toast.success("Hairstyle generated!", {
            description: `That was your last free try. Sign up to get ${INITIAL_CREDITS} credits!`,
          });
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      toast.error("Generation failed", { description: message });
    } finally {
      setIsLoading(false);
    }
  }, [imageData, imageMimeType, prompt, user, credits, anonTriesUsed, refreshCredits, setLocation]);

  const handleReset = useCallback(() => {
    setResultImage(null);
    setError(null);
    setIsLoading(false);
  }, []);

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

  // Determine what to show for the generate button area
  const canGenerate = user
    ? (credits === null || credits > 0) // logged in: allow if credits unknown or > 0
    : anonTriesUsed < ANONYMOUS_FREE_TRIES; // anonymous: allow if under limit

  return (
    <div className="min-h-screen">
      {/* Auth Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="container flex items-center justify-between h-14">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-lg font-black gradient-text"
          >
            AI Hairstyle Changer
          </button>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-full text-sm font-medium text-purple-700">
                  <Coins className="w-3.5 h-3.5" />
                  {credits ?? "..."} credits
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setLocation("/account")}
                >
                  <User className="w-4 h-4" />
                  {user.name || "Account"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/login")}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  className="gradient-button"
                  onClick={() => setLocation("/signup")}
                >
                  Sign Up Free
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden animated-gradient min-h-screen flex items-center pt-14">
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
              <p className="text-white/70 mt-4 text-sm">
                {user
                  ? `${credits ?? "..."} credits remaining`
                  : `${Math.max(0, ANONYMOUS_FREE_TRIES - anonTriesUsed)} free ${ANONYMOUS_FREE_TRIES - anonTriesUsed === 1 ? "try" : "tries"} • No signup required`}
              </p>
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
          <div className="text-center mb-12 fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Try It Yourself
            </h2>
            <p className="text-xl text-gray-600">
              Upload your photo and describe your dream hairstyle. See the magic happen in seconds.
            </p>
          </div>

          {/* Left-Right Layout: Input | Output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto fade-in-up">
            {/* Left Panel: Upload + Hairstyle Selector + Generate */}
            <Card className="border-2 border-purple-200 h-fit">
              <CardContent className="pt-8">
                <div className="space-y-6">
                  {/* Step 1: Upload Photo */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Upload Your Photo
                    </label>
                    <ImageUpload
                      onImageSelect={handleImageSelect}
                      selectedImage={previewUrl}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Step 2: Choose / Describe Hairstyle */}
                  <HairstyleSelector
                    onPromptChange={setPrompt}
                    prompt={prompt}
                    disabled={isLoading}
                  />

                  {/* Generate Button + Status */}
                  {canGenerate ? (
                    <Button
                      className="w-full gradient-button text-lg py-6 h-auto"
                      onClick={handleGenerate}
                      disabled={isLoading || !imageData || !prompt.trim()}
                    >
                      {isLoading ? "Generating..." : "Generate My New Look"}
                    </Button>
                  ) : user ? (
                    <div className="text-center space-y-3">
                      <p className="text-sm text-gray-500">You're out of credits.</p>
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => setLocation("/account")}
                      >
                        View Account
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center space-y-3">
                      <p className="text-sm text-gray-500">
                        You've used your {ANONYMOUS_FREE_TRIES} free tries.
                      </p>
                      <Button
                        className="w-full gradient-button text-lg py-6 h-auto"
                        onClick={() => setLocation("/signup")}
                      >
                        <LogIn className="w-5 h-5 mr-2" />
                        Sign Up for {INITIAL_CREDITS} Free Credits
                      </Button>
                    </div>
                  )}

                  {/* Credit / Trial Status */}
                  <div className="text-center text-xs text-gray-400">
                    {user ? (
                      <span>{credits ?? "..."} credits remaining • 1 credit per generation</span>
                    ) : anonTriesUsed < ANONYMOUS_FREE_TRIES ? (
                      <span>
                        {ANONYMOUS_FREE_TRIES - anonTriesUsed} of {ANONYMOUS_FREE_TRIES} free tries remaining
                      </span>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Panel: Progress + Result Output */}
            <div className="flex items-start justify-center">
              {!isLoading && !error && !resultImage ? (
                <Card className="w-full border-2 border-dashed border-gray-200 h-full min-h-[400px] flex items-center justify-center">
                  <CardContent className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">
                      Your Result Will Appear Here
                    </h3>
                    <p className="text-gray-400 text-sm max-w-xs mx-auto">
                      Upload a photo and choose a hairstyle to see your transformation
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="w-full">
                  <ResultDisplay
                    originalImage={previewUrl}
                    resultImage={resultImage}
                    isLoading={isLoading}
                    error={error}
                    onReset={handleReset}
                  />
                </div>
              )}
            </div>
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
              {user
                ? "Head to the demo above and use your credits to try new styles."
                : `Try ${ANONYMOUS_FREE_TRIES} hairstyles free, then sign up for ${INITIAL_CREDITS} more credits.`}
            </p>
            {user ? (
              <Button
                onClick={scrollToDemo}
                className="bg-white text-purple-600 hover:bg-white/90 font-bold text-lg px-8 py-6 h-auto rounded-full shadow-xl hover:scale-105 transition-transform"
              >
                Try a New Style
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={scrollToDemo}
                  className="bg-white text-purple-600 hover:bg-white/90 font-bold text-lg px-8 py-6 h-auto rounded-full shadow-xl hover:scale-105 transition-transform"
                >
                  Try It Free
                </Button>
                <Button
                  onClick={() => setLocation("/signup")}
                  className="bg-white/20 text-white hover:bg-white/30 font-bold text-lg px-8 py-6 h-auto rounded-full border-2 border-white/40 hover:scale-105 transition-transform"
                >
                  Sign Up for {INITIAL_CREDITS} Credits
                </Button>
              </div>
            )}
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
