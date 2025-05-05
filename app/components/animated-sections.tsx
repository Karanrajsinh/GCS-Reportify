'use client';

import { motion } from "framer-motion";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { PreviewTable } from "@/app/components/preview-table";
import { Database, LineChart, Share2, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import Link from "next/link";

const fadeInUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function HeroSection() {
  return (
    <>
      <motion.div
        className="container mx-auto px-4 h-[70vh] lg:h-[60vh] mb-24 flex justify-center  md:px-2 md:py-0 md:mb-52 max-w-8xl overflow-hidden"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="flex flex-col space-y-6">
            <motion.div
              className="space-y-4 h-full"
              variants={fadeInUp}
            >
              <motion.div
                className="flex items-center gap-2 text-primary"
                variants={fadeInUp}
              >
                <Sparkles className="h-4 w-4 lg:h-5 lg:w-5" />
                <span className="text-xs lg:text-sm font-medium">AI-Powered Analytics</span>
              </motion.div>
              <h1 className=" font-bold tracking-tighter text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-left">
                Transform Your{" "}
                <span className="text-primary bg-clip-text bg-gradient-to-r from-primary to-[#4F46E5]">
                  Google Search Console
                </span>{" "}
                Data Into Actionable Insights
              </h1>
              <p className="max-w-[600px] text-xs sm:text-base lg:text-lg text-muted-foreground text-left">
                Create customized reports from your Google Search Console data with  intuitive
                drag-and-drop interface, enhanced with AI-powered intent analysis.
              </p>
            </motion.div>
            <motion.div
              className="flex flex-col gap-3 sm:flex-row"
              variants={fadeInUp}
            >
              <Link href="/login">
                <Button size="lg" className="group h-10 px-5 sm:h-11 sm:px-6 lg:h-12 lg:px-8 shadow-glow hover:shadow-none transition-all duration-300">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>
            <motion.div
              className="flex flex-wrap sm:flex-nowrap sm:justify-between gap-3 lg:gap-4 text-xs lg:text-sm text-muted-foreground"
              variants={fadeInUp}
            >
            </motion.div>
          </div>
          <motion.div
            className="relative mx-auto lg:mx-0 w-full max-w-[90vw] sm:max-w-[70vw] md:max-w-full overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-[#4F46E5]/20 rounded-xl blur-[40px] sm:blur-[60px] lg:blur-[100px] opacity-80" />
            <div className="relative w-full shadow-2xl border border-border/60 rounded-xl">
              <PreviewTable />
            </div>
          </motion.div>
        </div>
      </motion.div>
      <FeaturesSection />
    </>
  );
}

export function FeaturesSection() {
  return (
    <div className="container mx-auto px-4 md:px-6">
      <motion.div
        className="flex flex-col items-center justify-center space-y-3 md:space-y-4 text-center mb-12 md:mb-20"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="space-y-2 md:space-y-4 max-w-2xl mx-auto">
          <div className="inline-block rounded-full bg-primary/10 px-3 py-1 md:px-4 md:py-1.5 text-xs md:text-sm font-medium text-primary">
            Features
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tighter">
            Everything you need to build powerful GSC reports
          </h2>
          <p className="text-base md:text-xl text-muted-foreground">
            Streamline the process of creating comprehensive Google Search Console reports,
            saving your time and providing deeper insights.
          </p>
        </div>
      </motion.div>
      <motion.div
        className="grid gap-6 md:gap-12 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp}>
          <Card className="group relative h-full overflow-hidden bg-gradient-to-b from-background to-primary/5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-primary/10">
            <CardHeader className="pb-4 md:pb-8">
              <div className="mb-2 md:mb-4 w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                <Database className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <CardTitle className="text-lg md:text-2xl">GSC Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm md:text-lg text-muted-foreground leading-relaxed">
                Seamlessly connect to your Google Search Console data through secure OAuth authentication.
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={fadeInUp}>
          <Card className="group relative h-full overflow-hidden bg-gradient-to-b from-background to-primary/5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-primary/10">
            <CardHeader className="pb-4 md:pb-8">
              <div className="mb-2 md:mb-4 w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                <LineChart className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <CardTitle className="text-lg md:text-2xl">Custom Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm md:text-lg text-muted-foreground leading-relaxed">
                Drag and drop metrics like Clicks, Impressions, CTR, and Position with flexible time ranges.
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={fadeInUp}>
          <Card className="group relative h-full overflow-hidden bg-gradient-to-b from-background to-primary/5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-primary/10">
            <CardHeader className="pb-4 md:pb-8">
              <div className="mb-2 md:mb-4 w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                <Share2 className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <CardTitle className="text-lg md:text-2xl">Export Options</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm md:text-lg text-muted-foreground leading-relaxed">
                Export your reports to CSV format with a single click for further analysis and sharing.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}