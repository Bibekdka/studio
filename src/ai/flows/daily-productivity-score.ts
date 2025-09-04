'use server';

/**
 * @fileOverview Generates a daily productivity score based on completed habits and reward system.
 *
 * - generateDailyProductivityScore - A function that generates the daily productivity score.
 * - DailyProductivityScoreInput - The input type for the generateDailyProductivityScore function.
 * - DailyProductivityScoreOutput - The return type for the generateDailyProductivityScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DailyProductivityScoreInputSchema = z.object({
  completedHabits: z
    .array(z.string())
    .describe('An array of names of habits completed on a given day.'),
  rewardSystem: z
    .record(z.string(), z.number())
    .describe(
      'A key-value object defining the reward (point) value for each habit. Keys are habit names and values are the corresponding point values.'
    ),
});
export type DailyProductivityScoreInput = z.infer<
  typeof DailyProductivityScoreInputSchema
>;

const DailyProductivityScoreOutputSchema = z.object({
  score: z
    .number()
    .describe(
      'The calculated daily productivity score based on completed habits and the reward system.'
    ),
  reasoning: z
    .string()
    .describe(
      'A short explanation of how the score was calculated, considering the completed habits and their associated reward values.'
    ),
});
export type DailyProductivityScoreOutput = z.infer<
  typeof DailyProductivityScoreOutputSchema
>;

export async function generateDailyProductivityScore(
  input: DailyProductivityScoreInput
): Promise<DailyProductivityScoreOutput> {
  return dailyProductivityScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dailyProductivityScorePrompt',
  input: {schema: DailyProductivityScoreInputSchema},
  output: {schema: DailyProductivityScoreOutputSchema},
  prompt: `You are an AI assistant designed to evaluate a user\'s daily productivity score based on their completed habits and a pre-defined reward system.

  Given the following completed habits:
  {{#each completedHabits}}
  - {{this}}
  {{/each}}

  And the following reward system:
  {{#each rewardSystem}}
  - {{@key}}: {{this}} points
  {{/each}}

  Calculate the total productivity score by summing the point values of the completed habits.
  Also, provide a brief reasoning for the calculated score.
  For example: \"The user achieved a score of X, calculated by summing the points for habit A (Y points) and habit B (Z points).\"

  Return the score and reasoning in the format specified by the output schema.
`,
});

const dailyProductivityScoreFlow = ai.defineFlow(
  {
    name: 'dailyProductivityScoreFlow',
    inputSchema: DailyProductivityScoreInputSchema,
    outputSchema: DailyProductivityScoreOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
