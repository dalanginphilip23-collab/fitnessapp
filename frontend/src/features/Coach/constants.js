import { IconStethoscope, IconHeartPulse, IconScalpel } from './components/icons';

// ─────────────────────────────────────────────
//  MOCK DATA (unchanged)
// ─────────────────────────────────────────────
export const DOCTORS_DATA = {
  beginner: [
    { id: 1,  name: "Dr. Sarah Mitchell", prof: "General Practitioner", personality: "Empathetic",  avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200", age: 42, gender: "Female", experience: "15 Years", bio: "Dedicated to holistic patient care and preventative medicine." },
    { id: 2,  name: "Dr. James Wilson",   prof: "Family Physician",     personality: "Patient",     avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200", age: 55, gender: "Male",   experience: "25 Years", bio: "Specializes in comprehensive healthcare for individuals and families." },
    { id: 3,  name: "Dr. Elena Rodriguez",prof: "Pediatrician",         personality: "Kind",        avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200", age: 38, gender: "Female", experience: "10 Years", bio: "Passionate about child development and adolescent health." },
    { id: 4,  name: "Dr. David Chen",     prof: "Nutritionist",         personality: "Practical",   avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200", age: 45, gender: "Male",   experience: "18 Years", bio: "Expert in dietary planning and metabolic health optimization." },
    { id: 5,  name: "Dr. Lisa Park",      prof: "Wellness Consultant",  personality: "Gentle",      avatar: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=200&h=200", age: 34, gender: "Female", experience: "8 Years",  bio: "Focuses on stress management and lifestyle-based healing." },
  ],
  intermediate: [
    { id: 6,  name: "Dr. Marcus Thorne",  prof: "Cardiologist",         personality: "Analytical",  avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200", age: 50, gender: "Male",   experience: "20 Years", bio: "Renowned for diagnosing complex cardiovascular conditions." },
    { id: 7,  name: "Dr. Angela Voss",    prof: "Dermatologist",        personality: "Thorough",    avatar: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=200&h=200", age: 41, gender: "Female", experience: "14 Years", bio: "Advanced expertise in clinical dermatology and skin pathology." },
    { id: 8,  name: "Dr. Robert Hales",   prof: "Orthopedic",           personality: "Direct",      avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200", age: 48, gender: "Male",   experience: "19 Years", bio: "Specializes in joint reconstruction and sports injuries." },
    { id: 9,  name: "Dr. Simon Lee",      prof: "Endocrinologist",      personality: "Meticulous",  avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200", age: 53, gender: "Male",   experience: "22 Years", bio: "Leading researcher in hormonal imbalances and diabetes care." },
    { id: 10, name: "Dr. Fiona Gray",     prof: "Physical Therapist",   personality: "Encouraging", avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200", age: 36, gender: "Female", experience: "11 Years", bio: "Dedicated to post-operative recovery and mobility enhancement." },
  ],
  advanced: [
    { id: 11, name: "Dr. Victor Von",     prof: "Neurosurgeon",         personality: "Intense",     avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200", age: 58, gender: "Male",   experience: "30 Years", bio: "Pioneer in minimally invasive brain and spinal cord surgeries." },
    { id: 12, name: "Dr. Claire Redfield",prof: "Virologist",           personality: "Alert",       avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200", age: 39, gender: "Female", experience: "12 Years", bio: "At the forefront of infectious disease control and immunology." },
    { id: 13, name: "Dr. Gregory House",  prof: "Diagnostic Expert",    personality: "Academic",    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200", age: 52, gender: "Male",   experience: "24 Years", bio: "Specializes in solving rare and undiagnosed medical mysteries." },
    { id: 14, name: "Dr. Linda Hamilton", prof: "Trauma Surgeon",       personality: "Steady",      avatar: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=200&h=200", age: 46, gender: "Female", experience: "17 Years", bio: "Veteran of critical care and emergency surgical procedures." },
    { id: 15, name: "Dr. Arthur Dayne",   prof: "Sports Medicine",      personality: "Direct",      avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200", age: 44, gender: "Male",   experience: "16 Years", bio: "Consultant for professional athletes in peak performance recovery." },
  ],
};

// ─────────────────────────────────────────────
//  CATEGORY THEMES
//  Structural colors (bg/border/text) come from the app's own
//  --bg-* / --text-* / --border-* tokens so they automatically
//  flip with the app's light/dark toggle. Only the category
//  accent (green/purple/blue) is a fixed hue, applied as a
//  semi-transparent overlay so it reads correctly on top of
//  whichever theme is active underneath.
// ─────────────────────────────────────────────
export const THEMES = {
  beginner: {
    text: 'text-emerald-500',
    bgSoft: 'bg-emerald-500/10', bgSoftHover: 'group-hover:bg-emerald-500/20',
    solid: 'bg-emerald-600', solidHover: 'hover:bg-emerald-700',
    ring: 'ring-emerald-500/40', dot: 'bg-emerald-500',
    chipBg: 'bg-emerald-500/10', chipText: 'text-emerald-500', chipBorder: 'border-emerald-500/20',
    pulseBorder: 'border-emerald-500/40',
  },
  intermediate: {
    text: 'text-violet-500',
    bgSoft: 'bg-violet-500/10', bgSoftHover: 'group-hover:bg-violet-500/20',
    solid: 'bg-violet-600', solidHover: 'hover:bg-violet-700',
    ring: 'ring-violet-500/40', dot: 'bg-violet-500',
    chipBg: 'bg-violet-500/10', chipText: 'text-violet-500', chipBorder: 'border-violet-500/20',
    pulseBorder: 'border-violet-500/40',
  },
  advanced: {
    text: 'text-sky-500',
    bgSoft: 'bg-sky-500/10', bgSoftHover: 'group-hover:bg-sky-500/20',
    solid: 'bg-sky-600', solidHover: 'hover:bg-sky-700',
    ring: 'ring-sky-500/40', dot: 'bg-sky-500',
    chipBg: 'bg-sky-500/10', chipText: 'text-sky-500', chipBorder: 'border-sky-500/20',
    pulseBorder: 'border-sky-500/40',
  },
};

// ─────────────────────────────────────────────
//  Category copy + theme lookup
// ─────────────────────────────────────────────
export const CATEGORY_META = {
  beginner: {
    title: "Primary Care",
    subtitle: "General Practice & Wellness",
    description: "Comprehensive first-contact care focusing on everyday health, wellness checkups, and preventative medicine.",
    Icon: IconStethoscope,
    theme: THEMES.beginner,
  },
  intermediate: {
    title: "Specialists",
    subtitle: "Cardio, Derma & Ortho",
    description: "Expert care for specific body systems, offering advanced diagnosis and targeted treatment plans.",
    Icon: IconHeartPulse,
    theme: THEMES.intermediate,
  },
  advanced: {
    title: "Surgery & Tech",
    subtitle: "Advanced Diagnostics",
    description: "High-level surgical consultations and cutting-edge medical technology for complex medical cases.",
    Icon: IconScalpel,
    theme: THEMES.advanced,
  },
};