import { useState, useEffect, useCallback } from "react"
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useInView } from "@/hooks/use-animations"
import { useWallet } from "@/hooks/use-wallet"
import { formatTokens } from "@/lib/utils"
import { questClient } from "@/lib/contracts/quest"
import type { QuestInfo } from "@/lib/contracts/quest"
import { milestoneClient } from "@/lib/contracts/milestone"
import type { MilestoneInfo } from "@/lib/contracts/milestone"
import { rewardsClient } from "@/lib/contracts/rewards"

// Sub-components
import { QuestHeader } from "@/components/quest-detail/quest-header"
import { QuestStats } from "@/components/quest-detail/quest-stats"
import { QuestMilestones } from "@/components/quest-detail/quest-milestones"
import { QuestEnrollees } from "@/components/quest-detail/quest-enrollees"

interface QuestViewProps {
  questId: number
  onBack: () => void
}

type Tab = "milestones" | "enrollees"

export function QuestView({ questId, onBack }: QuestViewProps) {
  const { address, connected } = useWallet()
  const [activeTab, setActiveTab] = useState<Tab>("milestones")
  const [expandedMilestone, setExpandedMilestone] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quest, setQuest] = useState<QuestInfo | null>(null)
  const [milestones, setMilestones] = useState<MilestoneInfo[]>([])
  const [enrollees, setEnrollees] = useState<string[]>([])
  const [completions, setCompletions] = useState<number>(0)
  const [poolBalance, setPoolBalance] = useState<bigint>(0n)
  
  const [statsRef, statsInView] = useInView()
  const [contentRef, contentInView] = useInView()

  const fetchQuestDetails = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const q = await questClient.getQuest(questId)
      if (!q) {
        setError("Quest not found.")
        setLoading(false)
        return
      }
      setQuest(q)

      const [ms, enrs, balance] = await Promise.all([
        milestoneClient.getMilestones(questId),
        questClient.getEnrollees(questId),
        rewardsClient.getPoolBalance(questId),
      ])

      setMilestones(ms)
      setEnrollees(enrs)
      setPoolBalance(balance)

      if (address) {
        const completedCount = await milestoneClient.getEnrolleeCompletions(questId, address)
        setCompletions(completedCount)
      }
    } catch (err) {
      console.error("Failed to fetch quest details:", err)
      setError("Failed to load quest details from the network.")
    } finally {
      setLoading(false)
    }
  }, [questId, address])

  useEffect(() => {
    fetchQuestDetails()
  }, [fetchQuestDetails])

  const totalReward = milestones.reduce((sum, m) => sum + m.rewardAmount, 0n)
  const earnedReward = completions > 0 && milestones.length > 0 
    ? (totalReward * BigInt(completions)) / BigInt(milestones.length) 
    : 0n

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 text-center flex flex-col items-center">
        <Loader2 className="h-10 w-10 animate-spin mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
            Fetching decentralized quest data...
        </p>
      </div>
    )
  }

  if (error || !quest) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 text-center">
        <div className="w-16 h-16 bg-destructive/10 border-[3px] border-black flex items-center justify-center mb-6 mx-auto animate-shake">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-black mb-4">{error || "Quest not found"}</h2>
        <Button variant="outline" onClick={onBack} className="border-black neo-lift">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go back to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-8">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-grid-dots pointer-events-none opacity-20" />

      {/* Navigation */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground mb-6 transition-all cursor-pointer group hover:translate-x-[-4px]"
      >
        <div className="w-8 h-8 border-[2px] border-black bg-white shadow-[2px_2px_0_#000] flex items-center justify-center neo-press group-hover:bg-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </div>
        Back to Dashboard
      </button>

      {/* 1. Header Section */}
      <QuestHeader 
        quest={quest}
        address={address}
        isComplete={completions === milestones.length && milestones.length > 0}
        onAddEnrollee={() => alert("Owner only: Add Enrollee via wallet sign")}
        onAddMilestone={() => alert("Owner only: Define new learning goal")}
        onEdit={() => alert("Edit quest metadata")}
        onFund={() => alert("Funding Reward Pool: requires USDC transfer")}
      />

      {/* 2. Stats Section */}
      <QuestStats 
        enrollees={enrollees.length}
        milestones={milestones.length}
        poolBalance={poolBalance}
        totalReward={totalReward}
        deadlineDays={30}
        statsInView={statsInView}
      />
      
      <div ref={statsRef} />

      {/* 3. User Progress Bar (Enrollees Only) */}
      {connected && address && enrollees.includes(address) && (
        <div className="mb-8 animate-fade-in-up stagger-3">
          <div className="bg-white border-[3px] border-black shadow-[4px_4px_0_#000] p-6 relative overflow-hidden group">
            <div className="absolute right-[-20px] top-[-20px] w-24 h-24 bg-success/5 rotate-12 transition-transform group-hover:scale-110" />
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-sm font-black uppercase tracking-widest">Your Achievement Progress</span>
                {earnedReward > 0n && (
                   <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                      <p className="text-xs font-bold text-green-700">
                        {formatTokens(Number(earnedReward))} USDC ready for distribution
                      </p>
                   </div>
                )}
              </div>
              <div className="text-right">
                <span className="text-2xl font-black tabular-nums">
                  {completions === milestones.length ? 100 : Math.round((completions / milestones.length) * 100)}%
                </span>
                <p className="text-[10px] font-black opacity-50 uppercase tracking-tighter">Verified Goals</p>
              </div>
            </div>
            <Progress value={completions} max={milestones.length} className="h-3 border-[2px] border-black" />
          </div>
        </div>
      )}

      {/* 4. Tabs & Content */}
      <div className="flex gap-0 border-b-[3px] border-black mb-8 pt-4" ref={contentRef}>
        {(["milestones", "enrollees"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3.5 text-xs font-black uppercase tracking-widest border-[3px] border-b-0 transition-all capitalize cursor-pointer -mb-[3px] relative ${
              activeTab === tab
                ? "border-black bg-primary translate-y-[-2px] shadow-[3px_-3px_0_#000]"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/20"
            }`}
          >
            {tab}
            <span className="ml-2 text-[10px] opacity-60">
              [{tab === "milestones" ? milestones.length : enrollees.length}]
            </span>
          </button>
        ))}
      </div>

      <div className={`transition-all duration-300 ${contentInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {activeTab === "milestones" ? (
          <QuestMilestones 
            milestones={milestones}
            completions={completions}
            isOwner={quest.owner === address}
            expandedMilestone={expandedMilestone}
            setExpandedMilestone={setExpandedMilestone}
            onAddMilestone={() => alert("New Milestone logic")}
            onVerify={(id) => alert(`Owner only: Verify completion of Step ${id + 1}`)}
          />
        ) : (
          <QuestEnrollees 
            enrollees={enrollees}
            isOwner={quest.owner === address}
            onAddEnrollee={() => alert("Invite Enrollee logic")}
            totalMilestones={milestones.length}
          />
        )}
      </div>

      {/* Floating Action Button (for non-enrolled users) */}
      {connected && address && !enrollees.includes(address) && quest.owner !== address && (
        <div className="fixed bottom-8 right-8 z-50 animate-bounce-custom">
            <Button size="lg" className="h-16 px-10 rounded-none shadow-[8px_8px_0_#000] hover:shadow-[10px_10px_0_#000] border-black border-[3px] active:translate-y-1 active:shadow-[2px_2px_0_#000] transition-all">
                <Users className="h-5 w-5 mr-3" />
                Enroll in Quest
            </Button>
        </div>
      )}
    </div>
  )
}

// End of QuestView
