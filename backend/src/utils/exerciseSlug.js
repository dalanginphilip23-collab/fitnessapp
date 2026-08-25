// Backend alias map — mirrors frontend/src/constants/exerciseRegistry.js
// Keep both in sync when adding exercises.

const TRACKED_SLUGS = new Set([
  'pushup','squat','plank','lunge','overhead','dip','burpee','jumpingjack',
  'mountainclimb','highknee','glute_bridge','crunch','situp','bicep_curl',
  'tricep_ext','lateral_raise','deadlift','hip_thrust','sideplank','boxjump','pullup','calfraise'
]);

const ALIAS_RAW = {
  'barbell back squat':'squat','back squat':'squat','bodyweight squats':'squat','goblet squats':'squat','jump squats':'squat','front squat':'squat','bulgarian split squat':'squat','squats':'squat','squat':'squat','leg press':'squat',
  'flat barbell bench press':'pushup','barbell bench press':'pushup','push ups':'pushup','push up':'pushup','push-ups':'pushup','push up to renegade row':'pushup','incline dumbbell press':'pushup','bench press':'pushup','pushup':'pushup','weighted pushup':'pushup',
  'bent over barbell row':'pullup','barbell bent over row':'pullup','single arm dumbbell row':'pullup','assisted pull up or inverted row':'pullup','weighted pull ups':'pullup','pull ups':'pullup','pull-up':'pullup','seated cable row':'pullup','resistance band rows':'pullup',
  'plank hold':'plank','weighted plank':'plank','plank shoulder taps':'plank','plank':'plank','side plank':'sideplank',
  'standing overhead press':'overhead','standing barbell overhead press':'overhead','conventional deadlift':'deadlift','romanian deadlift':'deadlift','deadlift':'deadlift','overhead':'overhead','oh press':'overhead',
  'weighted dips':'dip','dips':'dip','dip':'dip','triceps rope pushdown':'tricep_ext','lateral raise':'lateral_raise','cable lateral raise':'lateral_raise',
  'barbell bicep curl':'bicep_curl','bicep curls':'bicep_curl','bicep curl':'bicep_curl',
  'walking lunges':'lunge','lunges':'lunge','lunge':'lunge','deep lunge hip opener':'lunge','hip thrust':'hip_thrust','kettlebell swings':'hip_thrust','glute bridges':'glute_bridge','glute bridge':'glute_bridge','box jumps':'boxjump',
  'burpees':'burpee','burpee':'burpee','jumping jacks':'jumpingjack','mountain climbers':'mountainclimb','high knees':'highknee','crunches':'crunch','sit ups':'situp','hanging knee raise':'crunch','hanging leg raise':'crunch','dead bug':'crunch','sprint intervals':'highknee','hill sprints or resisted intervals':'highknee','calf raises':'calfraise','standing calf raise':'calfraise',
};

function normalize(s=''){return String(s).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');}

const ALIAS = new Map(Object.entries(ALIAS_RAW).map(([k,v])=>[normalize(k),v]));

function getExerciseSlug(name){
  if(!name) return null;
  const hit = ALIAS.get(normalize(name));
  if(hit !== undefined) return hit;
  const n = normalize(name);
  if(TRACKED_SLUGS.has(n)) return n;
  // try label fallback
  return null;
}

module.exports = { getExerciseSlug, TRACKED_SLUGS };
