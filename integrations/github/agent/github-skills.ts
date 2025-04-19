/* eslint-disable @typescript-eslint/no-explicit-any */
import { APIBaseSkills } from '@tegonhq/agent-sdk';
import axios from 'axios';

export class GithubSkills extends APIBaseSkills {
  skills(): Record<string, any> {
    return {
      get_workout: {
        description:
          'Retrieve a specific completed workout session by its ID. Use this only for fetching existing workout records, not for planning.',
        params: {
          workout_id: {
            description: 'Unique identifier of the workout to retrieve',
            required: true,
            type: 'string',
          },
        },
      },
      list_workouts: {
        description:
          'Retrieve a list of previously completed or planned workout sessions. Use this for viewing workout history, not for creating training plans.',
        params: {
          page: {
            description: 'Page number for pagination (starting from 1)',
            required: false,
            type: 'integer',
          },
          pageSize: {
            description: 'Number of workouts per page (default 5, max 10)',
            required: false,
            type: 'integer',
          },
        },
        function: 'self.list_workouts',
      },
      list_routines: {
        description:
          'Retrieve a list of workout routines (workout templates/plans). Use this to view existing training programs.',
        params: {
          page: {
            description: 'Page number for pagination (starting from 1)',
            required: false,
            type: 'integer',
          },
          pageSize: {
            description: 'Number of routines per page (default 5, max 10)',
            required: false,
            type: 'integer',
          },
        },
        function: 'self.list_routines',
      },
      create_routine: {
        description:
          'Create a new workout routine template or plan. THIS IS THE CORRECT TOOL TO USE when a user asks for a workout plan, program, or routine. Creates a reusable workout template not tied to specific dates.',
        params: {
          title: {
            description:
              'Title of the routine/plan (e.g., "Full Body 3x Week", "Push/Pull/Legs Split")',
            required: true,
            type: 'string',
          },
          notes: {
            description:
              'Detailed description of the routine including goals, frequency, and other relevant information',
            required: false,
            type: 'string',
          },
          exercises: {
            description:
              'List of exercises to include in the routine with recommended sets, reps and weights',
            required: false,
            type: 'array',
            items: {
              type: 'object',
              properties: {
                exercise_template_id: {
                  description: 'ID of the exercise template',
                  type: 'string',
                  required: true,
                },
                superset_id: {
                  description:
                    'ID for grouping exercises into supersets (null if not part of a superset)',
                  type: ['string', 'null'],
                  required: false,
                },
                rest_seconds: {
                  description: 'Rest time in seconds between sets',
                  type: 'integer',
                  required: false,
                },
                notes: {
                  description: 'Additional notes for the exercise',
                  type: 'string',
                  required: false,
                },
                sets: {
                  description: 'Array of sets for this exercise',
                  type: 'array',
                  required: true,
                  items: {
                    type: 'object',
                    properties: {
                      type: {
                        description: 'Type of set (e.g., normal, warmup, dropset)',
                        type: 'string',
                        required: true,
                      },
                      weight_kg: {
                        description: 'Weight in kilograms',
                        type: ['number', 'null'],
                        required: false,
                      },
                      reps: {
                        description: 'Number of repetitions',
                        type: ['integer', 'null'],
                        required: false,
                      },
                      distance_meters: {
                        description: 'Distance in meters for cardio exercises',
                        type: ['number', 'null'],
                        required: false,
                      },
                      duration_seconds: {
                        description: 'Duration in seconds',
                        type: ['integer', 'null'],
                        required: false,
                      },
                      custom_metric: {
                        description: 'Custom metric value',
                        type: ['string', 'null'],
                        required: false,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        function: 'self.create_routine',
      },
      update_routine: {
        description:
          'Update an existing workout routine template. Use this to modify an existing training plan.',
        params: {
          routine_id: {
            description: 'Unique identifier of the routine to update',
            required: true,
            type: 'string',
          },
          title: {
            description: 'New title for the routine',
            required: false,
            type: 'string',
          },
          description: {
            description: 'Updated detailed description of the routine',
            required: false,
            type: 'string',
          },
          exercises: {
            description: 'Updated list of exercises with recommended sets, reps and weights',
            required: false,
            type: 'array',
          },
        },
        function: 'self.update_routine',
      },
      delete_routine: {
        description: 'Delete an existing workout routine template',
        params: {
          routine_id: {
            description: 'Unique identifier of the routine to delete',
            required: true,
            type: 'string',
          },
        },
        function: 'self.delete_routine',
      },
      list_exercise_templates: {
        description:
          'Retrieve a list of exercise templates from the Hevy database. Use this to find available exercises when creating workout routines.',
        params: {
          page: {
            description: 'Page number for pagination (starting from 1)',
            required: false,
            type: 'integer',
          },
          pageSize: {
            description: 'Number of templates per page (default 20, max 100)',
            required: false,
            type: 'integer',
          },
        },
        function: 'self.list_exercise_templates',
      },
      get_exercise_template: {
        description:
          'Retrieve detailed information about a specific exercise template by its ID. Use this to get information about an exercise when creating workout routines.',
        params: {
          exercise_template_id: {
            description: 'Unique identifier of the exercise template',
            required: true,
            type: 'string',
          },
        },
        function: 'self.get_exercise_template',
      },
    };
  }

  getHeaders(
    integrationConfiguration: Record<string, string | number | boolean>,
  ): Record<string, string> {
    return {
      'api-key': integrationConfiguration.apiKey as string,
    };
  }

  async getWorkout(workoutId: string): Promise<string> {
    const response = await axios.get(`${this.baseURL}/v1/workouts/${workoutId}`, {
      headers: this.headers,
    });
    const workout = response.data;
    return `I've fetched the workout with id '${workout.id}', title '${workout.title}', status '${workout.status}', with ${workout.exercises.length} exercises`;
  }

  getBaseURL(): string {
    return 'https://api.hevyapp.com';
  }

  async listWorkouts(params: any): Promise<string> {
    const response = await axios.get(`${this.baseURL}/v1/workouts`, {
      headers: this.headers,
      params,
    });

    const { workouts = [], page: currentPage, page_count } = response.data;

    const workoutDetails = workouts.map((workout: any) => {
      const { id, title, start_time, exercises = [] } = workout;
      const exerciseSummaries = exercises.slice(0, 3).map((ex: any) => {
        const { title, exercise_template_id, sets = [] } = ex;
        const setCount = sets.length;
        let setInfo = '';
        if (sets[0]) {
          const { weight_kg, reps, duration_seconds } = sets[0];
          if (weight_kg) {
            setInfo += `${weight_kg}kg `;
          }
          if (reps) {
            setInfo += `x ${reps} reps`;
          }
          if (duration_seconds) {
            setInfo += `for ${duration_seconds}s`;
          }
        }
        return `${title} (ID: ${exercise_template_id}, ${setCount} sets${setInfo ? `, e.g. ${setInfo}` : ''})`;
      });

      const exerciseSummary =
        exerciseSummaries.join(', ') +
        (exercises.length > 3 ? ` ... and ${exercises.length - 3} more exercises` : '');

      return `Workout ID: ${id}\nTitle: ${title}\nDate: ${start_time?.split('T')[0]}\nExercises (${exercises.length}): ${exerciseSummary}\n`;
    });

    return workoutDetails.length
      ? `I've fetched ${workouts.length} workouts (page ${currentPage} of ${page_count}):\n\n${workoutDetails.join('\n')}`
      : 'No workouts found.';
  }

  async listRoutines(params: any): Promise<string> {
    const response = await axios.get(`${this.baseURL}/v1/routines`, {
      headers: this.headers,
      params,
    });

    const { routines = [], page, page_count } = response.data;

    const routineDetails = routines.map((routine: any) => {
      const { id, title, exercises = [] } = routine;
      const exerciseTitles = exercises.map((ex: any) => ex.title || 'Unknown');
      const exerciseList = exerciseTitles.length ? exerciseTitles.join(', ') : 'No exercises';

      return `Routine ID: ${id}, Title: ${title}, Exercise count: ${exercises.length}, Exercises: ${exerciseList}`;
    });

    return `I've fetched ${routines.length} routines (page ${page} of ${page_count}):\n${routineDetails.join('\n')}`;
  }

  async createRoutine(params: any): Promise<string> {
    const data = {
      body: [
        {
          name: 'routine',
          value: { ...params, folder_id: null },
        },
      ],
    };

    const response = await axios.post(`${this.baseURL}/v1/routines`, data, {
      headers: this.headers,
    });

    const { id, title = params.title || 'Untitled' } = response.data;
    return `I've created the routine with id '${id}' title '${title}'`;
  }

  async deleteRoutine(routineId: string): Promise<string> {
    await axios.delete(`${this.baseURL}/v1/routines/${routineId}`, {
      headers: this.headers,
    });
    return `Routine with ID '${routineId}' has been successfully deleted.`;
  }

  async listExerciseTemplates(params: any): Promise<string> {
    const response = await axios.get(`${this.baseURL}/v1/exercise_templates`, {
      headers: this.headers,
      params,
    });

    const { exercise_templates: templates = [], page, page_count } = response.data;

    const templateDetails = templates.map((template: any) => {
      const { id, title, equipment_type, muscle_groups = [] } = template;
      const primaryMuscle = muscle_groups[0] || 'Unknown';

      return `ID: ${id}, Title: ${title}, Equipment: ${equipment_type}, Primary Muscle: ${primaryMuscle}`;
    });

    return templateDetails.length
      ? `I've fetched ${templates.length} exercise templates (page ${page} of ${page_count}):\n\n${templateDetails.join('\n')}`
      : 'No exercise templates found.';
  }

  async getExerciseTemplate(templateId: string): Promise<string> {
    const response = await axios.get(`${this.baseURL}/v1/exercise_templates/${templateId}`, {
      headers: this.headers,
    });

    const {
      id,
      title = 'Untitled',
      type: exerciseType = 'Unknown',
      primary_muscle_group = 'Unknown',
      secondary_muscle_groups = [],
      is_custom = false,
    } = response.data;

    const secondaryMusclesFormatted = secondary_muscle_groups.length
      ? secondary_muscle_groups.join(', ')
      : 'None';

    return (
      `Exercise Template Details:\n` +
      `ID: ${id}\n` +
      `Title: ${title}\n` +
      `Type: ${exerciseType}\n` +
      `Primary Muscle Group: ${primary_muscle_group}\n` +
      `Secondary Muscle Groups: ${secondaryMusclesFormatted}\n` +
      `Custom Exercise: ${is_custom ? 'Yes' : 'No'}`
    );
  }

  private functionMap: Record<string, (params: any) => Promise<string>> = {
    get_workout: (params) => this.getWorkout(params.workout_id),
    list_workouts: (params) => this.listWorkouts(params),
    list_routines: (params) => this.listRoutines(params),
    create_routine: (params) => this.createRoutine(params),
    delete_routine: (params) => this.deleteRoutine(params.routine_id),
    list_exercise_templates: (params) => this.listExerciseTemplates(params),
    get_exercise_template: (params) => this.getExerciseTemplate(params.exercise_template_id),
  };

  async runSkill(actionName: string, parameters: any): Promise<string> {
    const func = this.functionMap[actionName];
    if (!func) {
      return `Unknown action: ${actionName} no action found`;
    }
    return func(parameters);
  }
}
