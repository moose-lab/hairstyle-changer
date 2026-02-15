import { motion, AnimatePresence } from "framer-motion";
import { Download, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ResultDisplayProps {
  originalImage?: string | null;
  resultImage: string | null;
  isLoading: boolean;
  error: string | null;
  onReset: () => void;
}

export function ResultDisplay({
  resultImage,
  isLoading,
  error,
  onReset,
}: ResultDisplayProps) {
  const handleDownload = async () => {
    if (!resultImage) return;

    try {
      // Fetch the image as a blob so download works for any origin
      const resp = await fetch(resultImage);
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "hairstyle-result.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback: open image in new tab
      window.open(resultImage, "_blank");
    }
  };

  // Don't render anything if there's nothing to show
  if (!isLoading && !error && !resultImage) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {/* Loading State */}
      {isLoading && (
        <motion.div
          key="loading"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl mx-auto"
        >
          <Card className="p-12 flex flex-col items-center justify-center space-y-6 bg-gradient-to-br from-purple-50/50 to-pink-50/50 border-purple-200/50">
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Loader2 className="w-16 h-16 text-purple-600" />
            </motion.div>

            <motion.p
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-xl font-semibold text-gray-700"
            >
              Transforming your hairstyle...
            </motion.p>

            {/* Progress bar animation */}
            <div className="w-full max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ width: "50%" }}
              />
            </div>
          </Card>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          key="error"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl mx-auto"
        >
          <Card className="p-8 bg-red-50/50 border-red-200">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-red-900">
                Oops! Something went wrong
              </h3>
              <p className="text-red-700 text-center max-w-md">{error}</p>
              <Button
                onClick={onReset}
                variant="outline"
                className="mt-4 border-red-300 hover:bg-red-100 text-red-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Success State */}
      {resultImage && !isLoading && !error && (
        <motion.div
          key="success"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full space-y-6"
        >
          {/* Result Image */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-center">
              New Hairstyle
            </h3>
            <div className="relative rounded-xl overflow-hidden shadow-2xl ring-2 ring-purple-500/20">
              <motion.img
                src={resultImage}
                alt="New Hairstyle"
                className="w-full h-auto object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              />
              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  duration: 1.5,
                  delay: 0.8,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center"
          >
            <Button
              onClick={handleDownload}
              size="lg"
              className={cn(
                "w-full sm:w-auto",
                "bg-gradient-to-r from-purple-600 to-pink-600",
                "hover:from-purple-700 hover:to-pink-700",
                "text-white font-semibold",
                "shadow-lg hover:shadow-xl",
                "transition-all duration-300"
              )}
            >
              <Download className="w-5 h-5 mr-2" />
              Download Result
            </Button>

            <Button
              onClick={onReset}
              size="lg"
              variant="outline"
              className={cn(
                "w-full sm:w-auto",
                "border-2 border-purple-300",
                "hover:bg-purple-50",
                "text-purple-700 font-semibold",
                "transition-all duration-300"
              )}
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Another Style
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
