'use client';

import { motion } from "framer-motion";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { PreviewTable } from "@/app/components/preview-table";
import { SignInButton } from "@clerk/nextjs";
import { BarChart3, Database, LineChart, Share2, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
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
    <motion.div
      className="container mx-auto px-4 md:px-6 max-w-7xl"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
        <div className="flex flex-col justify-center space-y-8">
          <motion.div
            className="space-y-4"
            variants={fadeInUp}
          >
            <motion.div
              className="flex items-center gap-2 text-primary"
              variants={fadeInUp}
            >
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium">AI-Powered Analytics</span>
            </motion.div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl/none text-center lg:text-left">
              Transform Your{" "}
              <span className="text-primary bg-clip-text  bg-gradient-to-r from-primary to-[#4F46E5]">
                Search Console
              </span>{" "}
              Data Into Actionable Insights
            </h1>
            <p className="max-w-[600px] text-lg text-muted-foreground text-center lg:text-left mx-auto lg:mx-0">
              Create customized reports from your Google Search Console data with our intuitive
              drag-and-drop interface, enhanced with AI-powered intent analysis.
            </p>
          </motion.div>
          <motion.div
            className="flex flex-col gap-4 sm:flex-row justify-center lg:justify-start"
            variants={fadeInUp}
          >
            <SignInButton mode="modal">
              <Link href="/websites">
                <Button size="lg" className="group h-12 px-8 shadow-glow hover:shadow-none transition-all duration-300">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </SignInButton>
          </motion.div>
          <motion.div
            className="flex items-center gap-4 text-sm text-muted-foreground justify-center lg:justify-start"
            variants={fadeInUp}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Free forever plan</span>
            </div>
          </motion.div>
        </div>
        <motion.div
          className="relative mx-auto lg:mx-0 w-full max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-[#4F46E5]/10 rounded-lg blur-[100px]" />
          <div className="relative w-fit shadow-xl border border-border/50">
            <PreviewTable />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function FeaturesSection() {
  return (
    <div className="container mx-auto px-4 md:px-6">
      <motion.div
        className="flex flex-col items-center justify-center space-y-4 text-center mb-20"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Features
          </div>
          <h2 className="text-4xl font-bold tracking-tighter md:text-5xl">
            Everything you need to build powerful GSC reports
          </h2>
          <p className="text-xl text-muted-foreground">
            Our platform streamlines the process of creating comprehensive Google Search Console reports,
            saving you time and providing deeper insights.
          </p>
        </div>
      </motion.div>
      <motion.div
        className="grid gap-12 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp}>
          <Card className="group relative h-full overflow-hidden bg-gradient-to-b from-background to-primary/5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-primary/10">
            <CardHeader className="pb-8">
              <div className="mb-4 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">GSC Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Seamlessly connect to your Google Search Console data through secure OAuth authentication.
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={fadeInUp}>
          <Card className="group relative h-full overflow-hidden bg-gradient-to-b from-background to-primary/5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-primary/10">
            <CardHeader className="pb-8">
              <div className="mb-4 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                <LineChart className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Custom Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Drag and drop metrics like Clicks, Impressions, CTR, and Position with flexible time ranges.
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={fadeInUp}>
          <Card className="group relative h-full overflow-hidden bg-gradient-to-b from-background to-primary/5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-primary/10">
            <CardHeader className="pb-8">
              <div className="mb-4 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                <Share2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Export Options</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Export your reports to CSV format with a single click for further analysis and sharing.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
