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

const HabitSchema = z.object({
  name: z.string(),
  points: z.number(),
  penalty: z.number(),
});

const DailyProductivityScoreInputSchema = z.object({
  allHabits: z.array(HabitSchema).describe('A list of all possible habits for the day.'),
  completedHabitNames: z
    .array(z.string())
    .describe('An array of names of habits completed on a given day.'),
});
export type DailyProductivityScoreInput = z.infer<
  typeof DailyProductivityScoreInputSchema
>;

const DailyProductivityScoreOutputSchema = z.object({
  score: z
    .number()
    .describe(
      'The calculated daily productivity score based on completed habits and penalties for missed habits.'
    ),
  reasoning: z
    .string()
    .describe(
      'A short explanation of how the score was calculated, considering completed habits, their reward values, and any penalties incurred.'
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
  prompt: `You are an AI assistant designed to evaluate a user's daily productivity score.

Calculate the total score based on the following:
1. Sum the points for all completed habits.
2. Identify any habits with a penalty that were NOT completed.
3. Subtract the penalties for all missed habits from the total score.

Here is the list of all habits for the day:
{{#each allHabits}}
- {{this.name}}: {{this.points}} points ({{this.penalty}} penalty)
{{/each}}

Here are the completed habits:
{{#if completedHabitNames}}
  {{#each completedHabitNames}}
  - {{this}}
  {{/each}}
{{else}}
  None
{{/if}}

Calculate the final score and provide a brief, encouraging reasoning.
For example: "You earned X points for completing habits, but lost Y points in penalties. Keep it up!" or "Great job completing all your habits for a total of Z points!".

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
