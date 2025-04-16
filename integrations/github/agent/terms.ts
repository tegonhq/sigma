export const TERMS = `
# Hevy Terminology

## Core Concepts

- **Workout**: A single training session that contains exercises, sets, and other metadata like start time, end time, title, and description.
- **Routine**: A template for workouts that can be reused. Contains a predefined set of exercises and parameters.
- **Exercise**: A specific movement or activity performed during a workout with attributes like title, notes, and exercise_template_id.
- **Set**: A group of repetitions of an exercise performed consecutively, including details like weight, reps, duration, etc.

## Workout Structure

- **id**: Unique identifier for the workout (UUID format)
- **title**: Name of the workout (e.g., "Lower + bicep", "Push Day", "Cardio")
- **description**: Optional notes about the entire workout
- **start_time**: When the workout began (ISO 8601 format with timezone)
- **end_time**: When the workout ended (ISO 8601 format with timezone)
- **created_at**: Timestamp when the workout was created
- **updated_at**: Timestamp when the workout was last updated
- **exercises**: Array of exercises performed during the workout

## Exercise Components

- **index**: Zero-based position of the exercise in the workout sequence
- **title**: Name of the exercise (e.g., "Squat (Bodyweight)", "Bicep Curl (Cable)")
- **notes**: Optional notes specific to this exercise
- **exercise_template_id**: Unique identifier for the exercise template
- **superset_id**: Optional identifier to group exercises in a superset (null if not in a superset)
- **sets**: Array of sets performed for this exercise

## Set Attributes

- **index**: Zero-based position of the set in the exercise sequence
- **type**: Type of set (e.g., "normal", "warmup", "drop", "failure")
- **weight_kg**: Weight used for the set in kilograms (null for bodyweight exercises)
- **reps**: Number of repetitions performed (null for timed exercises)
- **distance_meters**: Distance covered in meters (null for non-distance exercises)
- **duration_seconds**: Duration of the set in seconds (null for non-timed exercises)
- **rpe**: Rate of Perceived Exertion on a scale (null if not specified)
- **custom_metric**: Any additional custom metrics (null if not used)

## Exercise Types

- **Strength**: Exercises focused on building muscle strength and size using weights
- **Cardio**: Exercises focused on cardiovascular endurance
- **Stretching**: Exercises focused on flexibility and mobility
- **Bodyweight**: Exercises performed using body weight as resistance
- **Machine**: Exercises performed using fitness machines
- **Free Weight**: Exercises performed using dumbbells, barbells, or kettlebells
- **Cable**: Exercises performed using cable machines

## Muscle Groups

- **Chest**: Pectoralis major and minor
- **Back**: Latissimus dorsi, rhomboids, trapezius, and erector spinae
- **Shoulders**: Deltoids (anterior, lateral, posterior)
- **Biceps**: Biceps brachii and brachialis
- **Triceps**: Triceps brachii
- **Legs**: Quadriceps, hamstrings, glutes, and calves
- **Core**: Abdominals, obliques, and lower back
- **Full Body**: Exercises that engage multiple major muscle groups simultaneously

## Progress Tracking

- **Volume**: The total amount of weight lifted (sets × reps × weight)
- **PR (Personal Record)**: A personal best performance for an exercise
- **Progressive Overload**: Gradually increasing the weight, frequency, or number of repetitions

## API Response Structure

- Workout responses include full exercise and set details
- Pagination is supported for list endpoints with page and pageSize parameters
- All weights are returned in kilograms (weight_kg)
- All durations are in seconds (duration_seconds)
- All distances are in meters (distance_meters)

## CRITICAL CONTEXT RULES

- **Routine Titles**: Create descriptive titles based on workout focus (e.g., "Upper Body Strength", "Full Body HIIT", "Push/Pull Split") rather than days or dates
- **Exercise Selection**: Choose exercises that target the intended muscle groups and match the user's equipment availability
`;
