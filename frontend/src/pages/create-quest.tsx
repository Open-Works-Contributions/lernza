import { ArrowLeft, Sparkles, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export function CreateQuest() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[calc(100vh-67px)] flex items-center justify-center relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-grid-dots pointer-events-none opacity-30" />
      
      <div className="relative px-4 max-w-lg mx-auto w-full">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-6 transition-colors cursor-pointer group"
        >
          <div className="w-7 h-7 border-[2px] border-black bg-white shadow-[2px_2px_0_#000] flex items-center justify-center neo-press hover:shadow-[3px_3px_0_#000] active:shadow-[1px_1px_0_#000] group-hover:bg-primary transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
          </div>
          Go Back
        </button>

        <div className="bg-white border-[3px] border-black shadow-[8px_8px_0_#000] overflow-hidden animate-scale-in">
          <div className="bg-primary border-b-[3px] border-black px-6 py-3 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider">Create Quest</span>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="p-8 sm:p-10 text-center">
            <div className="w-20 h-20 bg-secondary border-[3px] border-black shadow-[4px_4px_0_#000] flex items-center justify-center mb-6 mx-auto animate-fade-in-up">
              <Wand2 className="h-8 w-8" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black mb-3 animate-fade-in-up stagger-1">
              Coming Soon
            </h2>
            
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto animate-fade-in-up stagger-2">
              The quest creation interface is currently under construction. Check back later to create your own learn-to-earn quests.
            </p>
            
            <Button
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="shimmer-on-hover animate-fade-in-up stagger-3"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-4 -right-4 w-10 h-10 bg-primary border-[2px] border-black shadow-[3px_3px_0_#000] rotate-12 animate-fade-in-up stagger-4 hidden sm:block" />
        <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-success border-[2px] border-black shadow-[2px_2px_0_#000] -rotate-6 animate-fade-in-up stagger-5 hidden sm:block" />
      </div>
    </div>
  )
}
