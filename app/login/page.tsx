"use client"

import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'
import { ModeToggle } from '../components/theme-toggle'
import { BarChart3 } from 'lucide-react'

export default function Home() {


    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-black/50 shadow-sm">
                <div className="container mx-auto flex flex-row justify-between items-center p-4 lg:p-5 max-w-7xl">
                    <div className="flex items-center mt-2 justify-center space-x-2 sm:space-x-4 mb-2 sm:mb-0">
                        <BarChart3 className="text-lg sm:text-2xl lg:text-4xl text-primary" />
                        <Link href={'/'} className="text-sm lg:text-lg font-bold ">GSC Reportify</Link>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <ModeToggle />
                    </div>
                </div>
            </header>
            <div className="h-[80vh] flex justify-center items-center p-4 sm:p-6 lg:p-8">
                <SignIn
                    redirectUrl='/websites'
                    routing='hash'
                />
            </div>
        </div>
    )
}