import { generateText, streamText } from 'ai';
import { createStreamableValue } from 'ai/rsc';
import { createGroq } from '@ai-sdk/groq';
import { kv } from '@vercel/kv';
import { Ratelimit } from '@upstash/ratelimit';
import { AI_TEXT_GENERATION_ENABLED, HAS_VERCEL_KV } from '@/site/config';
import { removeBase64Prefix } from '@/utility/image';
import { cleanUpAiTextResponse } from '@/photo/ai';

const RATE_LIMIT_IDENTIFIER = 'groq-image-query';
const RATE_LIMIT_MAX_QUERIES_PER_HOUR = 100;
// Vision model for image understanding; can be overridden in future if needed
const MODEL = 'llama-3.2-11b-vision-preview';

const groq = AI_TEXT_GENERATION_ENABLED
  ? createGroq({ apiKey: process.env.GROQ_API_KEY })
  : undefined;

const ratelimit = HAS_VERCEL_KV
  ? new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(RATE_LIMIT_MAX_QUERIES_PER_HOUR, '1h'),
  })
  : undefined;

// Allows 100 requests per hour
const checkRateLimitAndBailIfNecessary = async () => {
  if (ratelimit) {
    let success = false;
    try {
      success = (await ratelimit.limit(RATE_LIMIT_IDENTIFIER)).success;
    } catch (e: any) {
      console.error('Failed to rate limit Groq', e);
      throw new Error('Failed to rate limit Groq');
    }
    if (!success) {
      console.error('Groq rate limit exceeded');
      throw new Error('Groq rate limit exceeded');
    }
  }
};

// Keep types loose to avoid provider version mismatches in transitive deps
type AnyArgs = any;

const getImageTextArgs = (
  imageBase64: string,
  query: string,
): AnyArgs | undefined => groq ? {
  model: groq(MODEL),
  messages: [{
    'role': 'user',
    'content': [
      {
        'type': 'text',
        'text': query,
      }, {
        'type': 'image',
        'image': removeBase64Prefix(imageBase64),
      },
    ],
  }],
} : undefined;

export const streamGroqImageQuery = async (
  imageBase64: string,
  query: string,
) => {
  await checkRateLimitAndBailIfNecessary();

  const stream = createStreamableValue('');

  const args = getImageTextArgs(imageBase64, query) as AnyArgs;

  if (args) {
    (async () => {
      const { textStream } = await streamText(args);
      for await (const delta of textStream) {
        stream.update(cleanUpAiTextResponse(delta));
      }
      stream.done();
    })();
  }

  return stream.value;
};

export const generateGroqImageQuery = async (
  imageBase64: string,
  query: string,
) => {
  await checkRateLimitAndBailIfNecessary();

  const args = getImageTextArgs(imageBase64, query) as AnyArgs;

  if (args) {
    return generateText(args)
      .then(({ text }) => cleanUpAiTextResponse(text));
  }
};

export const testGroqConnection = async () => {
  await checkRateLimitAndBailIfNecessary();

  if (groq) {
    return generateText({
      model: groq(MODEL),
      messages: [{
        'role': 'user',
        'content': [
          {
            'type': 'text',
            'text': 'Test connection',
          },
        ],
      }],
    });
  }
};
