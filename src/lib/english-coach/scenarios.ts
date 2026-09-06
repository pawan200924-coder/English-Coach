import { PracticeScenario } from '@/types/english-coach';

export const PRACTICE_SCENARIOS: PracticeScenario[] = [
  // BASIC SCENARIOS
  {
    id: 'intro-friends',
    title: 'Introducing Yourself & Making Friends',
    level: 'basic',
    category: 'daily',
    description: 'Practice sharing your name, hometown, hobbies, and asking friendly questions to someone new.',
    icon: '👋',
    starterPrompt: "Hi there! I don't think we've met yet. I'm Alex. What is your name and where are you from?",
    targetKeywords: ['name', 'from', 'hobby', 'work', 'nice to meet you'],
    tutorRole: 'A friendly person sitting next to you at a community event',
    userRole: 'Yourself introducing who you are'
  },
  {
    id: 'cafe-order',
    title: 'Ordering at a Specialty Café',
    level: 'basic',
    category: 'daily',
    description: 'Order your favorite drink, specify size, milk choices, and ask for the bill politely.',
    icon: '☕',
    starterPrompt: "Welcome to Artisan Coffee! What can I get started for you today?",
    targetKeywords: ['cappuccino', 'latte', 'oat milk', 'medium', 'how much', 'takeaway'],
    tutorRole: 'A friendly café barista',
    userRole: 'A customer ordering coffee'
  },
  {
    id: 'hotel-checkin',
    title: 'Hotel Front Desk Check-in',
    level: 'basic',
    category: 'travel',
    description: 'Check in to your hotel room, ask about breakfast timings and the Wi-Fi password.',
    icon: '🏨',
    starterPrompt: "Good afternoon, welcome to Grand Vista Hotel. Do you have a reservation with us?",
    targetKeywords: ['reservation', 'name', 'key card', 'breakfast', 'wi-fi password'],
    tutorRole: 'Hotel front desk receptionist',
    userRole: 'A traveler checking in'
  },

  // INTERMEDIATE SCENARIOS
  {
    id: 'job-interview-general',
    title: 'Job Interview: Background & Strengths',
    level: 'intermediate',
    category: 'interview',
    description: 'Articulate your professional journey, key achievements, and explain why you are a great fit.',
    icon: '💼',
    starterPrompt: "Thank you for joining us today. To start off, could you walk me through your background and what motivated you to apply for this role?",
    targetKeywords: ['experience', 'responsible for', 'achieved', 'collaborate', 'strength', 'passion'],
    tutorRole: 'Hiring Manager at a leading company',
    userRole: 'Job applicant interviewing for a role'
  },
  {
    id: 'project-update',
    title: 'Sprint / Project Status Update',
    level: 'intermediate',
    category: 'workplace',
    description: 'Deliver a concise update on what you completed, current blockers, and next steps.',
    icon: '📊',
    starterPrompt: "Let's do a quick round of updates. How are things progressing on your deliverables this week?",
    targetKeywords: ['progress', 'milestone', 'blocker', 'completed', 'timeline', 'next sprint'],
    tutorRole: 'Project Team Lead in a daily sync',
    userRole: 'Team member sharing progress'
  },
  {
    id: 'travel-delay',
    title: 'Resolving a Missed Connecting Flight',
    level: 'intermediate',
    category: 'travel',
    description: 'Politely explain your delayed incoming flight and arrange rebooking and hotel accommodation.',
    icon: '✈️',
    starterPrompt: "Customer service desk, how may I assist you today?",
    targetKeywords: ['delayed', 'missed connection', 'rebook', 'next flight', 'luggage', 'voucher'],
    tutorRole: 'Airline customer support agent',
    userRole: 'Passenger stranded due to flight delay'
  },

  // PRO SCENARIOS
  {
    id: 'executive-pitch',
    title: 'Executive Pitch to Senior Leadership',
    level: 'pro',
    category: 'workplace',
    description: 'Deliver a persuasive pitch for a high-impact initiative, address ROI questions, and handle pushback.',
    icon: '🚀',
    starterPrompt: "We've reviewed your brief proposal, but leadership has serious reservations regarding budget allocation and timeline. Why should we prioritize this right now?",
    targetKeywords: ['strategic alignment', 'ROI', 'mitigate risk', 'competitive edge', 'scalability', 'key metrics'],
    tutorRole: 'Chief Executive / Board Member assessing proposals',
    userRole: 'Department lead pitching a major project'
  },
  {
    id: 'salary-negotiation',
    title: 'High-Stakes Salary & Package Negotiation',
    level: 'pro',
    category: 'interview',
    description: 'Negotiate higher compensation, equity, and perks with tactical assertiveness, poise, and benchmark data.',
    icon: '📈',
    starterPrompt: "We are excited to offer you the position at $110,000. We feel this is a very competitive offer for this level. What are your thoughts?",
    targetKeywords: ['market value', 'benchmark', 'track record', 'total package', 'compensation', 'counter-offer'],
    tutorRole: 'Corporate Head of Talent Acquisition',
    userRole: 'Candidate negotiating compensation terms'
  },
  {
    id: 'crisis-management',
    title: 'Client Crisis & Conflict Resolution',
    level: 'pro',
    category: 'workplace',
    description: 'De-escalate an upset enterprise client regarding a critical bug or missed delivery with poise and accountability.',
    icon: '🛡️',
    starterPrompt: "Your team missed yesterday's deployment deadline and our production dashboard went dark for two hours! This is unacceptable. How did this happen, and what are you doing to fix it?",
    targetKeywords: ['take full ownership', 'root cause', 'corrective measures', 'redundancy', 'safeguards', 'rebuilding trust'],
    tutorRole: 'Furious VP of Client Operations',
    userRole: 'Senior Solutions Lead taking ownership'
  },
  {
    id: 'impromptu-debate',
    title: 'Impromptu Debate: AI vs Human Creativity',
    level: 'pro',
    category: 'debate',
    description: 'Defend your position with structured arguments, evidence, counter-arguments, and persuasive rhetoric.',
    icon: '🎙️',
    starterPrompt: "I argue that generative AI will completely render human graphic designers and creative directors obsolete within five years. Disprove me.",
    targetKeywords: ['nuance', 'empathy', 'cultural context', 'creative intuition', 'catalyst', 'irreplaceable'],
    tutorRole: 'Sharp debate moderator and challenger',
    userRole: 'Debater arguing against the motion'
  }
];
