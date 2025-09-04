'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating motivational quotes related to user habits.
 *
 * The flow takes a list of habits as input and returns a motivational quote related to one of the habits.
 *
 * @interface MotivationalQuotesInput - Defines the input schema for the motivationalQuotes function.
 * @interface MotivationalQuotesOutput - Defines the output schema for the motivationalQuotes function.
 * @function motivationalQuotes - The main function that calls the motivationalQuotesFlow with the input and returns the output.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MotivationalQuotesInputSchema = z.object({
  habits: z
    .array(z.string())
    .describe('An array of habits that the user is tracking.'),
});
export type MotivationalQuotesInput = z.infer<typeof MotivationalQuotesInputSchema>;

const MotivationalQuotesOutputSchema = z.object({
  quote: z.string().describe('A motivational quote related to one of the habits.'),
});
export type MotivationalQuotesOutput = z.infer<typeof MotivationalQuotesOutputSchema>;

export async function motivationalQuotes(input: MotivationalQuotesInput): Promise<MotivationalQuotesOutput> {
  return motivationalQuotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'motivationalQuotesPrompt',
  input: {schema: MotivationalQuotesInputSchema},
  output: {schema: MotivationalQuotesOutputSchema},
  prompt: `You are a motivational speaker. Generate a motivational quote that encourages the user to continue building good habits.

  The user is tracking the following habits: {{#each habits}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.

  The quote should be related to one or more of these habits.

  Keep the quote short and impactful.`,
});

const motivationalQuotesFlow = ai.defineFlow(
  {
    name: 'motivationalQuotesFlow',
    inputSchema: MotivationalQuotesInputSchema,
    outputSchema: MotivationalQuotesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
