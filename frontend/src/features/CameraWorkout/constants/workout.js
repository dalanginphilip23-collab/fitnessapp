// REPLACES: frontend/src/features/CameraWorkout/constants/workout.js
// Added `muscle` and `equipment` fields to each entry so the picker list
// can show "Core · Bodyweight" style subtitles and pick the right body
// silhouette zone. Existing fields (id, label, icon, cue) are unchanged —
// nothing else in your app that reads WORKOUT_OPTIONS breaks.

export const WORKOUT_OPTIONS = [
  { id: 'pushup',        label: 'Push-Ups',          icon: 'fitness_center',              muscle: 'Chest',     equipment: 'Bodyweight', zone: 'chest',     cue: 'Get into push-up position on the floor.'              },
  { id: 'squat',         label: 'Squats',             icon: 'accessibility_new',           muscle: 'Quads',     equipment: 'Bodyweight', zone: 'legs',      cue: 'Stand with feet shoulder-width apart.'                },
  { id: 'plank',         label: 'Plank',              icon: 'horizontal_rule',             muscle: 'Core',      equipment: 'Bodyweight', zone: 'core',      cue: 'Get into a plank position facing the camera.'         },
  { id: 'lunge',         label: 'Lunges',             icon: 'directions_walk',             muscle: 'Quads',     equipment: 'Bodyweight', zone: 'legs',      cue: 'Stand upright. Step forward alternating legs.'        },
  { id: 'overhead',      label: 'OH Press',           icon: 'upload',                      muscle: 'Shoulders', equipment: 'Barbell',    zone: 'shoulders', cue: 'Stand tall, arms at shoulder height.'                 },
  { id: 'dip',           label: 'Dips',               icon: 'unfold_more',                 muscle: 'Triceps',   equipment: 'Machine',    zone: 'arms',      cue: 'Position behind a chair or bench for dips.'          },
  { id: 'burpee',        label: 'Burpees',            icon: 'bolt',                        muscle: 'Full Body', equipment: 'Bodyweight', zone: 'full',      cue: 'Stand in the centre of the frame.'                    },
  { id: 'jumpingjack',   label: 'Jumping Jacks',      icon: 'sports_gymnastics',           muscle: 'Full Body', equipment: 'Bodyweight', zone: 'full',      cue: 'Stand upright with feet together.'                    },
  { id: 'mountainclimb', label: 'Mountain Climbers',  icon: 'terrain',                     muscle: 'Core',      equipment: 'Bodyweight', zone: 'core',      cue: 'Get into a high plank facing the camera.'             },
  { id: 'highknee',      label: 'High Knees',         icon: 'directions_run',              muscle: 'Cardio',    equipment: 'Bodyweight', zone: 'legs',      cue: 'Stand tall and run on the spot, lifting knees high.'  },
  { id: 'glute_bridge',  label: 'Glute Bridge',       icon: 'airline_seat_flat',           muscle: 'Glutes',    equipment: 'Bodyweight', zone: 'legs',      cue: 'Lie on your back with knees bent.'                    },
  { id: 'crunch',        label: 'Crunches',           icon: 'airline_seat_recline_normal', muscle: 'Core',      equipment: 'Bodyweight', zone: 'core',      cue: 'Lie on your back, knees bent, feet flat.'            },
  { id: 'situp',         label: 'Sit-Ups',            icon: 'self_improvement',            muscle: 'Core',      equipment: 'Bodyweight', zone: 'core',      cue: 'Lie on your back, knees bent, feet flat.'            },
  { id: 'bicep_curl',    label: 'Bicep Curls',        icon: 'sports_mma',                  muscle: 'Biceps',    equipment: 'Dumbbell',   zone: 'arms',      cue: 'Stand upright, arms at sides holding weights.'        },
  { id: 'tricep_ext',    label: 'Tricep Ext.',        icon: 'back_hand',                   muscle: 'Triceps',   equipment: 'Dumbbell',   zone: 'arms',      cue: 'Stand or sit, arm extended overhead.'                 },
  { id: 'lateral_raise', label: 'Lateral Raise',      icon: 'open_with',                   muscle: 'Shoulders', equipment: 'Dumbbell',   zone: 'shoulders', cue: 'Stand with arms at sides.'                            },
  { id: 'deadlift',      label: 'Deadlift',           icon: 'arrow_downward',              muscle: 'Back',      equipment: 'Barbell',    zone: 'back',      cue: 'Stand with feet hip-width apart, weight in front.'    },
  { id: 'hip_thrust',    label: 'Hip Thrust',         icon: 'chair',                       muscle: 'Glutes',    equipment: 'Barbell',    zone: 'legs',      cue: 'Back against bench, feet flat on floor.'             },
  { id: 'sideplank',     label: 'Side Plank',         icon: 'rotate_90_degrees_cw',        muscle: 'Core',      equipment: 'Bodyweight', zone: 'core',      cue: 'Lie on your side and prop up on one forearm.'        },
  { id: 'boxjump',       label: 'Box Jumps',          icon: 'upload_file',                 muscle: 'Quads',     equipment: 'Plyometric', zone: 'legs',      cue: 'Stand in front of the box, camera to your side.'     },
  { id: 'pullup',        label: 'Pull-Ups',           icon: 'keyboard_arrow_up',           muscle: 'Back',      equipment: 'Bodyweight', zone: 'back',      cue: 'Hang from the bar, camera facing you.'                },
  { id: 'calfraise',     label: 'Calf Raises',        icon: 'footprint',                   muscle: 'Calves',    equipment: 'Bodyweight', zone: 'legs',      cue: 'Stand upright near a wall for balance.'               },
];