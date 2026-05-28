/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Calendar, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  LayoutDashboard, 
  LogOut, 
  Moon, 
  PenLine, 
  Settings, 
  Sun, 
  Target, 
  Trophy, 
  User, 
  Flame,
  Plus,
  Bell,
  Search,
  MessageSquare,
  Zap,
  BookOpen,
  Filter,
  MoreVertical,
  Activity,
  Award
} from 'lucide-react';

// --- Components ---

const Button = ({ children, variant = 'primary', size = 'md', className = '', onClick }: any) => {
  const variants: any = {
    primary: 'bg-primary text-text hover:bg-primary-dim shadow-[0_0_20px_rgba(232,98,42,0.3)]',
    ghost: 'btn-bordered text-text bg-transparent',
    secondary: 'bg-bg-elevated text-text hover:bg-bg-hover border border-border',
    danger: 'bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20',
  };
  const sizes: any = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };
  
  return (
    <button 
      onClick={onClick}
      className={`rounded-radius-md font-medium transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = '', title, subtitle, icon: Icon }: any) => {
  return (
    <div className={`glass rounded-radius-lg p-6 border border-border hover:border-primary/20 transition-colors ${className}`}>
      {(title || Icon) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && <h3 className="text-text font-semibold">{title}</h3>}
            {subtitle && <p className="text-text-muted text-xs">{subtitle}</p>}
          </div>
          {Icon && <Icon className="w-5 h-5 text-primary" />}
        </div>
      )}
      {children}
    </div>
  );
};

const Badge = ({ children, variant = 'info', className = '' }: any) => {
  const variants: any = {
    info: 'bg-info/10 text-info border-info/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    danger: 'bg-danger/10 text-danger border-danger/20',
    success: 'bg-success/10 text-success border-success/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${variants[variant]} ${className}`}>
      {children.toUpperCase()}
    </span>
  );
};

// --- Screens ---

const LandingPage = ({ onJoin }: { onJoin: () => void }) => {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 bg-bg">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] animate-drift"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/15 blur-[120px] animate-drift" style={{ animationDelay: '-5s' }}></div>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xl font-bold font-sans">
          <span className="text-2xl">ᨒ</span>
          <span className="gradient-text">Ascendly</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-text-muted">
          <a href="#features" className="hover:text-text transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-text transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-text transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-sm font-medium text-text-muted hover:text-text px-4 py-2" onClick={onJoin}>Login</button>
          <Button size="sm" onClick={onJoin}>Get Started</Button>
        </div>
      </nav>

      {/* Hero */}
      <header className="max-w-5xl mx-auto px-6 pt-24 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6 leading-[1.1]">
            <span className="block">Stop guessing.</span>
            <span className="gradient-text block">Start growing.</span>
          </h1>
          <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Ascendly tracks your study sessions, daily habits, tasks, and journal entries — 
            so you always know where your time goes and where you're headed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={onJoin}>Start for free</Button>
            <Button variant="ghost" size="lg">See how it works</Button>
          </div>
        </motion.div>
      </header>

      {/* Pain Points */}
      <section className="max-w-7xl mx-auto px-6 py-20 divide-y md:divide-y-0 md:divide-x divide-border grid grid-cols-1 md:grid-cols-3">
        {[
          { icon: Target, title: "Progression Paralysis", desc: "You study for hours but can't tell if you're actually progressing toward your goal." },
          { icon: Clock, title: "Vanishing Time", desc: "Your days slip by without a clear record of what you built or what you learned." },
          { icon: Trophy, title: "Habit Disconnect", desc: "Your goals exist and sound great. Your daily habits just don't reflect them yet." },
        ].map((p, i) => (
          <div key={i} className="p-10 flex flex-col items-center text-center group">
            <div className="w-12 h-12 rounded-radius-md bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 transition-transform">
              <p.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-text">{p.title}</h3>
            <p className="text-text-muted leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-20">
          <Badge className="mb-4">Capabilities</Badge>
          <h2 className="text-4xl font-bold mb-4">Everything you need to level up</h2>
          <p className="text-text-muted">A unified command center for your high-performance life.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { 
              icon: BookOpen, 
              title: "Study Tracker", 
              desc: "Log deep work sessions, visualize progress on intensity heatmaps, and hit monthly targets with ease." 
            },
            { 
              icon: Target, 
              title: "Daily Growth", 
              desc: "Engineered morning and evening missions. Habit tracking that actually helps you build identity." 
            },
            { 
              icon: LayoutDashboard, 
              title: "Task Board", 
              desc: "Integrated backlog with weekly drag-and-drop allocation. Prioritize by size and impact." 
            },
            { 
              icon: PenLine, 
              title: "AI Journaling", 
              desc: "Daily entries with pattern analysis. Discover exactly how your mood correlates with your habits." 
            },
          ].map((f, i) => (
            <Card key={i} className="flex flex-col gap-4 p-8 group">
              <div className="w-10 h-10 rounded-radius-md bg-bg-elevated flex items-center justify-center border border-border group-hover:border-primary/40 transition-colors">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">{f.title}</h3>
              <p className="text-text-muted leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* App Preview */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="glass rounded-radius-lg border border-border p-4 shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-2 mb-4 border-b border-border pb-4 px-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-danger/40"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-warning/40"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-success/40"></div>
            </div>
            <div className="text-[10px] text-text-dim uppercase tracking-widest font-bold ml-4">Your Command Center</div>
          </div>
          <div className="grid grid-cols-12 gap-4 h-[400px]">
            <div className="col-span-3 border-r border-border p-2 space-y-4">
              <div className="w-full h-8 bg-border/20 rounded"></div>
              <div className="w-10/12 h-4 bg-border/40 rounded"></div>
              <div className="w-8/12 h-4 bg-border/20 rounded"></div>
              <div className="w-9/12 h-4 bg-border/20 rounded"></div>
              <div className="mt-8 space-y-2">
                <div className="w-full h-4 bg-primary/10 rounded"></div>
                <div className="w-full h-4 bg-border/20 rounded"></div>
              </div>
            </div>
            <div className="col-span-9 p-4 space-y-6">
              <div className="flex gap-4">
                <div className="flex-1 h-32 bg-border/20 rounded-radius-md"></div>
                <div className="flex-1 h-32 bg-border/20 rounded-radius-md"></div>
              </div>
              <div className="w-full h-40 bg-border/10 rounded-radius-md p-4">
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: 120 }).map((_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-[1px] ${Math.random() > 0.8 ? 'bg-primary' : 'bg-border/20'}`}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-32 py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
             <div className="flex items-center gap-2 text-xl font-bold mb-4">
               <span>ᨒ</span>
               <span className="gradient-text">Ascendly</span>
             </div>
             <p className="text-text-muted text-sm max-w-xs mb-6">
               Stop guessing. Start growing. The ultimate companion for builders, students, and high performers.
             </p>
             <p className="text-text-dim text-xs">© 2026 Ascendly. Built for those who choose to grow.</p>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-text-muted">
              <li><a href="#" className="hover:text-text transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-text transition-colors">How it works</a></li>
              <li><a href="#" className="hover:text-text transition-colors">Mobile App</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-text-muted">
              <li><a href="#" className="hover:text-text transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-text transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-text transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Today's Summary" subtitle="24 May 2026" icon={Activity}>
          <div className="space-y-4 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Missions Completed</span>
              <span className="text-sm font-bold text-success">3 / 5</span>
            </div>
            <div className="w-full bg-border/20 h-1.5 rounded-full overflow-hidden">
               <div className="bg-success h-full w-[60%]"></div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-text-muted">Habits Logged</span>
              <span className="text-sm font-bold text-primary">4 Good / 1 Bad</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Day Score</span>
              <span className="text-sm font-bold text-accent">8.5</span>
            </div>
          </div>
        </Card>

        <Card title="Study This Week" subtitle="Goal: 20h" icon={Clock}>
          <div className="flex flex-col items-center justify-center pt-2">
            <div className="relative w-24 h-24 mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-border" />
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset="95.4" className="text-primary" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold">12.5h</span>
                <span className="text-[10px] text-text-muted">REMAINING</span>
              </div>
            </div>
            <p className="text-xs text-text-muted">On track to finish on Sunday</p>
          </div>
        </Card>

        <Card title="Current Level" subtitle="XP: 4,250 / 5,000" icon={Award}>
           <div className="flex flex-col items-center pt-2">
             <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">14</span>
             </div>
             <div className="w-full space-y-2">
               <div className="flex justify-between text-[10px] items-end uppercase font-bold text-text-dim">
                 <span>Level 14</span>
                 <span>750 XP to Lvl 15</span>
               </div>
               <div className="w-full bg-border/20 h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[85%]"></div>
               </div>
             </div>
             <div className="flex items-center gap-2 mt-4 text-sm text-accent">
               <Flame className="w-4 h-4 fill-accent" />
               <span className="font-bold">12 Day Streak</span>
             </div>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card title="Contribution Heatmap" subtitle="Activity across all pillars" className="lg:col-span-8 overflow-x-auto">
          <div className="mt-4 flex flex-col gap-1.5 min-w-[600px]">
             {Array.from({ length: 7 }).map((_, row) => (
               <div key={row} className="flex gap-1.5">
                  {Array.from({ length: 52 }).map((_, col) => {
                    const intensity = Math.random();
                    return (
                      <div 
                        key={col} 
                        className="w-[10px] h-[10px] rounded-[1px] transition-colors hover:scale-125"
                        style={{
                          backgroundColor: intensity > 0.8 ? 'var(--color-primary)' : intensity > 0.6 ? 'rgba(232,98,42,0.6)' : intensity > 0.4 ? 'rgba(232,98,42,0.3)' : intensity > 0.2 ? 'rgba(232,98,42,0.1)' : 'rgba(240,234,224,0.05)'
                        }}
                      ></div>
                    );
                  })}
               </div>
             ))}
             <div className="flex justify-between mt-2 text-[10px] text-text-dim uppercase tracking-tighter">
               <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
             </div>
          </div>
        </Card>

        <Card title="Today's Tasks" subtitle="3 Priority Actions" icon={CheckCircle2} className="lg:col-span-4">
           <div className="space-y-4 mt-2">
             {[
               { t: "Implement Auth Flow", p: "CRITICAL", s: "Large" },
               { t: "Review User Feedback", p: "MEDIUM", s: "Medium" },
               { t: "Database Migration", p: "HIGH", s: "Small" },
               { t: "Fix UI Glitches", p: "LOW", s: "Quick" },
             ].map((task, i) => (
               <div key={i} className="flex flex-col gap-1 p-2 rounded hover:bg-bg-hover transition-colors border border-transparent hover:border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{task.t}</span>
                    <Badge variant={task.p === 'CRITICAL' || task.p === 'HIGH' ? 'danger' : task.p === 'MEDIUM' ? 'warning' : 'info'}>
                      {task.p}
                    </Badge>
                  </div>
                  <div className="text-[10px] text-text-dim uppercase font-bold">{task.s}</div>
               </div>
             ))}
             <Button variant="ghost" size="sm" className="w-full mt-2">View Board</Button>
           </div>
        </Card>
      </div>
    </div>
  );
};

const StudyTracker = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Study Tracker</h2>
          <p className="text-sm text-text-muted">Mastering the art of focus.</p>
        </div>
        <Button icon={Plus}>Log Session</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: "This Month Hours", v: "42.5h", delta: "+12%" },
          { l: "Monthly Goal", v: "60h", delta: "70%" },
          { l: "Weekly Avg", v: "14.2h", delta: "+2h" },
          { l: "Sessions Logged", v: "18", delta: "Good" },
        ].map((s, i) => (
          <Card key={i} className="py-4">
            <p className="text-xs text-text-muted mb-1">{s.l}</p>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold">{s.v}</span>
              <span className={`text-[10px] font-bold ${s.delta.includes('+') ? 'text-success' : 'text-primary'}`}>
                {s.delta}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Card title="Activity Heatmap" subtitle="Visualize your focus intensity">
         <div className="mt-4 flex flex-col gap-1.5 overflow-x-auto pb-4">
             {Array.from({ length: 7 }).map((_, row) => (
               <div key={row} className="flex gap-1.5">
                  <div className="w-8 text-[10px] text-text-dim flex items-center">{row === 1 ? 'Mon' : row === 3 ? 'Wed' : row === 5 ? 'Fri' : ''}</div>
                  {Array.from({ length: 52 }).map((_, col) => {
                    const intensity = Math.random();
                    return (
                      <div 
                        key={col} 
                        className="w-[12px] h-[12px] heatmap-cell"
                        style={{
                          backgroundColor: intensity > 0.8 ? 'var(--color-primary)' : intensity > 0.6 ? 'rgba(232,98,42,0.6)' : intensity > 0.4 ? 'rgba(232,98,42,0.3)' : intensity > 0.2 ? 'rgba(232,98,42,0.1)' : 'rgba(240,234,224,0.05)'
                        }}
                      ></div>
                    );
                  })}
               </div>
             ))}
             <div className="flex ml-8 justify-between mt-2 text-[10px] text-text-dim uppercase">
               <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
             </div>
          </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        <div className="space-y-4">
          <h3 className="font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Recent Sessions
          </h3>
          <div className="glass rounded-radius-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-bg-elevated border-b border-border text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Topic</th>
                  <th className="px-4 py-3 font-semibold text-center">Hours</th>
                  <th className="px-4 py-3 font-semibold text-right">Mood</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { d: "May 24", t: "Advanced React Patterns", h: "4.5", m: 5 },
                  { d: "May 23", t: "Distributed Systems", h: "3.0", m: 4 },
                  { d: "May 22", t: "User Interface Design", h: "2.5", m: 5 },
                  { d: "May 20", t: "System Architecture", h: "3.5", m: 3 },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-bg-hover transition-colors">
                    <td className="px-4 py-3">{row.d}</td>
                    <td className="px-4 py-3 text-text-muted">{row.t}</td>
                    <td className="px-4 py-3 text-center font-mono">{row.h}</td>
                    <td className="px-4 py-3 text-right">
                       <div className="flex items-center justify-end gap-1">
                          {Array.from({ length: 5 }).map((_, dot) => (
                            <div key={dot} className={`w-1.5 h-1.5 rounded-full ${dot < row.m ? 'bg-primary' : 'bg-border'}`}></div>
                          ))}
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Monthly Volume
          </h3>
          <Card className="h-[200px] flex items-end justify-between gap-2 px-8 py-6">
             {[30, 45, 52, 38, 55, 42].map((val, i) => (
               <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                 <div 
                   className="w-full bg-primary/20 hover:bg-primary transition-colors cursor-pointer rounded-t-sm"
                   style={{ height: `${val}%` }}
                 ></div>
                 <span className="text-[10px] text-text-dim uppercase font-bold">M{i+1}</span>
               </div>
             ))}
          </Card>
        </div>
      </div>
    </div>
  );
};

const Growth = () => {
  const [activeDay, setActiveDay] = useState('Work Day');
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Daily Growth</h2>
          <p className="text-sm text-text-muted">Monday, May 24, 2026</p>
        </div>
        <div className="flex bg-bg-elevated p-1 rounded-radius-md border border-border">
          {['Work Day', 'Relax Day', 'Focus Day'].map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-3 py-1.5 text-xs font-medium rounded-radius-sm transition-colors ${activeDay === day ? 'bg-primary text-text' : 'text-text-muted hover:text-text'}`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { t: "Morning", i: Sun, m: ["Journal", "Meditation", "Deep Coding"] },
          { t: "Afternoon", i: Activity, m: ["Client Call", "UI Review", "Gym Session"] },
          { t: "Evening", i: Moon, m: ["Read 10 Pages", "Plan Tomorrow", "Unplug"] },
        ].map((col, idx) => (
          <div key={idx} className="space-y-4">
             <div className="flex items-center gap-2 font-bold px-2">
               <col.i className="w-4 h-4 text-primary" />
               {col.t}
             </div>
             <div className="glass rounded-radius-lg border border-border p-4 space-y-3">
               {col.m.map((mission, mi) => (
                 <div key={mi} className="flex items-center gap-3 p-3 rounded bg-bg-card/50 border border-border/50 group cursor-pointer hover:border-primary/30">
                    <div className="w-5 h-5 rounded border border-border bg-bg flex items-center justify-center group-hover:border-primary transition-colors">
                      {mi < 2 && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                    </div>
                    <span className={`text-sm ${mi < 2 ? 'line-through text-text-dim' : 'text-text'}`}>{mission}</span>
                 </div>
               ))}
               <button className="w-full py-2 flex items-center justify-center gap-2 text-xs text-text-dim hover:text-primary transition-colors border border-dashed border-border rounded mt-4">
                 <Plus className="w-3 h-3" /> Add Mission
               </button>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <h3 className="font-bold">Habit Pulse</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card title="Good Habits" subtitle="Keep the streak alive" className="border-success/10">
               <div className="space-y-3 mt-2">
                 {["Hydrate (3L)", "No Phone at Meal", "Reading"].map(h => (
                   <div key={h} className="flex items-center justify-between p-2 rounded hover:bg-success/5 border border-transparent hover:border-success/20 group">
                     <span className="text-sm font-medium">{h}</span>
                     <div className="flex items-center gap-3">
                        <span className="text-[10px] text-text-muted">45m</span>
                        <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center text-success hover:bg-success text-xs transition-colors">
                           <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                     </div>
                   </div>
                 ))}
               </div>
            </Card>
            <Card title="Bad Habits" subtitle="Break the cycle" className="border-danger/10">
               <div className="space-y-3 mt-2">
                  {["Sugar Consumption", "Lurking Social", "Procrastination"].map(h => (
                    <div key={h} className="flex items-center justify-between p-2 rounded hover:bg-danger/5 border border-transparent hover:border-danger/20">
                      <span className="text-sm font-medium">{h}</span>
                      <button className="w-12 h-6 rounded-full bg-bg-elevated border border-border text-[8px] font-bold uppercase hover:bg-danger/20 hover:text-danger hover:border-danger transition-colors">
                        Logged
                      </button>
                    </div>
                  ))}
               </div>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <h3 className="font-bold">Day Evaluation</h3>
          <Card className="flex flex-col items-center justify-center py-8">
             <span className="text-sm text-text-muted mb-4 uppercase tracking-widest font-bold">Day Rating</span>
             <div className="text-6xl font-bold gradient-text mb-6">8.5</div>
             <div className="flex gap-2 w-full">
               {Array.from({ length: 10 }).map((_, i) => (
                 <div key={i} className={`flex-1 h-2 rounded-full cursor-pointer transition-colors ${i < 8 ? 'bg-primary' : 'bg-border'}`}></div>
               ))}
             </div>
             <p className="text-xs text-text-dim mt-6 text-center italic">"Productive morning, slight energy dip after lunch, but finished strong with dev session."</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Tasks = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Task Flow</h2>
          <p className="text-sm text-text-muted">Aligning backlog with execution.</p>
        </div>
        <div className="flex gap-2">
           <div className="relative">
             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
             <input type="text" placeholder="Search tasks..." className="bg-bg-elevated border border-border rounded-radius-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 w-64" />
           </div>
           <Button icon={Filter} variant="ghost" size="sm">Filter</Button>
           <Button icon={Plus} size="sm">New Task</Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
        {/* Backlog Column */}
        <div className="col-span-12 lg:col-span-4 flex flex-col h-full bg-bg-elevated/30 rounded-radius-lg border border-border overflow-hidden">
           <div className="p-4 border-b border-border flex items-center justify-between bg-bg-elevated/50">
             <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
               <Activity className="w-4 h-4 text-primary" />
               Backlog
               <span className="bg-border/50 px-2 py-0.5 rounded-full text-[10px]">12</span>
             </h3>
             <MoreVertical className="w-4 h-4 text-text-dim hover:text-text cursor-pointer" />
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {[
                { t: "Implement Stipe webhooks", p: "CRITICAL", s: "Large", d: 5 },
                { t: "Optimize mobile navigation", p: "MEDIUM", s: "Quick", d: 2 },
                { t: "Design landing hero v2", p: "HIGH", s: "Medium", d: 8 },
                { t: "Update privacy guidelines", p: "LOW", s: "Quick", d: 1 },
                { t: "Profile page refinements", p: "MEDIUM", s: "Small", d: 3 },
                { t: "Fix heatmap cell overlap", p: "HIGH", s: "Quick", d: 12 },
              ].map((task, i) => (
                <div key={i} className="glass border border-border rounded-radius-md p-4 space-y-3 hover:border-primary/30 transition-all cursor-grab active:cursor-grabbing hover:translate-x-1">
                   <div className="flex items-center justify-between cursor-move">
                     <span className="text-sm font-semibold">{task.t}</span>
                     <Badge variant={task.p === 'CRITICAL' ? 'danger' : task.p === 'HIGH' ? 'danger' : task.p === 'MEDIUM' ? 'warning' : 'info'}>
                       {task.p}
                     </Badge>
                   </div>
                   <div className="flex items-center justify-between text-[10px]">
                     <div className="flex items-center gap-2 text-text-muted">
                        <Zap className="w-3 h-3" /> {task.s}
                     </div>
                     <span className={`${task.d > 7 ? 'text-danger' : task.d > 3 ? 'text-warning' : 'text-text-dim'}`}>
                       Created {task.d} days ago
                     </span>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Weekly Board */}
        <div className="col-span-12 lg:col-span-8 flex flex-col h-full bg-bg-elevated/30 rounded-radius-lg border border-border overflow-hidden">
           <div className="p-4 border-b border-border bg-bg-elevated/50 flex items-center justify-between px-6">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                This Week's Plan
              </h3>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-success"></div> Done</span>
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary/40"></div> Working</span>
              </div>
           </div>
           <div className="flex-1 overflow-x-auto p-4 flex gap-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, di) => (
                <div key={day} className={`flex-1 min-w-[200px] flex flex-col rounded-radius-md border ${di === 1 ? 'border-primary/50 ring-1 ring-primary/20' : 'border-border'} bg-bg/40`}>
                   <div className={`p-3 text-center border-b border-border ${di === 1 ? 'bg-primary/10' : ''}`}>
                      <span className={`text-xs font-bold uppercase tracking-widest ${di === 1 ? 'text-primary' : 'text-text-muted'}`}>{day}</span>
                   </div>
                   <div className="flex-1 p-3 space-y-3">
                      {di === 1 && (
                        <div className="text-[10px] text-primary/60 font-bold uppercase text-center mb-2">Today</div>
                      )}
                      
                      {di === 1 ? (
                        <>
                          <div className="bg-primary/10 border border-primary/20 p-2.5 rounded text-xs">
                            <div className="font-bold mb-1">Database Sync</div>
                            <div className="flex items-center justify-between text-[10px] text-text-dim">
                              <span>Large</span>
                              <CheckCircle2 className="w-3 h-3 text-primary" />
                            </div>
                          </div>
                          <div className="bg-bg-card/80 border border-border p-2.5 rounded text-xs opacity-60">
                            <div className="font-bold mb-1 line-through">Morning Triage</div>
                            <div className="flex items-center justify-between text-[10px] text-success font-bold">
                              <span>Done</span>
                            </div>
                          </div>
                        </>
                      ) : di === 0 ? (
                         <div className="bg-success/10 border border-success/20 p-2.5 rounded text-xs">
                            <div className="font-bold mb-1">Weekly Planning</div>
                            <div className="text-[10px] text-success font-bold uppercase">Completed</div>
                         </div>
                      ) : (
                        <div className="h-full flex items-center justify-center border-2 border-dashed border-border/20 rounded-radius-md p-4">
                           <span className="text-[10px] text-text-dim text-center uppercase tracking-widest font-bold">Drop Task Here</span>
                        </div>
                      )}
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

const Journal = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const triggerAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setShowAnalysis(true);
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
       <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Journal</h2>
          <p className="text-sm text-text-muted">Recording the interior landscape.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="ghost" icon={Calendar} size="sm">History</Button>
           <Button icon={Plus} size="sm">New Entry</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="glass border border-border rounded-radius-lg p-6 space-y-6">
           <div className="flex items-center justify-between border-b border-border pb-4">
              <span className="text-sm text-text-muted">Monday, May 24, 2026</span>
              <div className="flex items-center gap-4">
                <span className="text-xs uppercase font-bold text-text-dim">Day Score:</span>
                <input type="number" defaultValue="8" className="bg-bg-elevated border border-border rounded w-12 text-center py-1 text-sm focus:outline-none focus:border-primary/50" />
              </div>
           </div>
           
           <textarea 
             placeholder="Write from the heart. What happened today? How did you feel? What did you build?"
             className="w-full h-80 bg-transparent text-lg text-text border-none resize-none focus:outline-none leading-relaxed"
           />

           <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="text-xs text-text-dim italic">Last saved 2 minutes ago</div>
              <div className="flex gap-3">
                 <Button variant="ghost" size="sm" onClick={triggerAnalysis} disabled={analyzing}>
                   {analyzing ? 'Thinking...' : 'Analyze with AI'}
                 </Button>
                 <Button size="sm">Save Entry</Button>
              </div>
           </div>
        </div>

        <AnimatePresence>
          {showAnalysis && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="glass border border-primary/20 rounded-radius-lg p-6 border-l-4 border-l-primary"
            >
               <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-primary" />
                  AI Psychological Reflection
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-bold text-primary uppercase text-[10px] tracking-widest">Reflection</h4>
                    <p className="text-text-muted leading-relaxed">Your entry suggests a high level of self-actualization today. You've balanced technical progress with deliberate rest.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-primary uppercase text-[10px] tracking-widest">Patterns</h4>
                    <p className="text-text-muted leading-relaxed">You tend to report higher satisfaction scores on days where "Deep Coding" is checked in the morning.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-primary uppercase text-[10px] tracking-widest">Suggestion</h4>
                    <p className="text-text-muted leading-relaxed">Try shifting your workout 1 hour later tomorrow to see if it curtails the afternoon energy dip you mentioned.</p>
                  </div>
               </div>
               <div className="mt-6 pt-4 border-t border-border flex justify-between items-center text-[10px] text-text-dim uppercase font-bold tracking-tight">
                  <span>Context: 12-day window analysis</span>
                  <span>Powered by Gemini 2.0</span>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Card title="Journal Velocity" subtitle="Intensity of reflection over the last month">
           <div className="flex gap-1 overflow-x-auto mt-4 h-12 items-end">
              {Array.from({ length: 30 }).map((_, i) => {
                const height = 20 + Math.random() * 80;
                return (
                  <div 
                    key={i} 
                    className="flex-1 bg-primary/20 hover:bg-primary transition-colors rounded-t-sm"
                    style={{ height: `${height}%` }}
                  ></div>
                );
              })}
           </div>
        </Card>
      </div>
    </div>
  );
};

const SettingsScreen = () => {
  return (
    <div className="space-y-8">
       <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-sm text-text-muted">Customize your growth machine.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                 <User className="w-5 h-5 text-primary" />
                 Profile & Account
              </h3>
              <Card>
                 <div className="space-y-6">
                    <div className="flex items-center gap-6">
                       <div className="w-20 h-20 rounded-full bg-border flex items-center justify-center text-4xl font-bold text-text-muted relative overflow-hidden group">
                          MO
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white cursor-pointer font-normal">Edit</div>
                       </div>
                       <div className="space-y-1">
                          <h4 className="font-bold">Maia Odetes</h4>
                          <p className="text-xs text-text-muted">Joined since March 2026</p>
                          <Badge variant="success">Pro Member</Badge>
                       </div>
                    </div>
                    
                    <div className="space-y-4 pt-4">
                       <div className="space-y-1.5">
                          <label className="text-xs font-bold text-text-dim uppercase">Display Name</label>
                          <input type="text" defaultValue="Maia Odetes" className="w-full bg-bg-elevated border border-border rounded-radius-md px-4 py-2 text-sm focus:outline-none focus:border-primary/50" />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-xs font-bold text-text-dim uppercase">Email Address</label>
                          <div className="flex gap-2">
                            <input type="email" defaultValue="maia.odetes@gmail.com" className="flex-1 bg-bg-elevated border border-border rounded-radius-md px-4 py-2 text-sm text-text-muted" readOnly />
                            <Button variant="ghost" size="sm">Change</Button>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-xs font-bold text-text-dim uppercase">Timezone</label>
                          <select className="w-full bg-bg-elevated border border-border rounded-radius-md px-4 py-2 text-sm focus:outline-none">
                             <option>UTC+0 (London)</option>
                             <option>UTC-5 (New York)</option>
                             <option>UTC+1 (Paris)</option>
                          </select>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-xs font-bold text-text-dim uppercase">Week Start</label>
                           <select className="w-full bg-bg-elevated border border-border rounded-radius-md px-4 py-2 text-sm focus:outline-none">
                             <option>Monday</option>
                             <option>Sunday</option>
                          </select>
                       </div>
                    </div>

                    <Button className="w-full mt-4">Save Profile Changes</Button>
                 </div>
              </Card>
           </div>

           <div className="space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                 <Zap className="w-5 h-5 text-primary" />
                 App Pillars & Logic
              </h3>
              <Card>
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <h4 className="text-sm font-bold">Growth Pillars</h4>
                       <p className="text-xs text-text-muted leading-relaxed">These appear as your core rituals in the daily growth tracker.</p>
                    </div>

                    <div className="space-y-2">
                       {[
                         "Read 10 pages",
                         "Morning Meditation",
                         "No social media after 10pm",
                         "Daily Workout"
                       ].map((pillar, i) => (
                         <div key={i} className="flex items-center justify-between p-3 bg-bg-elevated/50 border border-border/50 rounded-radius-md group">
                            <span className="text-sm">{pillar}</span>
                            <button className="text-xs text-text-dim hover:text-danger hover:scale-110 transition-all opacity-0 group-hover:opacity-100">Delete</button>
                         </div>
                       ))}
                    </div>

                    <div className="flex gap-2">
                       <input type="text" placeholder="Add new pillar..." className="flex-1 bg-bg-elevated border border-border rounded-radius-md px-4 py-2 text-sm focus:outline-none" />
                       <Button size="sm" icon={Plus}>Add</Button>
                    </div>

                    <div className="pt-6 border-t border-border">
                       <h4 className="text-sm font-bold mb-4">Integrations</h4>
                       <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 rounded bg-bg-elevated flex items-center gap-3">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-white flex items-center justify-center"><img src="https://www.google.com/favicon.ico" className="w-4 h-4" /></div>
                                <div>
                                  <div className="text-xs font-bold uppercase tracking-tight">Google Calendar</div>
                                  <div className="text-[10px] text-success">Connected</div>
                                </div>
                             </div>
                             <button className="text-[10px] font-bold uppercase py-1 px-3 border border-border rounded hover:bg-danger/10 hover:text-danger hover:border-danger transition-colors">Disconnect</button>
                          </div>
                       </div>
                    </div>
                 </div>
              </Card>
           </div>
        </div>
    </div>
  );
};

// --- Main App Shell ---

const AppShell = () => {
  const [currentScreen, setCurrentScreen] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Study', icon: BookOpen },
    { name: 'Growth', icon: Target },
    { name: 'Tasks', icon: CheckCircle2 },
    { name: 'Journal', icon: PenLine },
    { name: 'Settings', icon: Settings },
  ];

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Dashboard': return <Dashboard />;
      case 'Study': return <StudyTracker />;
      case 'Growth': return <Growth />;
      case 'Tasks': return <Tasks />;
      case 'Journal': return <Journal />;
      case 'Settings': return <SettingsScreen />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar */}
      <aside className={`fixed lg:relative z-40 h-full border-r border-border transition-all duration-300 bg-bg-elevated/50 ${sidebarOpen ? 'w-[220px]' : 'w-0 -translate-x-full lg:w-0'}`}>
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center gap-2 text-lg font-bold mb-10 px-2 mt-2">
            <span className="text-xl">ᨒ</span>
            <span className="gradient-text">Ascendly</span>
          </div>
          
          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setCurrentScreen(item.name)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-radius-md text-sm font-medium transition-all group ${currentScreen === item.name ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-text-muted hover:bg-bg-hover hover:text-text'}`}
              >
                <item.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                {item.name}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-border">
            <div className="flex items-center gap-3 px-2 py-3 hover:bg-bg-hover rounded-radius-md cursor-pointer transition-colors group">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary group-hover:bg-primary group-hover:text-text transition-colors">MO</div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold truncate">Maia Odetes</p>
                <p className="text-[10px] text-text-dim uppercase tracking-tighter">Pro Tier</p>
              </div>
            </div>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-xs text-text-dim hover:text-danger mt-2 transition-colors">
              <LogOut className="w-3 h-3" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center justify-between px-6 sticky top-0 bg-bg/80 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-text-muted hover:text-text"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <LayoutDashboard className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-bold uppercase tracking-widest">{currentScreen}</h1>
          </div>
          <div className="flex items-center gap-4">
             <button className="p-2 text-text-muted hover:text-text relative transition-colors">
               <Bell className="w-4 h-4" />
               <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-bg"></span>
             </button>
             <button className="p-2 text-text-muted hover:text-text transition-colors">
               <Search className="w-4 h-4" />
             </button>
          </div>
        </header>

        <motion.div 
          key={currentScreen}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6 overflow-y-auto"
        >
          {renderScreen()}
        </motion.div>
      </main>
    </div>
  );
};

export default function App() {
  const [inApp, setInApp] = useState(false);

  return (
    <div className="antialiased">
      {inApp ? (
        <AppShell />
      ) : (
        <LandingPage onJoin={() => setInApp(true)} />
      )}
    </div>
  );
}
